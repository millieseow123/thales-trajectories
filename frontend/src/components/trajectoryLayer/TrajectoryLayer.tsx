import L from 'leaflet';
import { Polyline, Marker, Tooltip, CircleMarker } from 'react-leaflet';
import type { Trajectory } from '@shared/types/trajectory';
import { getColorByRoute } from '@/utils/colorByRoute';
import { getColorBySpeed } from '@/utils/colorBySpeed';
import { haversineDistance } from '@/utils/distanceUtils';
import { getDecreasingOffset, getIncreasingOffset } from '@/utils/offset';
import styles from './TrajectoryLayer.module.css';
import { CONSTANTS } from '@/constants/text';

interface TrajectoryLayerProps {
    trajectories: Trajectory[];
    hoveredIdRef: React.RefObject<number | null>;
    forceUpdate: () => void;
    handlePolylineClick: (id: number) => void;
    zoomLevel: number;
    showAirportNames: boolean;
    setSelectedTrajectory: (traj: Trajectory) => void;
    selectedTrajectoryId: number | null;
    setSelectedTrajectoryId: (id: number) => void;
    showIcaoLabels: boolean;
};

function createLabelIcon(label: string): L.DivIcon {
    return L.divIcon({
        html: `<div class="${styles.labelIcon}">${label}</div>`,
        className: '',
        iconSize: [60, 24],
        iconAnchor: [25, -10],
    });
}

export default function TrajectoryLayer({ trajectories,
    hoveredIdRef,
    forceUpdate,
    zoomLevel,
    handlePolylineClick,
    showAirportNames,
    setSelectedTrajectory,
    setSelectedTrajectoryId,
    selectedTrajectoryId,
    showIcaoLabels }: TrajectoryLayerProps) {

    const increasingOffset = getIncreasingOffset(zoomLevel);
    const decreasingOffset = getDecreasingOffset(zoomLevel);
    const offsetCircle = (coords: [number, number]): [number, number] => {
        return [coords[0] + decreasingOffset, coords[1] + decreasingOffset];
    };

    const uniqueAirports = new Map<
        string,
        { coords: [number, number]; name: string; iata?: string }
    >();

    trajectories.forEach(traj => {
        if (traj.inferredAdep && traj.inferredAdepCoords) {
            uniqueAirports.set(traj.inferredAdep, {
                coords: traj.inferredAdepCoords,
                name: traj.inferredAdepName || traj.inferredAdep,
                iata: traj.adepIATA || "",
            });
        }
        if (traj.inferredAdes && traj.inferredAdesCoords) {
            uniqueAirports.set(traj.inferredAdes, {
                coords: traj.inferredAdesCoords,
                name: traj.inferredAdesName || traj.inferredAdes,
                iata: traj.adesIATA || "",
            });
        }
    });

    return (
        <>
            {trajectories.map((traj) => {
                const rawPositions = traj.waypoints.map(wp => [wp.latitude, wp.longitude] as [number, number]);
                const dep = traj.inferredAdepCoords ?? rawPositions[0];
                const arrBase = traj.inferredAdesCoords ?? rawPositions[rawPositions.length - 1]!;
                const arr: [number, number] = [arrBase[0] + increasingOffset, arrBase[1] + increasingOffset];
                const positions: [number, number][] = [
                    dep,
                    ...rawPositions.slice(1, -1),
                    arr
                ];
                const color = getColorByRoute(traj.inferredAdep ?? traj.adep, traj.inferredAdes ?? traj.ades);
                const isSelected = selectedTrajectoryId === traj.id;
                const isHovered = hoveredIdRef.current === traj.id;
                const polylineWeight = isSelected || isHovered ? 5 : 2.5;
                return (
                    <div key={traj.id}>
                        {selectedTrajectoryId === traj.id ? (
                            traj.waypoints.slice(1).map((wp2, i) => {
                                const waypointsWithDepArr = [
                                    { ...traj.waypoints[0], latitude: dep[0], longitude: dep[1] },
                                    ...traj.waypoints.slice(1, -1),
                                    { ...traj.waypoints[traj.waypoints.length - 1], latitude: arr[0], longitude: arr[1] }
                                ];
                                const wp1 = waypointsWithDepArr[i];
                                const from: [number, number] = [wp1.latitude, wp1.longitude];
                                const to: [number, number] = [wp2.latitude, wp2.longitude];
                                const distance = haversineDistance(...from, ...to);
                                if (!wp1.time || !wp2.time) return null;
                                const timeDiff = (new Date(wp2.time).getTime() - new Date(wp1.time).getTime()) / 3600000;
                                const speed = distance / timeDiff;
                                const segmentColor = getColorBySpeed(speed);

                                return (
                                    <Polyline
                                        key={`${traj.id}-${i}`}
                                        positions={[from, to]}
                                        pathOptions={{
                                            color: segmentColor,
                                            weight: 5,
                                            opacity: 0.9,
                                        }}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedTrajectory(traj);
                                                setSelectedTrajectoryId(traj.id);
                                                handlePolylineClick(traj.id);
                                            },
                                        }}
                                    >
                                        <Tooltip sticky className={styles.tooltip}>{`${CONSTANTS.TRAJECTORY_LAYER.FLIGHT} ${traj.id}`}</Tooltip>
                                    </Polyline>
                                );
                            })
                        ) : (
                            <Polyline
                                key={traj.id}
                                positions={positions}
                                pathOptions={{
                                    color: color,
                                    weight: polylineWeight,
                                    opacity: selectedTrajectoryId && selectedTrajectoryId !== traj.id ? 0.02 : 1,
                                }}
                                className={`${styles.trajectoryLine} ${selectedTrajectoryId && selectedTrajectoryId !== traj.id ? styles.dimmed : ''}`}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedTrajectory(traj);
                                        setSelectedTrajectoryId(traj.id);
                                        handlePolylineClick(traj.id);
                                    },
                                    mouseover: () => {
                                        hoveredIdRef.current = traj.id;
                                        forceUpdate();
                                    },
                                    mouseout: () => {
                                        hoveredIdRef.current = null;
                                        forceUpdate();
                                    },
                                }}
                            >
                                <Tooltip sticky className={styles.tooltip}>{`Flight ${traj.id}`}</Tooltip>
                            </Polyline>
                        )}


                        <>
                            {showIcaoLabels && (
                                <>
                                    {zoomLevel >= 7 && (
                                        <Marker
                                            position={dep}
                                            icon={createLabelIcon(traj.inferredAdep || traj.adep)}
                                        />
                                    )}
                                </>
                            )}
                            <CircleMarker
                                center={dep}
                                radius={4}
                                pathOptions={{ color: '#008000', fillOpacity: 0.7 }}
                                className={styles.marker}
                            >
                                {!showAirportNames && <Tooltip
                                    className={styles.tooltip}
                                    direction="top"
                                    offset={[0, -10]}
                                    sticky
                                >
                                    {traj.inferredAdepName && traj.adepIATA
                                        ? `${traj.inferredAdepName} (${traj.adepIATA})`
                                        : traj.inferredAdepName}
                                </Tooltip>}
                            </CircleMarker>
                        </>


                        <>
                            {showIcaoLabels && (
                                <>
                                    {zoomLevel >= 7 && (
                                        <Marker
                                            position={arr}
                                            icon={createLabelIcon(traj.inferredAdes || traj.ades)}
                                        />
                                    )}
                                </>
                            )}
                            <CircleMarker
                                center={arr}
                                radius={4}
                                pathOptions={{ color: '#ff2d55', fillOpacity: 0.7 }}
                                className={styles.marker}
                            >
                                {!showAirportNames && <Tooltip
                                    sticky
                                    className={styles.tooltip}
                                    direction="top"
                                    offset={[0, -10]}
                                    permanent={false}
                                >
                                    {traj.inferredAdesName && traj.adesIATA
                                        ? `${traj.inferredAdesName} (${traj.adesIATA})`
                                        : traj.inferredAdesName}
                                </Tooltip>}
                            </CircleMarker>
                        </>
                    </div>
                );
            })}

            {showAirportNames &&
                Array.from(uniqueAirports.entries()).map(([icao, { coords, name, iata }]) => {
                    const labelClass = zoomLevel > 6 ? `${styles.airportLabel} ${styles.zoomVisible}` : styles.airportLabel;
                    return (
                        <div key={icao}>
                            <CircleMarker
                                center={offsetCircle(coords)}
                                radius={1}
                                pathOptions={{ color: '#fff', fillOpacity: 1 }}
                            />
                            <Marker
                                position={offsetCircle(coords)}
                                icon={L.divIcon({
                                    html: `<div class="${labelClass}">${name} ${iata ? ` (${iata})` : ''}</div>`,
                                    className: '',
                                    iconSize: [200, 24],
                                    iconAnchor: [100, -10],
                                })}
                            />
                        </div>
                    );
                })
            }


        </>
    );
}
