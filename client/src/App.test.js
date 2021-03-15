import { render, screen } from '@testing-library/react';
import { useQueryClient, useIsFetching } from 'react-query';
import App from './App';
import MessageBoard from './components/MessageBoard';

test('Renders home page with message board', () => {
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

  expect(screen.getByText(/League Board/)).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText('Type your message here')
  ).toBeInTheDocument();
  expect(screen.getByText('SEND')).toBeInTheDocument();
});

test('Renders messages onto message board', () => {
  //jest.mock('react-query');

  render(<MessageBoard />);
  screen.getByRole('list');
});
