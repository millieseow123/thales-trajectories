import { useEffect, useState } from 'react';
import type { Trajectory } from '@shared/types/trajectory';
import { getIcaoToCoordsMap, getNearestAirport, loadAirports } from '@/utils/loadAirports';
import { isICAO } from '@/utils/icao';

export function useTrajectories() {
    const [data, setData] = useState<Trajectory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(import.meta.env.VITE_API_URL + '/api/trajectories');
                if (!res.ok) throw new Error('Failed to fetch trajectories');
                const json: Trajectory[] = await res.json();

                const airports = await loadAirports();
                const icaoToCoordsMap = getIcaoToCoordsMap(airports);

                const enhanced = json.flatMap(t => {
                    if (
                        !t.adep ||
                        !t.ades ||
                        !Array.isArray(t.waypoints) ||
                        t.waypoints.length === 0 ||
                        typeof t.waypoints[0].latitude !== 'number' ||
                        typeof t.waypoints[0].longitude !== 'number'
                    ) {
                        return [];
                    }

                    const adepObj = isICAO(t.adep)
                        ? airports.find(a => a.icao === t.adep)
                        : getNearestAirport(t.waypoints[0].latitude, t.waypoints[0].longitude, airports);

                    const adesObj = isICAO(t.ades)
                        ? airports.find(a => a.icao === t.ades)
                        : getNearestAirport(
                            t.waypoints[t.waypoints.length - 1].latitude,
                            t.waypoints[t.waypoints.length - 1].longitude,
                            airports
                        );

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
                        inferredAdepCoords: adepCoords ? adepCoords as [number, number] : [t.waypoints[0].latitude, t.waypoints[0].longitude] as [number, number],
                        inferredAdesCoords: adesCoords ? adesCoords as [number, number] : [t.waypoints[t.waypoints.length - 1].latitude,
                        t.waypoints[t.waypoints.length - 1].longitude,] as [number, number],
                    };
                });

                setData(enhanced);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err);
                } else {
                    setError(new Error('An unknown error occurred'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}
