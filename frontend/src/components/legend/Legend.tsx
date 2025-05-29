import styles from './Legend.module.css';

export default function Legend() {
    return (
        <div className={styles.legend}>
            <h4>Legend</h4>

            <div className={styles.legendContainer}>
                <div className={styles.legendIconWrapper}>
                    <span className={styles.greenMarker} />
                </div>
                <span>Departure Airport</span>
            </div>

            <div className={styles.legendContainer}>
                <div className={styles.legendIconWrapper}>
                    <span className={styles.redMarker} />
                </div>
                <span>Arrival Airport</span>
            </div>

            <div className={styles.legendContainer}>
                <div className={styles.legendIconWrapper}>
                    <div className={styles.icaoBox}>WSSS</div>
                </div>
                <span>ICAO Code</span>
            </div>
        </div>
    );
}
