import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapContainer } from 'react-leaflet';
import { RecenterButton } from './Recenter';

let mockSetView = vi.fn();
vi.mock('react-leaflet', async () => {
    const actual = await vi.importActual<typeof import('react-leaflet')>('react-leaflet');
    return {
        ...actual,
        useMap: () => ({ setView: mockSetView }),
    };
});

function renderWithMap(children: React.ReactNode) {
    return render(
        <MapContainer center={[0, 0]} zoom={2} style={{ height: 400, width: 400 }}>
            {children}
        </MapContainer>
    );
}

describe('RecenterButton', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        mockSetView = vi.fn();
    });

    it('calls geolocation and recenters map on success', () => {
        const mockGetCurrentPosition = vi.fn((success) => {
            success({
                coords: { latitude: 1.23, longitude: 4.56 }
            });
        });
        const originalGeolocation = global.navigator.geolocation;
        Object.defineProperty(global.navigator, 'geolocation', {
            value: { getCurrentPosition: mockGetCurrentPosition },
            configurable: true,
        });
        
        const originalGetCurrentPosition = originalGeolocation?.getCurrentPosition;

        if (originalGeolocation) {
            originalGeolocation.getCurrentPosition = mockGetCurrentPosition;
        }

        renderWithMap(<RecenterButton />);
        fireEvent.click(screen.getByRole('button', { name: /recenter/i }));

        expect(mockGetCurrentPosition).toHaveBeenCalled();
        expect(mockSetView).toHaveBeenCalledWith([1.23, 4.56], 12);

        if (originalGeolocation && originalGetCurrentPosition) {
            originalGeolocation.getCurrentPosition = originalGetCurrentPosition;
        }
    });

    it('shows alert on geolocation error', () => {
        const mockAlert = vi.fn();
        global.alert = mockAlert;

        const mockGetCurrentPosition = vi.fn((_success, error) => {
            error(new Error('fail'));
        });

        const originalGeolocation = global.navigator.geolocation;
        const originalGetCurrentPosition = originalGeolocation?.getCurrentPosition;

        if (originalGeolocation) {
            originalGeolocation.getCurrentPosition = mockGetCurrentPosition;
        }
        renderWithMap(<RecenterButton />);
        fireEvent.click(screen.getByRole('button', { name: /recenter/i }));
        
        expect(mockGetCurrentPosition).toHaveBeenCalled();
        expect(mockAlert).toHaveBeenCalledWith('Unable to fetch your location');

        if (originalGeolocation && originalGetCurrentPosition) {
            originalGeolocation.getCurrentPosition = originalGetCurrentPosition;
        }
    });
});