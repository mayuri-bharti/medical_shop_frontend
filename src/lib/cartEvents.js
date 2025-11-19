export const CART_UPDATED_EVENT = 'cart-updated'

export const normalizeCartData = (payload) => {
  if (!payload) return null

  if (Array.isArray(payload.items)) {
    return payload
  }

  if (payload?.data?.items) {
    return payload.data
  }

  if (payload?.data?.cart?.items) {
    return payload.data.cart
  }

  if (payload?.cart?.items) {
    return payload.cart
  }

  if (Array.isArray(payload?.data)) {
    return { items: payload.data }
  }

  return null
}

export const calculateCartItemCount = (cartData) => {
  if (!cartData?.items?.length) {
    return 0
  }

  return cartData.items.reduce((sum, item) => {
    const qty = Number(item?.quantity ?? 0)
    return sum + (Number.isFinite(qty) ? qty : 0)
  }, 0)
}

export const broadcastCartUpdate = (payload, fallbackCount = null) => {
  if (typeof window === 'undefined') {
    return
  }

  const detail = {}
  const cartData = normalizeCartData(payload)
  const computedCount = fallbackCount ?? calculateCartItemCount(cartData)

  if (cartData) {
    detail.cart = cartData
  }

  if (Number.isFinite(computedCount)) {
    detail.count = computedCount
  }

  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail }))
}





