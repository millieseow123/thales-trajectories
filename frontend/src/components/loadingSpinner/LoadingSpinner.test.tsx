import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders the spinner container', () => {
        render(<LoadingSpinner />);
        const container = screen.getByTestId('spinner');
        expect(container).toBeInTheDocument();
    });

    it('does not render unrelated text', () => {
        render(<LoadingSpinner />);
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    });
});