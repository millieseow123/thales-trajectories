import { useEffect, useState } from 'react';
import type { Trajectory } from '@shared/types/trajectory';
import { isICAO } from '@/utils/icao';
import { getIcaoToCoordsMap, getNearestAirport, loadAirports } from '@/utils/loadAirports';

export function useTrajectories() {
    const [data, setData] = useState<Trajectory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [initialRes, airports] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/trajectories?limit=100&offset=0`),
                    loadAirports()
                ]);

                if (!initialRes.ok) throw new Error('Failed to fetch initial trajectories');
                const initialTraj: Trajectory[] = await initialRes.json();

                const icaoToCoordsMap = getIcaoToCoordsMap(airports);
                const enhance = (t: Trajectory) => {
                    if (
                        !t.adep || !t.ades || !Array.isArray(t.waypoints) || t.waypoints.length === 0 ||
                        typeof t.waypoints[0].latitude !== 'number' || typeof t.waypoints[0].longitude !== 'number'
                    ) return null;

                    const adepObj = isICAO(t.adep)
                        ? airports.find(a => a.icao === t.adep)
                        : getNearestAirport(t.waypoints[0].latitude, t.waypoints[0].longitude, airports);
                    const adesObj = isICAO(t.ades)
                        ? airports.find(a => a.icao === t.ades)
                        : getNearestAirport(t.waypoints.at(-1)!.latitude, t.waypoints.at(-1)!.longitude, airports);

                    const adepCoords = adepObj?.icao ? icaoToCoordsMap[adepObj.icao] : null;
                    const adesCoords = adesObj?.icao ? icaoToCoordsMap[adesObj.icao] : null;

                    return {
                        ...t,
                        inferredAdep: adepObj?.icao || t.adep,
                        inferredAdes: adesObj?.icao || t.ades,
                        inferredAdepName: adepObj?.name || null,
                        inferredAdesName: adesObj?.name || null,
                        adepCountry: adepObj?.country || null,
                        adesCountry: adesObj?.country || null,
                        adepIATA: adepObj?.iata || null,
                        adesIATA: adesObj?.iata || null,
                        inferredAdepCoords: adepCoords ?? [t.waypoints[0].latitude, t.waypoints[0].longitude],
                        inferredAdesCoords: adesCoords ?? [t.waypoints.at(-1)!.latitude, t.waypoints.at(-1)!.longitude],
                    };
                };

                const enhancedInitial = initialTraj.map(enhance).filter(Boolean) as Trajectory[];
                setData(enhancedInitial);
                setLoading(false);

                setTimeout(async () => {
                    try {
                        const fullRes = await fetch(`${import.meta.env.VITE_API_URL}/api/trajectories?limit=1000&offset=100`);
                        if (!fullRes.ok) return;
                        const fullTraj: Trajectory[] = await fullRes.json();
                        const enhancedFull = fullTraj.map(enhance).filter(Boolean) as Trajectory[];
                        setData(prev => [...prev, ...enhancedFull]);
                    } catch {
                        // Fail silently for background load
                    }
                }, 300);

            } catch (err: unknown) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}
