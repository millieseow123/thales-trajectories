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
import { render, screen } from '@testing-library/react';
import MapView from './MapView';
import type { Airport } from '@/utils/loadAirports';

describe('MapView', () => {
    beforeEach(() => {
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
                                { latitude: 1.35, longitude: 103.82 },
                                { latitude: 35.55, longitude: 139.77 }
                            ]
                        }
                    ])
            })
        ) as unknown as typeof fetch;
    });

    it('renders the map and zoom buttons', async () => {

        render(<MapView />);

        await screen.findByText(/Click on a flight route to view its summary/i);
        expect(document.querySelector('.leaflet-container')).toBeInTheDocument();
        expect(screen.getByText(/Find Flights/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Recenter/i)).toBeInTheDocument();
        const zoomInButtons = screen.getAllByTitle(/Zoom in/i);
        expect(zoomInButtons.length).toBeGreaterThan(0);
        const zoomOutButtons = screen.getAllByTitle(/Zoom out/i);
        expect(zoomOutButtons.length).toBeGreaterThan(0);


    });

    it('shows loading spinner while fetching data', async () => {
        render(<MapView />);
        expect(screen.getByTestId('spinner')).toBeInTheDocument();
        await screen.findByText(/Click on a flight route to view its summary/i);
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('shows error if fetch fails', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false })) as unknown as typeof fetch;
        render(<MapView />);
        expect(await screen.findByText(/error/i)).toBeInTheDocument();
    });
});