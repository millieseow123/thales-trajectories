import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrajectoryLayer from './TrajectoryLayer';
import type { Trajectory } from '@shared/types/trajectory';
import { MapContainer } from 'react-leaflet/MapContainer';

const mockTrajectories: Trajectory[] = [
    {
        id: 1,
        adep: 'WSSS',
        ades: 'RJTT',
        waypoints: [
            { latitude: 1.35, longitude: 103.82, time: '2024-01-01T00:00:00Z', altitude: 1000 },
            { latitude: 35.55, longitude: 139.77, time: '2024-01-01T06:00:00Z', altitude: 35000 }
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

describe('TrajectoryLayer', () => {
    const defaultProps = {
        trajectories: mockTrajectories,
        hoveredIdRef: { current: null } as React.RefObject<number | null>,
        forceUpdate: () => { },
        handlePolylineClick: () => { },
        zoomLevel: 8,
        showAirportNames: true,
        setSelectedTrajectory: () => { },
        selectedTrajectoryId: null,
        setSelectedTrajectoryId: () => { },
        showIcaoLabels: true,
    };

    it('renders polylines and markers for trajectories', () => {
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} />
            </MapContainer>
        );
        expect(screen.getByText(/Singapore Changi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tokyo Haneda/i)).toBeInTheDocument();
        expect(screen.getByText(/SIN/i)).toBeInTheDocument();
        expect(screen.getByText(/HND/i)).toBeInTheDocument();

        const greenMarker = document.querySelector('path.leaflet-interactive[fill="#008000"]');
        expect(greenMarker).not.toBeNull();
        expect(greenMarker?.getAttribute('stroke')).toBe('#008000');
        const depIcao = screen.getByText('WSSS');
        expect(depIcao).toBeInTheDocument();
        expect(depIcao.closest('.leaflet-marker-icon')).not.toBeNull();

        const redMarker = document.querySelector('path.leaflet-interactive[fill="#ff2d55"]');
        expect(redMarker).not.toBeNull();
        expect(redMarker?.getAttribute('stroke')).toBe('#ff2d55');
        const arrIcao = screen.getByText('RJTT');
        expect(arrIcao).toBeInTheDocument();
        expect(arrIcao.closest('.leaflet-marker-icon')).not.toBeNull();

        const svgPaths = document.querySelectorAll('path.leaflet-interactive');
        let hasPolylineColor = false;
        svgPaths.forEach(path => {
            const stroke = path.getAttribute('stroke');
            if (stroke === '#ccebbc') {
                hasPolylineColor = true;
            }
        });
        expect(hasPolylineColor).toBe(true);
    });

    it('renders airport name labels when showAirportNames is true', () => {
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} showAirportNames={true} />
            </MapContainer>
        );
        expect(screen.getByText(/Singapore Changi/i)).toBeInTheDocument();
        expect(screen.getByText(/Tokyo Haneda/i)).toBeInTheDocument();
    });

    it('does not render airport name labels when showAirportNames is false', () => {
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} showAirportNames={false} />
            </MapContainer>
        ); expect(screen.queryByText(/Singapore Changi/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Tokyo Haneda/i)).not.toBeInTheDocument();
    });

    it('renders ICAO code markers when showIcaoLabels is true', () => {
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} showIcaoLabels={true} />
            </MapContainer>);
        expect(screen.getByText(/WSSS/i)).toBeInTheDocument();
        expect(screen.getByText(/RJTT/i)).toBeInTheDocument();
    });

    it('does not render ICAO code markers when showIcaoLabels is false', () => {
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} showIcaoLabels={false} />
            </MapContainer >);
        expect(screen.queryByText(/WSSS/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/RJTT/i)).not.toBeInTheDocument();
    });

    it('renders nothing when trajectories array is empty', () => {
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} trajectories={[]} />
            </MapContainer>
        );
        expect(screen.queryByText(/Singapore Changi/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/WSSS/i)).not.toBeInTheDocument();
    });

    it('renders all markers for multiple trajectories', () => {
        const multi: Trajectory[] = [
            ...mockTrajectories,
            {
                ...mockTrajectories[0],
                id: 2,
                adep: 'RJTT',
                ades: 'WSSS',
                inferredAdep: 'RJTT',
                inferredAdes: 'WSSS',
                inferredAdepName: 'Tokyo Haneda',
                inferredAdesName: 'Singapore Changi',
                adepCountry: 'Japan',
                adesCountry: 'Singapore',
                adepIATA: 'HND',
                adesIATA: 'SIN',
                inferredAdepCoords: [35.55, 139.77],
                inferredAdesCoords: [1.35, 103.82]
            }
        ];
        render(
            <MapContainer center={[1.35, 103.82]} zoom={8} style={{ height: 400, width: 600 }}>
                <TrajectoryLayer {...defaultProps} trajectories={multi} />
            </MapContainer>
        );
        expect(screen.getAllByText(/Singapore Changi/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Tokyo Haneda/i).length).toBeGreaterThan(0);
    });
});