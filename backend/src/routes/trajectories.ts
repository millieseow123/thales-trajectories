import express from 'express';
import { loadTrajectories } from '../data/loadTrajectories';

const router = express.Router();
const trajectories = loadTrajectories();

router.get('/', (req, res) => {
    res.json(trajectories);
});

export default router;
