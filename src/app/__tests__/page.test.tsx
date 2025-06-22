import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/page'
import { useAuth } from '@/context/auth-context'

// Mock the useAuth hook
jest.mock('@/context/auth-context', () => ({
  useAuth: jest.fn(),
}))

// Mock child components that have their own dependencies (like next/link)
jest.mock('@/components/logo', () => ({
  Logo: () => <div>CyberFeast</div>
}));

jest.mock('@/components/meal-card', () => ({
  MealCard: ({ name }) => <div>{name}</div>
}));


describe('LandingPage', () => {
  it('renders the main headline when user is not logged in', () => {
    // Setup mock return value for useAuth
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    render(<LandingPage />);

    const headline = screen.getByRole('heading', {
      name: /Summon your feast from the future\./i,
    });
    expect(headline).toBeInTheDocument();
    
    // Check for "Get Started" button
    const getStartedButton = screen.getByRole('link', { name: /Get Started/i });
    expect(getStartedButton).toBeInTheDocument();
  });

  it('renders the "Go to Dashboard" button when user is logged in', () => {
    // Setup mock return value for useAuth to simulate a logged-in user
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-user-id' } });

    render(<LandingPage />);
    
    const dashboardButton = screen.getByRole('link', { name: /Go to Dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
  });
});
