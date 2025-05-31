import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './SideBar';
import type { Trajectory } from '@shared/types/trajectory';
import L from 'leaflet';

const mockTrajectories: Trajectory[] = [
    {
        id: 1,
        adep: 'WSSS',
        ades: 'RJTT',
        waypoints: [
            { latitude: 1.35, longitude: 103.82, time: '2024-01-01T00:00:00Z' },
            { latitude: 35.55, longitude: 139.77, time: '2024-01-01T06:00:00Z' }
        ],
        inferredAdep: 'WSSS',
        inferredAdes: 'RJTT',
        inferredAdepName: 'Singapore Changi',
        inferredAdesName: 'Tokyo Haneda',
        adepCountry: 'Singapore',
        adesCountry: 'Japan',
        adepIATA: 'SIN',
        adesIATA: 'HND',
        inferredAdepCoords: [1.35, 103.82],
        inferredAdesCoords: [35.55, 139.77]
    }
];

describe('Sidebar', () => {
    const defaultProps = {
        mapRef: { current: null } as React.RefObject<L.Map | null>,
        zoomLevel: 8,
        flightIdFilter: '',
        setFlightIdFilter: vi.fn(),
        setSelectedFlightId: vi.fn(),
        adepFilter: '',
        setAdepFilter: vi.fn(),
        adesFilter: '',
        setAdesFilter: vi.fn(),
        startTime: null,
        setStartTime: vi.fn(),
        endTime: null,
        setEndTime: vi.fn(),
        trajectories: mockTrajectories,
        showAirportNames: false,
        setShowAirportNames: vi.fn(),
        showIcaoLabels: false,
        setShowIcaoLabels: vi.fn(),
    };

    it('renders all filter sections and legend', () => {
        render(<Sidebar {...defaultProps} />);
        expect(screen.getByText(/Find Flights/i)).toBeInTheDocument();
        expect(screen.getByText(/By Flight ID:/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search Flight ID/i)).toBeInTheDocument();
        expect(screen.getByText(/By Airport:/i)).toBeInTheDocument();
        expect(screen.getByText(/By Time:/i)).toBeInTheDocument();

        expect(screen.getByText(/Today/i)).toBeInTheDocument();
        expect(screen.getByText(/Last 1h/i)).toBeInTheDocument();
        expect(screen.getByText(/Last 24h/i)).toBeInTheDocument();

        expect(screen.getByPlaceholderText(/Start Time/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/End Time/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/ICAO Airport Code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Show Airport Name/i)).toBeInTheDocument();

        expect(screen.getByText(/Legend/i)).toBeInTheDocument();
        expect(screen.getByText(/Departure Airport/i)).toBeInTheDocument();
        expect(screen.getByText(/Arrival Airport/i)).toBeInTheDocument();
        expect(screen.getByText(/ICAO Code/i)).toBeInTheDocument();

        expect(document.querySelector('._greenMarker_ecab79')).toBeInTheDocument();
        expect(document.querySelector('._redMarker_ecab79')).toBeInTheDocument();
        expect(document.querySelector('._icaoBox_ecab79')).toBeInTheDocument();
    });

    it('calls setShowAirportNames when toggling airport name checkbox', () => {
        render(<Sidebar {...defaultProps} />);
        const checkbox = screen.getByLabelText(/Show Airport Name/i);
        fireEvent.click(checkbox);
        expect(defaultProps.setShowAirportNames).toHaveBeenCalled();
    });

    it('calls setShowIcaoLabels when toggling ICAO code checkbox', () => {
        render(<Sidebar {...defaultProps} />);
        const checkbox = screen.getByLabelText(/ICAO Airport Code/i);
        fireEvent.click(checkbox);
        expect(defaultProps.setShowIcaoLabels).toHaveBeenCalled();
    });

    it('calls setStartTime when clicking quick filter buttons', () => {
        render(<Sidebar {...defaultProps} />);
        const todayBtn = screen.getByText(/Today/i);
        fireEvent.click(todayBtn);
        expect(defaultProps.setStartTime).toHaveBeenCalled();
    });

    it('removes sidebar from DOM when close icon is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const collapseBtn = screen.getByRole('button', { name: /collapse/i })
            || screen.getByAltText(/collapse/i);
        fireEvent.click(collapseBtn);
        expect(screen.queryByText(/Find Flights/i)).not.toBeInTheDocument();
    });

    it('calls all reset functions when Reset Filters is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const resetBtn = screen.getByRole('button', { name: /reset filters/i })
            || screen.getByText(/reset filters/i);
        fireEvent.click(resetBtn);
        expect(defaultProps.setFlightIdFilter).toHaveBeenCalledWith('');
        expect(defaultProps.setAdepFilter).toHaveBeenCalledWith('');
        expect(defaultProps.setAdesFilter).toHaveBeenCalledWith('');
        expect(defaultProps.setStartTime).toHaveBeenCalledWith(null);
        expect(defaultProps.setEndTime).toHaveBeenCalledWith(null);
    });

    it('renders without crashing when trajectories is empty', () => {
        render(<Sidebar {...defaultProps} trajectories={[]} />);
        expect(screen.getByText(/Find Flights/i)).toBeInTheDocument();
    });
});