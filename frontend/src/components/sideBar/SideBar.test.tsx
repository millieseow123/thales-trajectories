import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import L from 'leaflet';
import { CONSTANTS } from '@/constants/text';
import type { Trajectory } from '@shared/types/trajectory';
import Sidebar from './SideBar';

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
        expect(screen.getByText(CONSTANTS.SIDEBAR.TITLE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.SIDEBAR.FLIGHT_ID.LABEL)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(CONSTANTS.SIDEBAR.FLIGHT_ID.PLACEHOLDER)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.SIDEBAR.AIRPORT.LABEL)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.SIDEBAR.TIME.LABEL)).toBeInTheDocument();

        expect(screen.getByLabelText(CONSTANTS.SIDEBAR.TOGGLES.SHOW_ICAO)).toBeInTheDocument();
        expect(screen.getByLabelText(CONSTANTS.SIDEBAR.TOGGLES.SHOW_NAME)).toBeInTheDocument();

        expect(screen.getByText(CONSTANTS.MAP_VIEW.LEGEND_TITLE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.DEPARTURE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.ARRIVAL)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.ICAO_CODE)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.SPEED)).toBeInTheDocument();
        expect(screen.getByText(`<${CONSTANTS.LEGEND.GREEN}`)).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.LEGEND.YELLOW, { exact: false })).toBeInTheDocument();
        expect(screen.getByText(`> ${CONSTANTS.LEGEND.RED}`)).toBeInTheDocument();

        expect(document.querySelector('._greenMarker_ecab79')).toBeInTheDocument();
        expect(document.querySelector('._redMarker_ecab79')).toBeInTheDocument();
        expect(document.querySelector('._icaoBox_ecab79')).toBeInTheDocument();
    });

    it('shows airport filter section when airport collapsible header is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const airportHeader = screen.getByText(CONSTANTS.SIDEBAR.AIRPORT.LABEL);
        expect(screen.queryByText(CONSTANTS.SIDEBAR.AIRPORT.DEPARTURE)).not.toBeInTheDocument();
        fireEvent.click(airportHeader);
        expect(screen.getByText(CONSTANTS.SIDEBAR.AIRPORT.DEPARTURE)).toBeInTheDocument();
    });

    it('shows time filter section when time collapsible header is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const timeHeader = screen.getByText(CONSTANTS.SIDEBAR.TIME.LABEL);
        expect(screen.queryByText(CONSTANTS.SIDEBAR.TIME.QUICK_FILTERS.TODAY)).not.toBeInTheDocument();
        fireEvent.click(timeHeader);
        expect(screen.getByText(CONSTANTS.SIDEBAR.TIME.QUICK_FILTERS.TODAY)).toBeInTheDocument();
    });

    it('calls setShowAirportNames when toggling airport name checkbox', () => {
        render(<Sidebar {...defaultProps} />);
        const checkbox = screen.getByLabelText(CONSTANTS.SIDEBAR.TOGGLES.SHOW_NAME);
        fireEvent.click(checkbox);
        expect(defaultProps.setShowAirportNames).toHaveBeenCalled();
    });

    it('calls setShowIcaoLabels when toggling ICAO code checkbox', () => {
        render(<Sidebar {...defaultProps} />);
        const checkbox = screen.getByLabelText(CONSTANTS.SIDEBAR.TOGGLES.SHOW_ICAO);
        fireEvent.click(checkbox);
        expect(defaultProps.setShowIcaoLabels).toHaveBeenCalled();
    });

    it('calls setStartTime when clicking quick filter buttons', () => {
        render(<Sidebar {...defaultProps} />);
        const timeHeader = screen.getByText(CONSTANTS.SIDEBAR.TIME.LABEL);
        fireEvent.click(timeHeader);

        const todayBtn = screen.getByText(CONSTANTS.SIDEBAR.TIME.QUICK_FILTERS.TODAY);
        fireEvent.click(todayBtn);
        expect(defaultProps.setStartTime).toHaveBeenCalled();
    });

    it('removes sidebar from DOM when close icon is clicked', () => {
        render(<Sidebar {...defaultProps} />);
        const collapseBtn = screen.getByRole('button', { name: /collapse/i })
            || screen.getByAltText(/collapse/i);
        fireEvent.click(collapseBtn);
        expect(screen.queryByText(CONSTANTS.SIDEBAR.TITLE)).not.toBeInTheDocument();
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
        expect(screen.getByText(CONSTANTS.SIDEBAR.TITLE)).toBeInTheDocument();
    });
});