import fs from 'fs';
import path from 'path';

export function loadTrajectories() {
    const filePath = path.join(__dirname, '../../trajectories.jsonl');
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    return lines.map(line => JSON.parse(line));
}
