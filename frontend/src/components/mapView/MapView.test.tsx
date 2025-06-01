const mockAirports: Airport[] = [
    { icao: 'WSSS', name: 'Singapore Changi', country: 'Singapore', iata: 'SIN', lat: 1.35, lon: 103.82 },
    { icao: 'RJTT', name: 'Tokyo Haneda', country: 'Japan', iata: 'HND', lat: 35.55, lon: 139.77 }
];

vi.mock('@/utils/loadAirports', () => ({
    loadAirports: vi.fn(() => Promise.resolve(mockAirports)),
    getIcaoToCoordsMap: vi.fn(() => ({
        WSSS: [1.35, 103.82],
        RJTT: [35.55, 139.77]
    })),
    getNearestAirport: vi.fn(() => mockAirports[0])
}));

vi.mock('@/utils/icao', () => ({
    isICAO: (code: string) => code.length === 4
}));

import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CONSTANTS } from '@/constants/text';
import type { Airport } from '@/utils/loadAirports';
import MapView from './MapView';

describe('MapView', () => {
    beforeEach(() => {
        const now = new Date();
        const isoNow = now.toISOString();
        const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();

        globalThis.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve([
                        {
                            id: 1,
                            adep: 'WSSS',
                            ades: 'RJTT',
                            waypoints: [
                                { latitude: 1.35, longitude: 103.82, time: isoNow },
                                { latitude: 35.55, longitude: 139.77, time: sixHoursLater }
                            ]
                        }
                    ])
            })
        ) as unknown as typeof fetch;
    });

    it('renders the map and zoom buttons', async () => {

        render(<MapView />);

        await screen.findByText(CONSTANTS.MAP_VIEW.HINT);
        expect(document.querySelector('.leaflet-container')).toBeInTheDocument();
        expect(screen.getByText(CONSTANTS.SIDEBAR.TITLE)).toBeInTheDocument();
        expect(screen.getByAltText(/Recenter/i)).toBeInTheDocument();
        const zoomInButtons = screen.getAllByTitle(/Zoom in/i);
        expect(zoomInButtons.length).toBeGreaterThan(0);
        const zoomOutButtons = screen.getAllByTitle(/Zoom out/i);
        expect(zoomOutButtons.length).toBeGreaterThan(0);


    });

    it('renders RouteSummary and speed-colored segments when polyline is clicked', async () => {
        render(<MapView />);
        await screen.findAllByRole('img', { hidden: true }); 
        const paths = document.querySelectorAll('path.leaflet-interactive');
        expect(paths.length).toBeGreaterThan(0);

        fireEvent.click(paths[0]);

        expect(await screen.findByText(/Singapore Changi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tokyo Haneda/i)).toBeInTheDocument();

        const selectedSegments = Array.from(document.querySelectorAll('path.leaflet-interactive[stroke]'));
        const uniqueStrokes = Array.from(new Set(selectedSegments.map(path => path.getAttribute('stroke'))));
        expect(uniqueStrokes.length).toBeGreaterThan(1);
    });
    
    it('selects the correct polyline and shows RouteSummary when searching for a flight ID', async () => {
        render(<MapView />);
        await screen.findByText(CONSTANTS.MAP_VIEW.HINT);

        const searchInput = screen.getByPlaceholderText(CONSTANTS.SIDEBAR.FLIGHT_ID.PLACEHOLDER);
        fireEvent.change(searchInput, { target: { value: '1' } });

        const suggestion = await screen.findByText(/#1/i);
        fireEvent.click(suggestion);

        expect(await screen.findByText(/Singapore Changi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tokyo Haneda/i)).toBeInTheDocument();

        const selectedPaths = Array.from(document.querySelectorAll('path.leaflet-interactive'))
            .filter(path => path.getAttribute('stroke-opacity') === '1' || path.getAttribute('stroke-width') === '5');
        expect(selectedPaths.length).toBeGreaterThan(0);
    });

    it('selects the correct polyline and shows RouteSummary when filtering by departure airport', async () => {
        render(<MapView />);
        await screen.findByText(CONSTANTS.MAP_VIEW.HINT);

        const airportHeader = screen.getByText(CONSTANTS.SIDEBAR.AIRPORT.LABEL);
        fireEvent.click(airportHeader);

        const depSelect = screen.getByText(CONSTANTS.SIDEBAR.AIRPORT.DEPARTURE);
        fireEvent.mouseDown(depSelect); 

        const options = await screen.findAllByText(/WSSS/i);
        fireEvent.click(options[0]);

        expect(await screen.findByText(/Singapore Changi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tokyo Haneda/i)).toBeInTheDocument();

        const selectedPaths = Array.from(document.querySelectorAll('path.leaflet-interactive'))
            .filter(path => path.getAttribute('stroke-opacity') === '1' || path.getAttribute('stroke-width') === '5');
        expect(selectedPaths.length).toBeGreaterThan(0);
    });

    it('selects the correct polyline and shows RouteSummary when filtering by time', async () => {
        render(<MapView />);
        await screen.findByText(CONSTANTS.MAP_VIEW.HINT);

        const timeHeader = screen.getByText(CONSTANTS.SIDEBAR.TIME.LABEL);
        fireEvent.click(timeHeader);

        const now = new Date();
        now.setSeconds(0, 0); 

        const formatted = now
            .toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            .replace(',', '');

        const startTimeInput = screen.getByPlaceholderText('Start Time');
        fireEvent.change(startTimeInput, { target: { value: formatted } });
        fireEvent.blur(startTimeInput);

        await screen.findAllByRole('img', { hidden: true });
        const leafletPaths = document.querySelectorAll('path.leaflet-interactive');
        expect(leafletPaths.length).toBeGreaterThan(0);

        fireEvent.click(leafletPaths[0]);

        expect(await screen.findByText(/Singapore Changi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tokyo Haneda/i)).toBeInTheDocument();

        const selectedPaths = Array.from(document.querySelectorAll('path.leaflet-interactive'))
            .filter(path => path.getAttribute('stroke-opacity') === '1' || path.getAttribute('stroke-width') === '5');
        expect(selectedPaths.length).toBeGreaterThan(0);
    });

    it('shows loading spinner while fetching data', async () => {
        render(<MapView />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        await screen.findByText(CONSTANTS.MAP_VIEW.HINT);
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('shows error if fetch fails', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false })) as unknown as typeof fetch;
        render(<MapView />);
        expect(await screen.findByText(/error/i)).toBeInTheDocument();
    });
});