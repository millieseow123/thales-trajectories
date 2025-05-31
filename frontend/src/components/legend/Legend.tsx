import { CONSTANTS } from '@/constants/text';
import styles from './Legend.module.css';

export default function Legend() {
    return (
        <div className={styles.legend}>
            <h4>{CONSTANTS.LEGEND.TITLE}</h4>

            <div className={styles.legendContainer}>
                <div className={styles.legendIconWrapper}>
                    <span className={styles.greenMarker} />
                </div>
                <span>{CONSTANTS.LEGEND.DEPARTURE}</span>
            </div>

            <div className={styles.legendContainer}>
                <div className={styles.legendIconWrapper}>
                    <span className={styles.redMarker} />
                </div>
                <span>{CONSTANTS.LEGEND.ARRIVAL}</span>
            </div>

            <div className={styles.legendContainer}>
                <div className={styles.legendIconWrapper}>
                    <div className={styles.icaoBox}>{CONSTANTS.LEGEND.SAMPLE_ICAO}</div>
                </div>
                <span>{CONSTANTS.LEGEND.ICAO_CODE}</span>
            </div>
        </div>
    );
}
