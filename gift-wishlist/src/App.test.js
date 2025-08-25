import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header', () => {
  render(<App />);
  const headerElement = screen.getByRole('heading', {
    name: /Geschenke für Eddy und Joanne/i,
  });
  expect(headerElement).toBeInTheDocument();
});
