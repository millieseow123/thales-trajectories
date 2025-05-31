import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
    return (
        <div data-testid="spinner" className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
        </div>
    );
}
