
import React from 'react';
import { render, screen } from '@testing-library/react';


describe('Sample Test', () => {
  it('renders a heading', () => {
    render(<h1>Hello Test</h1>);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});
