import fs from 'fs';
import path from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';


vi.mock('mysql2/promise', () => {
    const mockQuery = vi.fn();
    return {
        createPool: () => ({
            query: mockQuery,
            end: vi.fn(),
        }),
        __mockQuery: mockQuery,
    };
});

import { loadTrajectories, parseTrajectoryFile } from './loadTrajectories';
import * as mysqlMock from 'mysql2/promise';

function getFirstTrajectoryFromJSONL(): any {
    const filePath = path.join(__dirname, '../data/trajectories.jsonl');
    const firstLine = fs.readFileSync(filePath, 'utf-8').trim().split('\n')[0];
    return JSON.parse(firstLine);
}

describe('loadTrajectories from DB', () => {

    const edgePath = path.join(__dirname, '../test-data/edge-trajectories.jsonl');
    const result = parseTrajectoryFile(edgePath);
    beforeEach(() => {
        (mysqlMock as any).__mockQuery.mockReset();
    });
        
    it('should return trajectories from DB with waypoints', async () => {
        const traj = getFirstTrajectoryFromJSONL();

        (mysqlMock as any).__mockQuery.mockResolvedValueOnce([[
            {
                id: traj.id,
                adep: traj.adep,
                ades: traj.ades,
                waypoints: traj.waypoints,
            },
        ]]);

        const data = await loadTrajectories();

        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(traj.id);
        expect(data[0].adep).toBe(traj.adep);
        expect(Array.isArray(data[0].waypoints)).toBe(true);
        expect(data[0].waypoints[0]).toHaveProperty('latitude');
    });

    it('should throw an error on DB failure', async () => {
        (mysqlMock as any).__mockQuery.mockRejectedValueOnce(new Error('DB Error'));

        await expect(loadTrajectories()).rejects.toThrow('DB Error');
    });

    it('returns empty array if DB returns no rows', async () => {
        (mysqlMock as any).__mockQuery.mockResolvedValueOnce([[]]);
        const data = await loadTrajectories();
        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(0);
    });

    it('parses multiple trajectories correctly', async () => {
        const t1 = getFirstTrajectoryFromJSONL();
        const t2 = { ...t1, id: 999, adep: 'WSSS' };

        (mysqlMock as any).__mockQuery.mockResolvedValueOnce([[
            {
                id: t1.id,
                adep: t1.adep,
                ades: t1.ades,
                waypoints: t1.waypoints,
            },
            {
                id: t2.id,
                adep: t2.adep,
                ades: t2.ades,
                waypoints: t2.waypoints,
            },
        ]]);

        const data = await loadTrajectories();
        expect(data).toHaveLength(2);
        expect(data.map(d => d.id)).toContain(t1.id);
        expect(data.map(d => d.id)).toContain(t2.id);
    });

    it('gracefully handles invalid waypoint JSON', async () => {
        (mysqlMock as any).__mockQuery.mockResolvedValueOnce([[
            {
                id: 3,
                adep: 'RJTT',
                ades: 'KLAX',
                waypoints: 'invalid json',
            },
        ]]);

        const data = await loadTrajectories();
        expect(data).toHaveLength(0);
    });

    it('should skip malformed lines', () => {
        expect(result.find(t => t === undefined)).toBeUndefined();
    });

    it('should skip lines missing adep/waypoints', () => {
        expect(result.length).toBe(1);
        expect(result[0].adep).toBe('WSSS');
    });
});
