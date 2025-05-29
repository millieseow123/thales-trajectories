import { useMap } from 'react-leaflet';
import recenterIcon from '../../assets/recenter.png';
import styles from './Recenter.module.css';

export function RecenterButton() {
    const map = useMap();

    const handleClick = () => {
        console.log("HI")
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 12);
            },
            () => alert('Unable to fetch your location')
        );
    };

    return (
        <button className={styles.button} onClick={handleClick}>
            <img src={recenterIcon} alt="Recenter" />
        </button>
    );
}
