export function computeTotalDistance(waypoints: { latitude: number; longitude: number }[]): number {
    const R = 6371;

    let totalDistance = 0;

    for (let i = 1; i < waypoints.length; i++) {
        const prev = waypoints[i - 1];
        const curr = waypoints[i];

        const dLat = degToRad(curr.latitude - prev.latitude);
        const dLon = degToRad(curr.longitude - prev.longitude);

        const lat1 = degToRad(prev.latitude);
        const lat2 = degToRad(curr.latitude);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        totalDistance += R * c;
    }

    return totalDistance;
}

function degToRad(deg: number): number {
    return deg * (Math.PI / 180);
}
