import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('Renders navigation bar', () => {
  render(<App />);

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Team Stats')).toBeInTheDocument();

  expect(screen.getByRole('link', { name: 'Main' })).toHaveAttribute(
    'href',
    'https://elvinfeng.com/'
  );
  expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
    'href',
    'https://www.instagram.com/ig.elvin/?hl=en'
  );
});

test('Renders home screen with message board', () => {
  render(<App />);

  expect(screen.getByText(/League Board/)).toBeInTheDocument();

  const name = screen.getByPlaceholderText('Enter name');
  const input = screen.getByPlaceholderText('Type your message here');
  const button = screen.getByText('SEND')
  expect(input).toBeInTheDocument();
  expect(button).toBeInTheDocument();

  fireEvent.change(name, {target: {value: 'Tester'}})
  fireEvent.change(input, {target: {value: 'Test Message'}});
  fireEvent.click(button);
});
