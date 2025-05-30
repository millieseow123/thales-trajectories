import { createPool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import type { Trajectory } from '../../../shared/types/trajectory';

//FOR SQL
// const pool = createPool({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     database: process.env.DB_NAME || 'trajectories_db',
// });

// export async function loadTrajectories(): Promise<Trajectory[]> {
//     const [rows] = await pool.query('SELECT * FROM trajectories');
//     return (rows as any[]).map(row => ({
//         id: row.id,
//         adep: row.adep,
//         ades: row.ades,
//         waypoints: row.waypoints,
//     }));
// }

export function parseTrajectoryFile(filePath: string): Trajectory[] {
    const parsed: Trajectory[] = [];
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');

    for (const line of lines) {
        try {
            const obj = JSON.parse(line);
            if (obj.adep && obj.ades && Array.isArray(obj.waypoints)) {
                parsed.push(obj as Trajectory);
            } else {
                console.warn(`[WARN] Skipping line with missing fields: ${line}`);
            }
        } catch {
            console.warn(`[WARN] Skipping malformed JSON line: ${line}`);
        }
    }

    return parsed;
}

export function loadTrajectories(): Trajectory[] {
    const filePath = path.join(__dirname, 'trajectories.jsonl');
    return parseTrajectoryFile(filePath);
}