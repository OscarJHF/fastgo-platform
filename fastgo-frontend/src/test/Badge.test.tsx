import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/common/Badge';

describe('Badge Component', () => {
  it('renders badge with children text', () => {
    render(<Badge variant="success">Entregado</Badge>);
    expect(screen.getByText(/Entregado/i)).toBeInTheDocument();
  });

  it('applies danger classes correctly', () => {
    const { container } = render(<Badge variant="danger">Cancelado</Badge>);
    expect(container.firstChild).toHaveClass('bg-rose-100');
  });
});
