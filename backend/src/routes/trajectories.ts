import express from 'express';
import { loadTrajectories } from '../data/loadTrajectories';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const data = await loadTrajectories(limit, offset);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load trajectories' });
    }
});
export default router;
