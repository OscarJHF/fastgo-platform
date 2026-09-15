import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../components/common/Button';

describe('Button Component', () => {
  it('renders button with label', () => {
    render(<Button>Comprar Ahora</Button>);
    expect(screen.getByRole('button', { name: /Comprar Ahora/i })).toBeInTheDocument();
  });

  it('disables button when disabled or loading', () => {
    render(<Button disabled>Deshabilitado</Button>);
    expect(screen.getByRole('button', { name: /Deshabilitado/i })).toBeDisabled();
  });
});
