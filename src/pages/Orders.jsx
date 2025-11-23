import { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { useTranslation } from 'react-i18next'
import { Package, FileText, ExternalLink, MapPin, RefreshCw, XCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import ReturnRequestForm from '../components/ReturnRequestForm'

const statusStyles = {
  processing: 'bg-purple-100 text-purple-800',
  'out for delivery': 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const formatStatus = (status, t) => {
  if (!status) return t('orders.unknown')
  const statusMap = {
    'processing': t('orders.processing'),
    'out for delivery': t('orders.outForDelivery'),
    'delivered': t('orders.delivered'),
    'cancelled': t('orders.cancelled'),
    'pending': t('orders.pending'),
    'confirmed': t('orders.confirmed'),
    'shipped': t('orders.shipped')
  }
  return statusMap[status?.toLowerCase()] || status
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

const Orders = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const cancellableStatuses = ['processing', 'out for delivery']
  
  const returnStatusConfig = {
    pending: { label: t('orders.returnPending'), color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: t('orders.returnApproved'), color: 'bg-blue-100 text-blue-800' },
    rejected: { label: t('orders.returnRejected'), color: 'bg-red-100 text-red-800' },
    pickup_scheduled: { label: t('orders.pickupScheduled'), color: 'bg-indigo-100 text-indigo-800' },
    picked_up: { label: t('orders.pickedUp'), color: 'bg-purple-100 text-purple-800' },
    refund_processed: { label: t('orders.refundProcessed'), color: 'bg-green-100 text-green-800' },
    completed: { label: t('orders.returnCompleted'), color: 'bg-green-100 text-green-800' },
    cancelled: { label: t('orders.returnCancelled'), color: 'bg-gray-100 text-gray-800' }
  }
  
  const { data, isLoading, error, refetch } = useQuery(
    ['my-orders'],
    async () => {
      const response = await api.get('/orders/my-orders')
      return response.data?.data || []
    },
    {
      onError: (err) => {
        console.error('Orders fetch error:', err)
        toast.error(err?.message || t('orders.failedToLoad'))
      },
      refetchOnWindowFocus: false
    }
  )

  const { data: returnsData } = useQuery(
    ['my-returns-summary'],
    async () => {
      const response = await api.get('/returns/my-returns')
      return response.data?.data || []
    },
    {
      refetchOnWindowFocus: false
    }
  )


  const returnsByOrder = useMemo(() => {
    if (!returnsData) return {}
    const map = {}
    returnsData.forEach((ret) => {
      const orderRef = ret.order?._id || ret.order
      if (orderRef) {
        map[orderRef.toString()] = ret
      }
    })
    return map
  }, [returnsData])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('orders.noOrders')}</h2>
          <p className="text-gray-600 mb-6">{t('orders.noOrdersDescription')}</p>
          <button
            onClick={() => navigate('/products')}
            className="inline-block px-6 py-3 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
          >
            {t('orders.startShopping')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('orders.title')}</h1>
        <p className="mt-2 text-gray-600">{t('orders.trackStatus')}</p>
      </div>

      <div className="space-y-4">
        {data.map((order) => {
          const orderKey = order._id?.toString?.() || order._id
          const associatedReturn = orderKey ? returnsByOrder[orderKey] : null
          const returnStatus = associatedReturn ? (returnStatusConfig[associatedReturn.status] || returnStatusConfig.pending) : null

          return (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('orders.orderId')}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {order.orderNumber || order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">
                  {t('orders.placedOn')} {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusStyles[order.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {formatStatus(order.status, t)}
                </span>
                {order.prescriptionUrl && (
                  <a
                    href={order.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-medical-600 hover:text-medical-700"
                  >
                    <FileText size={16} />
                    {t('orders.viewPrescription')}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            {associatedReturn && (
              <div className="border border-dashed border-medical-200 rounded-lg p-4 bg-medical-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('orders.returnRequest')}</p>
                    <p className="text-xs text-gray-500">
                      {t('orders.returnNumber')}{associatedReturn.returnNumber} • {t('orders.requestedOn')}{' '}
                      {new Date(associatedReturn.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${returnStatus?.color}`}>
                      {returnStatus?.label}
                    </span>
                    <button
                      onClick={() => navigate('/returns')}
                      className="text-sm font-medium text-medical-600 hover:text-medical-700"
                    >
                      {t('orders.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name || item.product?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('orders.qty')} {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => navigate(`/orders/${order._id}/track`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-colors"
                >
                  <MapPin size={18} />
                  {t('orders.trackOrder')}
                </button>
                {order.status === 'delivered' && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowReturnForm(true)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RefreshCw size={18} />
                    {t('orders.returnRefund')}
                  </button>
                )}
                {cancellableStatuses.includes(order.status?.toLowerCase()) && (
                  <button
                    onClick={() => {
                      setCancelOrderTarget(order)
                      setCancelReason('')
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={18} />
                    {t('orders.cancelOrder')}
                  </button>
                )}
                {order.prescriptionUrl && (
                  <a
                    href={order.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-medical-600 hover:text-medical-700"
                  >
                    <FileText size={16} />
                    {t('orders.viewPrescription')}
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <div className="text-sm text-gray-600">
                  {t('orders.paymentMethod')} <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                  <span className="ml-4">
                    {t('orders.paymentStatus')} <span className="font-medium text-gray-900">{order.paymentStatus}</span>
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {t('orders.total')}: {formatCurrency(order.totalAmount || order.total)}
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>

      {showReturnForm && selectedOrder && (
        <ReturnRequestForm
          order={selectedOrder}
          onClose={() => {
            setShowReturnForm(false)
            setSelectedOrder(null)
          }}
        />
      )}

      {cancelOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{t('orders.cancelOrderTitle')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('orders.cancelOrderDescription')}{' '}
                  <span className="font-medium">
                    {cancelOrderTarget.orderNumber || cancelOrderTarget._id.slice(-8).toUpperCase()}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setCancelOrderTarget(null)
                  setCancelReason('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {t('orders.cancellationReason')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 focus:ring-medical-500 focus:border-medical-500 text-sm p-3"
                placeholder={t('orders.cancellationReasonPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('orders.cancellationReasonHint')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setCancelOrderTarget(null)
                  setCancelReason('')
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isCancelling}
              >
                {t('orders.keepOrder')}
              </button>
              <button
                onClick={async () => {
                  const reason = cancelReason.trim()
                  if (reason.length < 10) {
                    toast.error(t('orders.reasonMinLength'))
                    return
                  }
                  setIsCancelling(true)
                  try {
                    await api.post(`/orders/${cancelOrderTarget._id}/cancel`, { reason })
                    toast.success(t('orders.orderCancelledSuccess'))
                    setCancelOrderTarget(null)
                    setCancelReason('')
                    await refetch()
                  } catch (err) {
                    console.error('Cancel order error:', err)
                    toast.error(err?.response?.data?.message || t('orders.failedToCancel'))
                  } finally {
                    setIsCancelling(false)
                  }
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isCancelling}
              >
                {isCancelling ? t('orders.cancelling') : t('orders.confirmCancellation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders