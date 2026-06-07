import React, { useState, useRef, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import locales from '../locales'

const HelpCenterWidget = ({ lang = 'id', isOpen = false, setIsOpen = () => {} }) => {
  const t = locales[lang]
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: t.help_system_welcome,
      timestamp: new Date(),
    },
  ])
  const chatBodyRef = useRef(null)

  // Initialize EmailJS (only once)
  useEffect(() => {
    emailjs.init('UuvQcw1NLismLpZ60')
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setMessage('')
    setIsSending(true)

    try {
      // Send email via EmailJS
      const templateParams = {
        name: 'Pengguna UMKM Inventra (Guest)',
        message: message,
        email: 'no-reply@umkminventra.com',
      }

      const response = await emailjs.send(
        'Gmail_API',
        'personal_service',
        templateParams
      )

      if (response.status === 200) {
        // Show success notification
        setShowSuccess(true)
        setSuccessMessage(t.help_sent || 'Pesan terkirim!')
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Show error notification
      setShowSuccess(true)
      setSuccessMessage(t.help_error || 'Gagal mengirim pesan. Silakan coba lagi.')
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Chat Panel - Single Page Layout */}
      <div className="fixed bottom-[130px] right-6 z-[999] w-[360px] h-[520px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header - Premium Gradient */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 flex-shrink-0 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-5 -mb-5"></div>
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="text-4xl leading-none">👋</div>
            <div>
              <h2 className="text-sm font-bold text-white leading-relaxed">
                Pusat Bantuan
                <br />
                Bagaimana kami dapat membantu?
              </h2>
            </div>
          </div>
        </div>

        {/* Chat Body - Modern Gradient Background */}
        <div
          ref={chatBodyRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-blue-50"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-xl ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1.5 ${
                    msg.type === 'user'
                      ? 'text-blue-100'
                      : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input - Modern Design */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-slate-200 bg-gradient-to-r from-white via-blue-50 to-white p-3 flex-shrink-0"
        >
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder={t.help_placeholder || 'Pesan...'}
                className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 resize-none text-sm transition-all duration-200"
                rows="1"
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 font-semibold shadow-md ${
                message.trim() && !isSending
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
              title={t.help_send_button || 'Kirim pesan'}
            >
              {isSending ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151495 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99021575 L3.03521743,10.4312088 C3.03521743,10.5883061 3.34915502,10.7454035 3.50612381,10.7454035 L16.6915026,11.5308905 C16.6915026,11.5308905 17.1624089,11.5308905 17.1624089,12.0021827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification - Modern Design */}
      {showSuccess && (
        <div className="fixed bottom-[680px] right-6 z-[1000] animate-slide-up">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-6 py-3 text-sm font-semibold shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default HelpCenterWidget

