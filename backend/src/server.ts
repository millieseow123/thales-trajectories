import express from 'express';
import trajectoriesRouter from './routes/trajectories';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use('/api/trajectories', trajectoriesRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
