import type { Trajectory } from "../../../../shared/types/trajectory";
import { computeTotalDistance } from "../../utils/computeDistance";
import arrowImg from '../../assets/arrow.png';
import departureIcon from "../../assets/departure.png";
import arrivalIcon from "../../assets/arrival.png";
import closeIcon from "../../assets/close.png";

import styles from "./RouteSummary.module.css";

interface RouteSummaryProps {
    trajectory: Trajectory;
    onClose: () => void;
}

export function RouteSummary({ trajectory, onClose }: RouteSummaryProps) {
    const dep = trajectory.inferredAdepName || ""
    const arr = trajectory.inferredAdesName || "";
    const depIata = trajectory.inferredAdepIATA || "";
    const arrIata = trajectory.inferredAdesIATA || "";
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
            <button className={styles.closeButton} onClick={onClose}>
                <img src={closeIcon} alt="close" />
            </button>
            <h4>Route Summary</h4>
            <ul>
                <li><strong>Flight ID:</strong> {trajectory.id}</li>
                <div className={styles.airportContainer}>

                    <div className={styles.airport}>
                        <div className={styles.airportCode}>
                            <img src={departureIcon} alt="departure" />
                            <h3 className="code">{depIata}</h3>
                        </div>
                        <div className="name">{dep}</div>
                    </div>

                    <div className={styles.arrow}>
                        <img src={arrowImg} alt="arrow" />
                    </div>

                    <div className={styles.airport}>
                        <div className={styles.airportCode}>
                            <img src={arrivalIcon} alt="arrival" />
                            <h3 className="code">{arrIata}</h3>
                        </div>
                        <div className="name">{arr}</div>
                    </div>
                </div>
                <li><strong>Distance:</strong> {distance.toFixed(1)} km</li>
                <strong>Duration:</strong> {hours} h {minutes} min
                <li><strong>Avg Speed:</strong> {avgSpeed.toFixed(1)} km/h</li>
                <li><strong>Max Altitude:</strong> {maxAltitude} ft</li>
            </ul>
        </div>
    );
}
