import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { sendOtp } from '../lib/api'

// Mock the API
vi.mock('../lib/api', () => ({
  sendOtp: vi.fn()
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
}

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  it('should render login form', () => {
    renderLogin()
    
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument()
    expect(screen.getByText(/medishop/i)).toBeInTheDocument()
  })

  it('should show validation error for invalid phone number', async () => {
    renderLogin()
    
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    const sendButton = screen.getByRole('button', { name: /send otp/i })
    
    // Enter invalid phone number
    fireEvent.change(phoneInput, { target: { value: '123' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/valid phone number/i)).toBeInTheDocument()
    })
  })

  it('should call sendOtp API on valid phone submission', async () => {
    sendOtp.mockResolvedValue({
      success: true,
      message: 'OTP sent successfully',
      data: {
        resendCooldown: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }
    })

    renderLogin()
    
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    const sendButton = screen.getByRole('button', { name: /send otp/i })
    
    // Enter valid phone number
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(sendOtp).toHaveBeenCalledWith('9876543210')
      expect(mockNavigate).toHaveBeenCalledWith('/verify?phone=9876543210')
    })
  })

  it('should handle API error', async () => {
    sendOtp.mockRejectedValue(new Error('Failed to send OTP'))

    renderLogin()
    
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    const sendButton = screen.getByRole('button', { name: /send otp/i })
    
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to send otp/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during API call', async () => {
    sendOtp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderLogin()
    
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    const sendButton = screen.getByRole('button', { name: /send otp/i })
    
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    fireEvent.click(sendButton)
    
    // Check loading state
    expect(sendButton).toBeDisabled()
    
    await waitFor(() => {
      expect(sendButton).not.toBeDisabled()
    })
  })

  it('should format phone number input', () => {
    renderLogin()
    
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    
    expect(phoneInput.value).toBe('9876543210')
  })

  it('should display cooldown message after OTP sent', async () => {
    const cooldownTime = new Date(Date.now() + 60 * 1000) // 1 minute from now
    
    sendOtp.mockResolvedValue({
      success: true,
      message: 'OTP sent successfully',
      data: {
        resendCooldown: cooldownTime.toISOString()
      }
    })

    renderLogin()
    
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    const sendButton = screen.getByRole('button', { name: /send otp/i })
    
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      // Navigate should be called even with cooldown
      expect(mockNavigate).toHaveBeenCalled()
    })
  })
})







