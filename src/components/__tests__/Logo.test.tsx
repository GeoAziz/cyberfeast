import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/logo'

describe('Logo', () => {
  it('renders the company name', () => {
    render(<Logo />)
    const logoText = screen.getByText(/CyberFeast/i)
    expect(logoText).toBeInTheDocument()
  })
})
