import { Polyline, Marker, Tooltip, CircleMarker } from 'react-leaflet';
import { getColorByRoute } from '../../utils/colorByRoute';
import type { Trajectory } from '../../../../shared/types/trajectory';
import L from 'leaflet';

import styles from './TrajectoryLayer.module.css';
import { getDecreasingOffset, getIncreasingOffset } from '../../utils/offset';

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
                iata: traj.inferredAdepIATA || "",
            });
        }
        if (traj.inferredAdes && traj.inferredAdesCoords) {
            uniqueAirports.set(traj.inferredAdes, {
                coords: traj.inferredAdesCoords,
                name: traj.inferredAdesName || traj.inferredAdes,
                iata: traj.inferredAdesIATA || "",
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
                const polylineColor = isSelected || isHovered ? '#00FFFF' : color;
                const polylineWeight = isSelected || isHovered ? 5 : 2.5;
                return (
                    <div key={traj.id}>
                        <Polyline pathOptions={{
                            color: polylineColor,
                            weight: polylineWeight,
                            opacity: 0.7,
                        }} positions={positions}
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
                            }}>
                            <Tooltip sticky className={styles.tooltip}>{`Flight ${traj.id}`}</Tooltip>
                        </Polyline>

                        {zoomLevel >= 7 && showIcaoLabels && (
                            <Marker position={dep} icon={createLabelIcon(traj.inferredAdep || traj.adep)} />
                        )}
                        <CircleMarker center={dep} radius={4} pathOptions={{ color: '#008000', fillOpacity: 0.7 }} >
                            {zoomLevel < 7 && (<Tooltip sticky className={styles.tooltip}>
                                {traj.inferredAdepName && traj.inferredAdepIATA
                                    ? `${traj.inferredAdepName} (${traj.inferredAdepIATA})`
                                    : traj.inferredAdep}
                            </Tooltip>)}
                        </CircleMarker>

                        {zoomLevel >= 7 && showIcaoLabels && (
                            <Marker position={arr} icon={createLabelIcon(traj.inferredAdes || traj.ades)} />
                        )}
                        <CircleMarker center={arr} radius={4} pathOptions={{ color: '#ff2d55', fillOpacity: 0.7 }} >
                            {zoomLevel < 7 && (<Tooltip sticky className={styles.tooltip}>
                                {traj.inferredAdesName && traj.inferredAdesIATA
                                    ? `${traj.inferredAdesName} (${traj.inferredAdesIATA})`
                                    : traj.inferredAdes}
                            </Tooltip>)}
                        </CircleMarker>
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
