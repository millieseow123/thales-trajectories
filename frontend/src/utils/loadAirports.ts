export interface Airport {
    icao: string;
    name: string;
    iata?: string;
    country?: string;
    lat: number;
    lon: number;
}

export async function loadAirports(): Promise<Airport[]> {
    const res = await fetch('/data/airports.csv');
    const text = await res.text();

    return text
        .split('\n')
        .slice(1)
        .map(line => line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(cell => cell.replace(/^"|"$/g, '')) ?? [])
        .filter(row => ['large_airport', 'medium_airport', 'small_airport'].includes(row[2]))
        .map(row => ({
            icao: row[1], 
            name: row[3], 
            iata: row[13],
            country: row[8],
            lat: parseFloat(row[4]),  
            lon: parseFloat(row[5])  
        }))
        .filter(a => a.icao && !isNaN(a.lat) && !isNaN(a.lon));
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371; 

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearestAirport(
    lat: number,
    lon: number,
    airports: Airport[],
    maxDistKm = 100
): Airport | null {
    let nearest: Airport | null = null;
    let minDist = Infinity;

    for (const airport of airports) {
        const dist = haversineDistance(lat, lon, airport.lat, airport.lon);
        if (dist < minDist && dist <= maxDistKm) {
            nearest = airport;
            minDist = dist;
        }
    }

    return nearest;
}

export function getIcaoToCoordsMap(airports: Airport[]) {
    return airports.reduce((map, airport) => {
        if (airport.icao) {
            map[airport.icao] = [airport.lat, airport.lon];
        }
        return map;
    }, {} as Record<string, [number, number]>);
}
  