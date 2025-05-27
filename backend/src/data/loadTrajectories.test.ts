import { describe, expect, it } from 'vitest';
import { loadTrajectories, parseTrajectoryFile } from './loadTrajectories';
import path from 'path';

describe('loadTrajectories()', () => {
    const data = loadTrajectories();

    it('should return an array', () => {
        expect(Array.isArray(data)).toBe(true);
    });

    it('should not be empty', () => {
        expect(data.length).toBeGreaterThan(0);
    });

    it('each trajectory should have adep, ades, and waypoints', () => {
        for (const traj of data) {
            expect(traj).toHaveProperty('adep');
            expect(traj).toHaveProperty('ades');
            expect(traj).toHaveProperty('waypoints');
        }
    });

    it('waypoints should be a non-empty array of lat/lng points', () => {
        const wp = data[0].waypoints;
        expect(Array.isArray(wp)).toBe(true);
        expect(wp.length).toBeGreaterThan(0);
        expect(wp[0]).toHaveProperty('latitude');
        expect(wp[0]).toHaveProperty('longitude');
    });
});

describe('loadTrajectories() edge cases', () => {
    const edgePath = path.join(__dirname, '../test-data/edge-trajectories.jsonl');
    const data = parseTrajectoryFile(edgePath);

    it('should skip malformed lines', () => {
        expect(data.find(t => t.id === undefined)).toBeUndefined();
    });

    it('should skip lines missing adep/waypoints', () => {
        const invalid = data.find(t => !t.adep || !Array.isArray(t.waypoints));
        expect(invalid).toBeUndefined();
    });

    it('should load only valid lines', () => {
        expect(data.length).toBe(1);
        expect(data[0]).toHaveProperty('adep', 'WSSS');
    });
});