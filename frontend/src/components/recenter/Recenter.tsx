import { useMap } from 'react-leaflet';
import recenterIcon from '@/assets/recenter.png';
import styles from './Recenter.module.css';

export function RecenterButton() {
    const map = useMap();

    const handleClick = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 12);
            },
            (_) => {
                alert('Unable to fetch your location');
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,             
                timeout: 5000            
            }
        );


    };

    return (
        <button className={styles.button} title="Recenter map" onClick={handleClick}>
            <img src={recenterIcon} alt="Recenter" />
        </button>
    );
}
