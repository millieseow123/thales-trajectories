import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, useMapEvents, TileLayer, ZoomControl } from 'react-leaflet';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import LoadingSpinner from '@/components/loadingSpinner/LoadingSpinner';
import { RecenterButton } from '@/components/recenter/Recenter';
import { RouteSummary } from '@/components/routeSummary/RouteSummary';
import Sidebar from '@/components/sideBar/SideBar';
import TrajectoryLayer from '@/components/trajectoryLayer/TrajectoryLayer';
import { CONSTANTS } from '@/constants/text';
import { useTrajectories } from '@/hooks/useTrajectories';
import type { Trajectory } from '@shared/types/trajectory';
import styles from './MapView.module.css';
import { MapRefSetter } from './MapRefSetter';

export default function MapView() {
    const { data: trajectories, loading, error } = useTrajectories();
    const hoveredIdRef = useRef<number | null>(null);
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [showHint, setShowHint] = useState(true);
    const [flightIdFilter, setFlightIdFilter] = useState('');
    const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
    const [adepFilter, setAdepFilter] = useState('');
    const [adesFilter, setAdesFilter] = useState('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [zoomLevel, setZoomLevel] = useState(6);
    const mapRef = useRef<L.Map | null>(null);
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
    const [showAirportNames, setShowAirportNames] = useState(false);
    const [selectedTrajectoryId, setSelectedTrajectoryId] = useState<number | null>(null);
    const [selectedTrajectory, setSelectedTrajectory] = useState<Trajectory | null>(null);
    const [showIcaoLabels, setShowIcaoLabels] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 30000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const zoomIn = document.querySelector('.leaflet-control-zoom-in') as HTMLElement;
        const zoomOut = document.querySelector('.leaflet-control-zoom-out') as HTMLElement;
        if (zoomIn) zoomIn.title = 'Zoom in';
        if (zoomOut) zoomOut.title = 'Zoom out';
    }, []);

    useEffect(() => {
        if (selectedTrajectory && mapRef.current) {
            const first = selectedTrajectory.waypoints?.[0];
            if (first) {
                mapRef.current.setView([first.latitude, first.longitude], 6, {
                    animate: true,
                    duration: 1,
                });
            }
        }
    }, [selectedTrajectory]);

    const handlePolylineClick = (id: number) => {
        setSelectedTrajectoryId(id);
        setShowHint(false);
    };

    const filteredTrajectories = useMemo(() => {
        return trajectories.filter(traj => {
            const isSelected = traj.id === selectedTrajectoryId;

            const matchesFlightId = selectedFlightId === null || traj.id === selectedFlightId;

            const matchesAdep = adepFilter === '' || traj.inferredAdep === adepFilter;
            const matchesAdes = adesFilter === '' || traj.inferredAdes === adesFilter;
            const departureTime = traj.waypoints[0]?.time;
            const arrivalTime = traj.waypoints[traj.waypoints.length - 1]?.time;
            const matchesStart = !startTime || (departureTime && new Date(departureTime) >= new Date(startTime));
            const matchesEnd = !endTime || (arrivalTime && new Date(arrivalTime) <= new Date(endTime));
            const matchesFilter = matchesAdep && matchesAdes && matchesStart && matchesEnd && matchesFlightId;

            if (mapBounds) {
                const depCoords = traj.inferredAdepCoords ?? [traj.waypoints[0].latitude, traj.waypoints[0].longitude];
                const arrCoords = traj.inferredAdesCoords ?? [traj.waypoints[traj.waypoints.length - 1].latitude, traj.waypoints[traj.waypoints.length - 1].longitude];
                const isVisible =
                    mapBounds.contains(L.latLng(depCoords[0], depCoords[1])) ||
                    mapBounds.contains(L.latLng(arrCoords[0], arrCoords[1]));

                return (matchesFilter && isVisible) || isSelected;
            }

            return matchesFilter || isSelected;
        });
    }, [trajectories, selectedFlightId, adepFilter, adesFilter, startTime, endTime, mapBounds, selectedTrajectoryId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>{CONSTANTS.MAP_VIEW.ERROR}</div>;

    function ZoomTracker({
        onZoomChange,
        onBoundsChange,
    }: {
        onZoomChange: (zoom: number) => void;
        onBoundsChange: (bounds: L.LatLngBounds) => void;
    }) {
        useMapEvents({
            zoomend: (e) => {
                onZoomChange(e.target.getZoom());
                onBoundsChange(e.target.getBounds());
            },
            moveend: (e) => {
                onBoundsChange(e.target.getBounds());
            },
        });
        return null;
    };

    return (
        <MapContainer
            center={[1.35, 103.82]}
            zoom={5}
            zoomControl={false}
            ref={(node) => {
                if (node) mapRef.current = node;
            }}
            className={styles.mapContainer}
        >
            <MapRefSetter mapRef={mapRef} />
            {showHint && (
                <div className={styles.hint}>
                    {CONSTANTS.MAP_VIEW.HINT}
                </div>
            )}

            <ZoomTracker onZoomChange={setZoomLevel} onBoundsChange={setMapBounds} />
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            <RecenterButton />
            <ZoomControl position="bottomright" />

            <TrajectoryLayer
                trajectories={filteredTrajectories}
                hoveredIdRef={hoveredIdRef}
                forceUpdate={forceUpdate}
                zoomLevel={zoomLevel}
                handlePolylineClick={handlePolylineClick}
                showAirportNames={showAirportNames}
                setSelectedTrajectory={setSelectedTrajectory}
                selectedTrajectoryId={selectedTrajectoryId}
                setSelectedTrajectoryId={setSelectedTrajectoryId}
                showIcaoLabels={showIcaoLabels}
            />

            {selectedTrajectory && (
                <RouteSummary trajectory={selectedTrajectory} onClose={() => {
                    setSelectedFlightId(null);
                    setSelectedTrajectory(null);
                    setSelectedTrajectoryId(null);
                    hoveredIdRef.current = null;
                    forceUpdate();
                }} />
            )}

            <Sidebar
                mapRef={mapRef}
                zoomLevel={zoomLevel}
                hoveredIdRef={hoveredIdRef}
                flightIdFilter={flightIdFilter}
                setFlightIdFilter={setFlightIdFilter}
                setSelectedFlightId={setSelectedFlightId}
                setSelectedTrajectory={setSelectedTrajectory}
                setSelectedTrajectoryId={setSelectedTrajectoryId}
                adepFilter={adepFilter}
                setAdepFilter={setAdepFilter}
                adesFilter={adesFilter}
                setAdesFilter={setAdesFilter}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                trajectories={trajectories}
                showAirportNames={showAirportNames}
                setShowAirportNames={setShowAirportNames}
                showIcaoLabels={showIcaoLabels}
                setShowIcaoLabels={setShowIcaoLabels}
            />

        </MapContainer >
    );
}
