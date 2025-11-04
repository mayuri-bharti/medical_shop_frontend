# Frontend Tests

Tests for the Medical Shop frontend using Vitest and React Testing Library.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Structure

- `setup.js` - Test setup and configuration
- `Login.test.jsx` - Login component tests
- `VerifyOtp.test.jsx` - OTP verification component tests

## Test Coverage

Tests cover:
- Component rendering
- User interactions (clicks, input changes)
- API calls and error handling
- Form validation
- Navigation and routing
- Loading states

## Notes

- Tests use jsdom environment for DOM simulation
- React Router is mocked for navigation testing
- API calls are mocked to prevent actual HTTP requests
- react-hot-toast is mocked to prevent toast notifications during tests










