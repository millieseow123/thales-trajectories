import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import trajectoriesRouter from './routes/trajectories';

const app = express();
app.use(cors());
app.use('/api/trajectories', trajectoriesRouter);

describe('GET /api/trajectories', () => {
    it('should return 200 and a list of trajectories', async () => {
        const res = await request(app).get('/api/trajectories');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('adep');
        expect(res.body[0]).toHaveProperty('ades');
        expect(res.body[0]).toHaveProperty('waypoints');
    });
});
