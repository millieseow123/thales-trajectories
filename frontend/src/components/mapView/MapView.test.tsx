import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapView from './MapView';

describe('MapView', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders the map and flight path', async () => {
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

        render(<MapView />);
        expect(await screen.findByText('Flight 1')).toBeInTheDocument();
        expect(await screen.findByText('WSSS')).toBeInTheDocument();
        expect(await screen.findByText('RJTT')).toBeInTheDocument();
    });

    it('renders empty map if no trajectories returned', async () => {
        globalThis.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        ) as unknown as typeof fetch;

        render(<MapView />);
        expect(await screen.queryByText(/Flight/i)).not.toBeInTheDocument();
    });

    it('shows error if fetch fails', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false })) as unknown as typeof fetch;
        render(<MapView />);
        expect(await screen.findByText(/error/i)).toBeInTheDocument();
    });
});