import { render, screen } from '@testing-library/react';
import App from './App';


test('renders title', () => {
  render(<App />);
  const heading = screen.getByText(/Geschenke für Eddy und Joanne/i);
  expect(heading).toBeInTheDocument();
});

