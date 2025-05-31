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

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTrajectories } from './useTrajectories';
import type { Airport } from '@/utils/loadAirports';

describe('useTrajectories', () => {
    it('fetches and returns trajectory data', async () => {
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 1,
                        adep: 'WSSS',
                        ades: 'RJTT',
                        waypoints: [
                            { latitude: 1.35, longitude: 103.82, time: '2024-01-01T00:00:00Z' },
                            { latitude: 35.55, longitude: 139.77, time: '2024-01-01T06:00:00Z' }
                        ]
                    }
                ])
            })
        ) as unknown as typeof globalThis.fetch);


        const { result } = renderHook(() => useTrajectories());
        await waitFor(() => expect(result.current.loading).toBe(false));
        console.log(">> ", result.current.data.length)
        expect(result.current.data.length).toBeGreaterThan(0);
        expect(result.current.error).toBeNull();
    });

    it('sets error if fetch fails', async () => {
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({ ok: false })
        ) as unknown as typeof globalThis.fetch);

        const { result } = renderHook(() => useTrajectories());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).not.toBeNull();
    });

    it('handles empty trajectory data', async () => {
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        ) as unknown as typeof globalThis.fetch);

        const { result } = renderHook(() => useTrajectories());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('handles malformed trajectory data by removing the entire line', async () => {
        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([
                    {
                        id: 1, adep: 'WSSS', ades: 'RJTT', waypoints: [
                            { latitude: 1.35, longitude: 103.82, time: '2024-01-01T00:00:00Z' }
                        ]
                    },
                    { id: 2 }
                ])
            })
        ) as unknown as typeof globalThis.fetch);

        const { result } = renderHook(() => useTrajectories());
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data.length).toBe(1);
    });
});