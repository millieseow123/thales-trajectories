import type { Trajectory } from "../../../../shared/types/trajectory";
import { computeTotalDistance } from "../../utils/computeDistance";

import styles from "./RouteSummary.module.css";

interface RouteSummaryProps {
    trajectory: Trajectory;
    onClose: () => void;
}

export function RouteSummary({ trajectory, onClose }: RouteSummaryProps) {
    const dep = trajectory.inferredAdepName
        ? `${trajectory.inferredAdepName}${trajectory.inferredAdepIATA ? ` (${trajectory.inferredAdepIATA})` : ''}`
        : trajectory.inferredAdep;

    const arr = trajectory.inferredAdesName
        ? `${trajectory.inferredAdesName}${trajectory.inferredAdesIATA ? ` (${trajectory.inferredAdesIATA})` : ''}`
        : trajectory.inferredAdes;

    const waypoints = trajectory.waypoints;
    const start = new Date(waypoints[0]?.time ?? 0);
    const end = new Date(waypoints[waypoints.length - 1]?.time ?? 0);
    const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
    const hours = Math.floor(durationMin / 60);
    const minutes = Math.round(durationMin % 60);

    const distance = computeTotalDistance(waypoints);
    const avgSpeed = distance / (durationMin / 60);
    const altitudes = waypoints.map(wp => wp.altitude).filter((a): a is number => a !== undefined);
    const maxAltitude = altitudes.length > 0 ? Math.max(...altitudes) : 0;

    return (
        <div className={styles.routeSummary}>
            <button onClick={onClose}>×</button>
            <h4>Route Summary</h4>
            <ul>
                <li><strong>Flight ID:</strong> {trajectory.id}</li>
                <li><strong>From:</strong> {dep}</li>
                <li><strong>To:</strong> {arr}</li>
                <li><strong>Distance:</strong> {distance.toFixed(1)} km</li>
                <strong>Duration:</strong> {hours} h {minutes} min
                <li><strong>Avg Speed:</strong> {avgSpeed.toFixed(1)} km/h</li>
                <li><strong>Max Altitude:</strong> {maxAltitude} ft</li>
            </ul>
        </div>
    );
}
