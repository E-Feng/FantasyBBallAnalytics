import { render, screen } from '@testing-library/react';
import App from './App';

test('Renders home page with message board', () => {
  render(<App />);

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Team Stats')).toBeInTheDocument();

  expect(screen.getByText('github')).toBeInTheDocument();

  expect(screen.getByText(/League Board/)).toBeInTheDocument();
  expect(screen.getByText('SEND')).toBeInTheDocument();
});
