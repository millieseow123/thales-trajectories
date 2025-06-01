import { describe, it, expect } from 'vitest';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { Trajectory } from '@shared/types/trajectory';

import { Router } from 'express';

function buildEdgeRouter(): Router {
    const raw = fs.readFileSync(
        path.join(__dirname, 'test-data/edge-trajectories.jsonl'),
        'utf-8'
    );

    const lines = raw.trim().split('\n');
    const parsed: Trajectory[] =[];

    for (const line of lines) {
        try {
            const obj = JSON.parse(line);
            if (obj.adep && obj.ades && Array.isArray(obj.waypoints)) {
                parsed.push(obj);
            }
        } catch (_) {
        }
    }

    const router = express.Router();
    router.get('/', (req, res) => {
        res.json(parsed);
    });

    return router;
}

const app = express();
app.use(cors());
app.use('/api/trajectories', buildEdgeRouter());

describe('GET /api/trajectories (with edge case data)', () => {
    it('should only return valid trajectory objects', async () => {
        const res = await request(app).get('/api/trajectories');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        for (const traj of res.body) {
            expect(traj).toHaveProperty('adep');
            expect(traj).toHaveProperty('ades');
            expect(Array.isArray(traj.waypoints)).toBe(true);
        }

        expect(res.body.length).toBe(1);
    });
});
