import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest';;
import Legend from './Legend';
import { CONSTANTS } from '@/constants/text';

describe('Legend component', () => {
    it('renders all legend items', () => {
        render(<Legend />);
        expect(screen.getByText(CONSTANTS.LEGEND.TITLE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.DEPARTURE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.ARRIVAL)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.ICAO_CODE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.SAMPLE_ICAO)).toBeInTheDocument();
    });

    it('does not render unrelated text', () => {
        render(<Legend />);
        expect(screen.queryByText(/Random Airport/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/FooBar/i)).not.toBeInTheDocument();
    });
});