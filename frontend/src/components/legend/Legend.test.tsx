import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest';;
import Legend from './Legend';

describe('Legend component', () => {
    it('renders all legend items', () => {
        render(<Legend />);
        expect(screen.getByText(/Legend/i)).toBeInTheDocument();
        expect(screen.getByText(/Departure Airport/i)).toBeInTheDocument();
        expect(screen.getByText(/Arrival Airport/i)).toBeInTheDocument();
        expect(screen.getByText(/ICAO Code/i)).toBeInTheDocument();
        expect(screen.getByText('WSSS')).toBeInTheDocument();
    });

    it('does not render unrelated text', () => {
        render(<Legend />);
        expect(screen.queryByText(/Random Airport/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/FooBar/i)).not.toBeInTheDocument();
    });
});