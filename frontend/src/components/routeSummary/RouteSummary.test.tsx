import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RouteSummary } from './RouteSummary';
import type { Trajectory } from '@shared/types/trajectory';
import { computeTotalDistance } from '@/utils/computeDistance';

const mockTrajectory: Partial<Trajectory> = {
    id: 123,
    inferredAdepName: 'Singapore Changi',
    inferredAdesName: 'Tokyo Haneda',
    adepIATA: 'SIN',
    adesIATA: 'HND',
    waypoints: [
        { latitude: 1.35, longitude: 103.82, time: '2024-01-01T00:00:00Z', altitude: 1000 },
        { latitude: 35.55, longitude: 139.77, time: '2024-01-01T06:00:00Z', altitude: 35000 }
    ]
};

describe('RouteSummary', () => {
    it('renders all route summary info', () => {
        const onClose = vi.fn();
        render(<RouteSummary trajectory={mockTrajectory as Trajectory} onClose={onClose} />);
        
        expect(screen.getByText(/Route Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/Flight ID:/i)).toBeInTheDocument();
        expect(screen.getByAltText(/arrow/i)).toBeInTheDocument();
        expect(screen.getByAltText(/departure/i)).toBeInTheDocument();
        expect(screen.getByAltText(/arrival/i)).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByText('Singapore Changi')).toBeInTheDocument();
        expect(screen.getByText('Tokyo Haneda')).toBeInTheDocument();
        expect(screen.getByText('SIN')).toBeInTheDocument();
        expect(screen.getByText('HND')).toBeInTheDocument();

        const waypoints = mockTrajectory.waypoints ?? [];
        const distance = computeTotalDistance(waypoints);

        const start = new Date(waypoints[0]?.time ?? 0);
        const end = new Date(waypoints[waypoints.length - 1]?.time ?? 0);
        const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
        const hours = Math.floor(durationMin / 60);
        const minutes = Math.round(durationMin % 60);

        const avgSpeed = (distance / (durationMin / 60)).toFixed(1);

        const altitudes = waypoints.map(wp => wp.altitude).filter(a => a !== undefined);
        const maxAltitude = altitudes.length > 0 ? Math.max(...altitudes) : 0;
        expect(screen.getByText(`${distance.toFixed(1)} km`)).toBeInTheDocument();
        expect(screen.getByText(`${hours.toString()} h ${minutes.toString()} min`)).toBeInTheDocument();
        expect(screen.getByText(`${avgSpeed} km/h`)).toBeInTheDocument();
        expect(screen.getByText(`${maxAltitude.toString()} ft`)).toBeInTheDocument();
        expect(screen.getByText(/Distance:/i)).toBeInTheDocument();
        expect(screen.getByText(/Duration:/i)).toBeInTheDocument();
        expect(screen.getByText(/Avg Speed:/i)).toBeInTheDocument();
        expect(screen.getByText(/Max Altitude:/i)).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<RouteSummary trajectory={mockTrajectory as Trajectory} onClose={onClose} />);
        const closeBtn = screen.getByRole('button');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('renders fallback values for missing data', () => {
        const incompleteTrajectory: Partial<Trajectory> = {
            id: 456,
            waypoints: []
        };
        render(<RouteSummary trajectory={incompleteTrajectory as Trajectory} onClose={() => { }} />);
        expect(screen.getByText('456')).toBeInTheDocument();
        expect(screen.getAllByText('')).toBeTruthy();
        expect(screen.getByText(/0 h 0 min/i)).toBeInTheDocument();
        expect(screen.getByText(/0.0 km/i)).toBeInTheDocument();
        expect(screen.getByText(/km\/h/i)).toBeInTheDocument();
        expect(screen.getByText(/0 ft/i)).toBeInTheDocument();
    });
});