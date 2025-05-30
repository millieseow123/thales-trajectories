import express from 'express';
import { loadTrajectories } from '../data/loadTrajectories';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await loadTrajectories();
        res.json(data);
    } catch (err) {
        console.error('[ERROR] Failed to load trajectories:', err);
        res.status(500).json({ error: 'Failed to load trajectories' });
    }
});
export default router;
