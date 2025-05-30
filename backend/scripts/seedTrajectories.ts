import fs from 'fs';
import readline from 'readline';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'trajectories_db',
    });

    const filePath = path.join(__dirname, '../src/data/trajectories.jsonl');
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        if (!line.trim()) continue;
        const traj = JSON.parse(line);

        await connection.execute(
            `INSERT INTO trajectories (id, adep, ades, waypoints)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE id = id`,
            [traj.id, traj.adep, traj.ades, JSON.stringify(traj.waypoints)]
        );
    }

    await connection.end();
    console.log('✅ Data seeding complete');
};

seed().catch(err => {
    console.error('❌ Error seeding:', err);
    process.exit(1);
});

function formatDateToMySQL(datetime: string | undefined): string | null {
    if (!datetime) return null;
    return new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');
}

