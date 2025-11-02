import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import VerifyOtp from '../pages/VerifyOtp'
import { verifyOtp } from '../lib/api'

// Mock the API
vi.mock('../lib/api', () => ({
  verifyOtp: vi.fn(),
  setAccessToken: vi.fn()
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('?phone=9876543210')]
  }
})

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

const renderVerifyOtp = () => {
  return render(
    <BrowserRouter>
      <VerifyOtp />
    </BrowserRouter>
  )
}

describe('VerifyOtp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    
    // Setup default mock
    verifyOtp.mockResolvedValue({
      success: true,
      message: 'OTP verified successfully',
      data: {
        accessToken: 'mock-access-token',
        user: {
          _id: 'user-id',
          phone: '9876543210',
          role: 'USER'
        }
      }
    })
  })

  it('should render OTP verification form', () => {
    renderVerifyOtp()
    
    expect(screen.getByText(/verify otp/i)).toBeInTheDocument()
    expect(screen.getByText(/9876543210/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
  })

  it('should show OTP input fields', () => {
    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    expect(otpInput).toBeInTheDocument()
  })

  it('should call verifyOtp API on valid OTP submission', async () => {
    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    // Enter valid OTP
    fireEvent.change(otpInput, { target: { value: '123456' } })
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalledWith('9876543210', '123456')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error for invalid OTP', async () => {
    verifyOtp.mockRejectedValue({
      message: 'Invalid OTP',
      statusCode: 400
    })

    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    fireEvent.change(otpInput, { target: { value: '000000' } })
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid otp/i)).toBeInTheDocument()
    })
  })

  it('should show error for expired OTP', async () => {
    verifyOtp.mockRejectedValue({
      message: 'OTP expired',
      statusCode: 410
    })

    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    fireEvent.change(otpInput, { target: { value: '123456' } })
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/expired/i)).toBeInTheDocument()
    })
  })

  it('should disable verify button when OTP is empty', () => {
    renderVerifyOtp()
    
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    expect(verifyButton).toBeDisabled()
  })

  it('should enable verify button when OTP is entered', () => {
    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    fireEvent.change(otpInput, { target: { value: '123456' } })
    
    expect(verifyButton).not.toBeDisabled()
  })

  it('should show loading state during verification', async () => {
    verifyOtp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    fireEvent.change(otpInput, { target: { value: '123456' } })
    fireEvent.click(verifyButton)
    
    // Check loading state
    expect(verifyButton).toBeDisabled()
    
    await waitFor(() => {
      expect(verifyButton).not.toBeDisabled()
    })
  })

  it('should show resend button with cooldown timer', () => {
    renderVerifyOtp()
    
    // Initially, resend should be disabled due to cooldown
    const resendButton = screen.getByRole('button', { name: /resend/i })
    expect(resendButton).toBeDisabled()
  })

  it('should navigate to login when back button is clicked', () => {
    renderVerifyOtp()
    
    const backButton = screen.getByText(/change number/i)
    fireEvent.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should display attempts left when verification fails', async () => {
    verifyOtp.mockRejectedValue({
      message: 'Invalid OTP. 3 attempt(s) remaining.',
      statusCode: 400,
      attemptsLeft: 3
    })

    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    fireEvent.change(otpInput, { target: { value: '000000' } })
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/3 attempt/i)).toBeInTheDocument()
    })
  })

  it('should handle account locked error', async () => {
    verifyOtp.mockRejectedValue({
      message: 'Too many failed attempts. Account locked for 15 minutes.',
      statusCode: 403
    })

    renderVerifyOtp()
    
    const otpInput = screen.getByPlaceholderText(/enter the 6-digit code/i)
    const verifyButton = screen.getByRole('button', { name: /verify/i })
    
    fireEvent.change(otpInput, { target: { value: '000000' } })
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/locked/i)).toBeInTheDocument()
    })
  })
})

