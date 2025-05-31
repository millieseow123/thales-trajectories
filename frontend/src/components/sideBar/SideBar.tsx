import L from 'leaflet';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import expandIconUrl from '@/assets/expand.png';
import collapseIconUrl from '@/assets/collapse.png';
import resetIconUrl from '@/assets/reset.png';
import { CONSTANTS } from '@/constants/text';
import Legend from '@/components/legend/Legend';
import type { Trajectory } from '@shared/types/trajectory';
import { groupAirportsByCountry } from '@/utils/groupAirportsByCountry';
import type { Airport } from '@/utils/groupAirportsByCountry';
import { customStyles } from './selectStyles'
import styles from './SideBar.module.css';

interface SidebarProps {
    mapRef: React.RefObject<L.Map | null>;
    zoomLevel: number;
    flightIdFilter: string;
    setFlightIdFilter: (v: string) => void;
    setSelectedFlightId: (id: number | null) => void;
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
    flightIdFilter,
    setFlightIdFilter,
    setSelectedFlightId,
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
    const [flightSuggestions, setFlightSuggestions] = useState<string[]>([]);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState('');

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

    useEffect(() => {
        const map = mapRef.current;
        const input = document.querySelector('.' + styles.flightSearchInput);

        if (!map || !input) return;

        const handleMouseEnter = () => map.dragging.disable();
        const handleMouseLeave = () => map.dragging.enable();

        input.addEventListener('mouseenter', handleMouseEnter);
        input.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            input.removeEventListener('mouseenter', handleMouseEnter);
            input.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [mapRef]);


    return (
        <div ref={sidebarRef} className={styles.sidebarContainer}>
            <div className={`${styles.sidebarHeader} ${isCollapsed ? styles.collapsedHeader : ''}`}>
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
                        <h4>{CONSTANTS.SIDEBAR.TITLE}</h4>
                        <button
                            className={styles.clearButton}
                            onClick={() => {
                                setSelectedFlightId(null);
                                setFlightIdFilter('');
                                setAdepFilter('');
                                setAdesFilter('');
                                setStartTime(null);
                                setEndTime(null);
                            }}
                            title={CONSTANTS.SIDEBAR.CLEAR_FILTERS_TOOLTIP}
                        >

                            <img src={resetIconUrl} alt="Reset filters" />
                        </button>
                    </div>

                    <div className={styles.filterContainer}>
                        <div className={styles.filters}>

                            <h5>{CONSTANTS.SIDEBAR.FLIGHT_ID.LABEL}</h5>
                            <div className={styles.flightSearchContainer}>
                                <input
                                    type="text"
                                    placeholder={CONSTANTS.SIDEBAR.FLIGHT_ID.PLACEHOLDER}
                                    value={flightIdFilter}
                                    onChange={(e) => {
                                        const query = e.target.value;
                                        setFlightIdFilter(query);

                                        if (query === '') {
                                            setSelectedFlightId(null);
                                            setFlightSuggestions([]);
                                            return;
                                        }

                                        const matches = trajectories
                                            .filter(t => t.id.toString().includes(query))
                                            .map(t => `#${t.id} – ${t.inferredAdep || t.adep} → ${t.inferredAdes || t.ades}`);
                                        setFlightSuggestions(matches);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setFlightSuggestions([]), 200);
                                    }}
                                    className={styles.flightSearchInput}
                                />

                                {flightIdFilter && (
                                    <button
                                        className={styles.clearInputBtn}
                                        onClick={() => {
                                            setFlightIdFilter('');
                                            setSelectedFlightId(null);
                                        }}
                                        title="Clear"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            {flightIdFilter && flightSuggestions.length > 0 && (
                                <ul className={styles.flightIdSuggestions}>
                                    {flightSuggestions.map((s, i) => (
                                        <li key={i} onClick={() => {
                                            const id = s.match(/\d+/)?.[0];
                                            if (id) {
                                                setFlightIdFilter(id);
                                                setSelectedFlightId(Number(id));
                                                setFlightSuggestions([]);
                                            }
                                        }}>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className={styles.filters}>
                            <h5>{CONSTANTS.SIDEBAR.AIRPORT.LABEL}</h5>
                            <Select
                                menuPortalTarget={document.body}
                                styles={customStyles}
                                menuPosition="fixed"
                                menuShouldBlockScroll={true}
                                options={groupedOptions}
                                value={groupedOptions
                                    .flatMap(g => g.options)
                                    .find(opt => opt.value === adepFilter) || null}
                                onChange={(selected) =>
                                    setAdepFilter(selected?.value || '')
                                }
                                placeholder={CONSTANTS.SIDEBAR.AIRPORT.DEPARTURE}
                                isClearable
                                className={styles.select}
                                classNamePrefix="select"
                            />

                            <Select
                                menuPortalTarget={document.body}
                                styles={customStyles}
                                menuPosition="fixed"
                                menuShouldBlockScroll={true}
                                options={groupedOptions}
                                value={groupedOptions
                                    .flatMap(g => g.options)
                                    .find(opt => opt.value === adesFilter) || null}
                                onChange={(opt) => setAdesFilter(opt?.value || '')}
                                filterOption={() => true}
                                placeholder={CONSTANTS.SIDEBAR.AIRPORT.ARRIVAL}
                                isClearable
                                className={styles.select}
                                classNamePrefix="select"
                            />
                        </div>

                        <div className={styles.filters}>
                            <h5>{CONSTANTS.SIDEBAR.TIME.LABEL}</h5>
                            <div className={styles.quickFilters}>
                                <button
                                    className={selectedTimeFilter === 'today' ? styles.active : ''}
                                    onClick={() => {
                                        const now = new Date();
                                        if (
                                            startTime &&
                                            startTime.getDate() === now.getDate() &&
                                            startTime.getMonth() === now.getMonth() &&
                                            startTime.getFullYear() === now.getFullYear()
                                        ) {
                                            setStartTime(null);
                                            setSelectedTimeFilter('');
                                        } else {
                                            setSelectedTimeFilter('today');
                                            setStartTime(now);
                                        }
                                    }}>
                                    {CONSTANTS.SIDEBAR.TIME.QUICK_FILTERS.TODAY}
                                </button>
                                <button
                                    className={selectedTimeFilter === '1h' ? styles.active : ''}
                                    onClick={() => {
                                        const last1h = new Date(Date.now() - 60 * 60 * 1000);
                                        if (startTime && Math.abs(startTime.getTime() - last1h.getTime()) < 60000) {
                                            setStartTime(null);
                                            setSelectedTimeFilter('');
                                        } else {
                                            setSelectedTimeFilter('1h');
                                            setStartTime(last1h);
                                        }
                                    }}>
                                    {CONSTANTS.SIDEBAR.TIME.QUICK_FILTERS.LAST_1H}
                                </button>
                                <button
                                    className={selectedTimeFilter === '24h' ? styles.active : ''}
                                    onClick={() => {
                                        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
                                        if (startTime && Math.abs(startTime.getTime() - last24h.getTime()) < 60000) {
                                            setStartTime(null);
                                            setSelectedTimeFilter('');
                                        } else {
                                            setSelectedTimeFilter('24h');
                                            setStartTime(last24h);
                                        }
                                    }}>
                                    {CONSTANTS.SIDEBAR.TIME.QUICK_FILTERS.LAST_24H}
                                </button>
                            </div>

                            <div className={styles.dateContainer}>
                                <DatePicker
                                    selected={startTime}
                                    onChange={(date) => setStartTime(date)}
                                    showTimeSelect
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    dateFormat="dd MMM HH:mm"
                                    placeholderText="Start Time"
                                    portalId="root"
                                    popperPlacement="bottom-end" />

                                <DatePicker
                                    selected={endTime}
                                    onChange={(date) => setEndTime(date)}
                                    showTimeSelect
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    dateFormat="dd MMM HH:mm"
                                    placeholderText="End Time"
                                    portalId="root"
                                    popperPlacement="bottom-end"
                                />

                            </div>
                        </div>
                    </div>
                    <hr className={styles.divider} />

                    <div className={styles.options}>
                        <label className={styles.checkbox} title={zoomLevel < 7 ? "Zoom in to show ICAO codes" : ""}>
                            <input
                                type="checkbox"
                                checked={showIcaoLabels}
                                onChange={(e) => setShowIcaoLabels(e.target.checked)}
                                disabled={zoomLevel < 7}
                            />
                            {CONSTANTS.SIDEBAR.TOGGLES.SHOW_ICAO}
                        </label>
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={showAirportNames}
                                onChange={(e) => setShowAirportNames(e.target.checked)}
                            />
                            {CONSTANTS.SIDEBAR.TOGGLES.SHOW_NAME}
                        </label>
                    </div>

                    <hr className={styles.divider} />

                    <Legend />
                </div>
            )
            }
        </div >
    );
}