import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTrajectories } from '../../hooks/useTrajectories';
import Sidebar from '../sideBar/SideBar';
import { useMapEvents } from 'react-leaflet';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import TrajectoryLayer from '../trajectoryLayer/TrajectoryLayer';
import { RecenterButton } from '../recenter/Recenter';
import L from 'leaflet';
import type { Trajectory } from '../../../../shared/types/trajectory';
import { RouteSummary } from '../routeSummary/RouteSummary';
import styles from './MapView.module.css';

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
    if (error) return <div>Error loading data</div>;

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
    }

    return (
        <MapContainer
            center={[1.35, 103.82]}
            zoom={5}
            zoomControl={false}
            style={{ height: '100vh', width: '100%' }}
            ref={(node) => {
                if (node) mapRef.current = node;
            }}
        >
            {showHint && (
                <div className={styles.hint}>
                    Click on a flight route to view its summary
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
                    setSelectedTrajectory(null);
                    setSelectedTrajectoryId(null);
                }} />
            )}

            <Sidebar
                mapRef={mapRef}
                zoomLevel={zoomLevel}
                flightIdFilter={flightIdFilter}
                setFlightIdFilter={setFlightIdFilter}
                setSelectedFlightId={setSelectedFlightId}
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
