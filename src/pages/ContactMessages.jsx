import { useState } from 'react'
import { useQuery } from 'react-query'
import { api } from '../services/api'
import { MessageCircle, Mail, Phone, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ContactMessages = () => {
  const { data: messagesData, isLoading, refetch } = useQuery(
    'userContactMessages',
    () => api.get('/contact/my-messages').then(res => res.data),
    {
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to fetch messages'
        if (error.response?.status !== 401) {
          toast.error(message)
        }
      }
    }
  )

  const messages = messagesData?.data || []

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'in_progress':
        return <Clock size={16} className="text-blue-600" />
      case 'new':
        return <AlertCircle size={16} className="text-yellow-600" />
      default:
        return <MessageCircle size={16} className="text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'new':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Contact Messages</h1>
          <p className="text-gray-600 mt-2">View your enquiries and responses from our support team</p>
        </div>

        {messages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-6">You haven't contacted us yet. Visit our contact page to send us a message.</p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(message.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {message.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {message.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {message.email}
                            </span>
                          )}
                          {message.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {message.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(message.status)}`}>
                        {message.status?.replace('_', ' ') || 'new'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your Message:</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>

                  {/* Admin Reply */}
                  {message.adminReply ? (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <p className="text-sm font-semibold text-green-700">Response from Support Team</p>
                        {message.repliedAt && (
                          <span className="text-xs text-gray-500">
                            ({formatDate(message.repliedAt)})
                          </span>
                        )}
                      </div>
                      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                        <p className="text-gray-800 whitespace-pre-wrap">{message.adminReply}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>Waiting for response from support team...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactMessages


