import fs from 'fs';
import path from 'path';
import { Trajectory } from '../types/trajectory';

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