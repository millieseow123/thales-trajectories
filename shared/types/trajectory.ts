export interface Waypoint {
    latitude: number;
    longitude: number;
    altitude?: number;
    time?: string;
    name?: string;
}

export interface Trajectory {
    id: number;
    adep: string;
    ades: string;
    waypoints: Waypoint[];
    inferredAdep?: string;
    inferredAdes?: string;
    inferredAdepName?: string | null;
    inferredAdesName?: string | null;
    adepCountry?: string | null;
    adesCountry?: string | null;
    inferredAdepIATA?: string | null;
    inferredAdesIATA?: string | null;
    inferredAdepCoords?: [number, number];
    inferredAdesCoords?: [number, number];
};
  