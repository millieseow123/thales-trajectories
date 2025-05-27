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
}
  