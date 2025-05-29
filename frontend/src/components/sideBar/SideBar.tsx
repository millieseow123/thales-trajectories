import Select from 'react-select';

import styles from './Sidebar.module.css';
import type { Trajectory } from '../../../../shared/types/trajectory';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Legend from '../legend/Legend';
import expandIconUrl from '../../assets/expand.png';
import collapseIconUrl from '../../assets/collapse.png';
import resetIconUrl from '../../assets/reset.png';
import L from 'leaflet';
import { groupAirportsByCountry } from '../../utils/groupAirportsByCountry';
import type { Airport } from '../../utils/groupAirportsByCountry';

interface SidebarProps {
    mapRef: React.RefObject<L.Map | null>;
    zoomLevel: number;
    adepFilter: string;
    setAdepFilter: (v: string) => void;
    adesFilter: string;
    setAdesFilter: (v: string) => void;
    startTime: Date | null;
    setStartTime: (v: Date | null) => void;
    endTime: Date | null;
    setEndTime: (v: Date | null) => void;
    trajectories: Trajectory[];
    showAirportNames: boolean;
    setShowAirportNames: (val: boolean) => void;
    showIcaoLabels: boolean;
    setShowIcaoLabels: (val: boolean) => void;
}

export default function Sidebar({
    mapRef,
    zoomLevel,
    adepFilter,
    setAdepFilter,
    adesFilter,
    setAdesFilter,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    trajectories,
    showAirportNames,
    setShowAirportNames,
    showIcaoLabels,
    setShowIcaoLabels
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    const airportMap = new Map<string, { name: string, country: string }>();

    trajectories.forEach(t => {
        if (t.inferredAdep && t.inferredAdepName)
            airportMap.set(t.inferredAdep, {
                name: t.inferredAdepName,
                country: t.adepCountry || 'Unknown',
            });

        if (t.inferredAdes && t.inferredAdesName)
            airportMap.set(t.inferredAdes, {
                name: t.inferredAdesName,
                country: t.adesCountry || 'Unknown',
            });
    });

    const airportList: Airport[] = Array.from(airportMap.entries()).map(([icao, { name, country }]) => ({
        icao,
        name,
        country,
    }));

    const groupedOptions = groupAirportsByCountry(airportList);


    useEffect(() => {
        const el = sidebarRef.current;
        if (!el) return;

        const stopDoubleClick = (e: MouseEvent) => {
            e.stopPropagation();
        };

        el.addEventListener('dblclick', stopDoubleClick);
        return () => {
            el.removeEventListener('dblclick', stopDoubleClick);
        };
    }, []);

    return (
        <div ref={sidebarRef} className={styles.sidebarContainer}>
            <div className={styles.sidebarHeader}>
                <button className={styles.arrow} onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ?
                        <img src={expandIconUrl} alt="expand" className={styles.icon} />
                        :
                        <img src={collapseIconUrl} alt="collapse" className={styles.icon} />
                    }
                </button>
            </div>

            {!isCollapsed && (
                <div className={styles.sidebar} onMouseEnter={() => mapRef.current?.scrollWheelZoom.disable()}
                    onMouseLeave={() => mapRef.current?.scrollWheelZoom.enable()}>
                    <div className={styles.sidebarTitle}>
                        <h4>Find Flights</h4>
                        <button
                            className={styles.clearButton}
                            onClick={() => {
                                setAdepFilter('');
                                setAdesFilter('');
                                setStartTime(null);
                                setEndTime(null);
                            }}
                            title="Clear all filters"
                        >

                            <img src={resetIconUrl} alt="Reset filters" style={{ width: 16, height: 16 }} />
                        </button>
                    </div>
                    <div className={styles.airportFilters}>
                        <h5>By Airport:</h5>
                        <Select
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPosition="fixed"
                            menuShouldBlockScroll={true}
                            options={groupedOptions}
                            value={groupedOptions
                                .flatMap(g => g.options)
                                .find(opt => opt.value === adepFilter) || null}
                            onChange={(selected) =>
                                setAdepFilter(selected?.value || '')
                            }
                            placeholder="Select Departure"
                            isClearable
                            className={styles.select}
                            classNamePrefix="select"
                        />

                        <Select
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            menuPosition="fixed"
                            menuShouldBlockScroll={true}
                            options={groupedOptions}
                            value={groupedOptions
                                .flatMap(g => g.options)
                                .find(opt => opt.value === adesFilter) || null}
                            onChange={(opt) => setAdesFilter(opt?.value || '')}
                            filterOption={() => true}
                            placeholder="Select Arrival"
                            isClearable
                            className={styles.select}
                            classNamePrefix="select"
                        />
                    </div>
                    <div>
                        <h5>By Time:</h5>
                        <div className={styles.quickFilters}>
                            <button onClick={() => setStartTime(new Date())}>Today</button>
                            <button onClick={() => setStartTime(new Date(Date.now() - 60 * 60 * 1000))}>Last 1h</button>
                            <button onClick={() => setStartTime(new Date(Date.now() - 24 * 60 * 60 * 1000))}>Last 24h</button>
                        </div>

                        <div className={styles.dateContainer}>
                            <DatePicker
                                selected={startTime}
                                onChange={(date) => setStartTime(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="Start Time"
                            />

                            <DatePicker
                                selected={endTime}
                                onChange={(date) => setEndTime(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                placeholderText="End Time"
                            />

                        </div>
                    </div>

                    <hr className={styles.divider} />

                    <div>
                        {/* <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={showIcaoLabels}
                                onChange={(e) => setShowIcaoLabels(e.target.checked)}
                            />
                            ICAO Airport Codes
                        </label> */}
                        <label className={styles.checkbox} title={zoomLevel < 7 ? "Zoom in to show ICAO codes" : ""}>
                            <input
                                type="checkbox"
                                checked={showIcaoLabels}
                                onChange={(e) => setShowIcaoLabels(e.target.checked)}
                                disabled={zoomLevel < 7}
                            />
                            ICAO Airport Codes
                        </label>

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={showAirportNames}
                                onChange={(e) => setShowAirportNames(e.target.checked)}
                            />
                            Show airport names
                        </label>
                    </div>

                    <hr className={styles.divider} />

                    <Legend />
                </div>
            )}
        </div>
    );
}