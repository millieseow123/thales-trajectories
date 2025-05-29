import L from 'leaflet';
import departureIconUrl from './departure.png';
import arrivalIconUrl from './arrival.png';


export const departureIcon = new L.Icon({
    iconUrl: departureIconUrl,
    iconSize: [16, 16],
    iconAnchor: [50, -15],
    popupAnchor: [0, -32],
});

export const arrivalIcon = new L.Icon({
    iconUrl: arrivalIconUrl,
    iconSize: [16, 16],
    iconAnchor: [50, -15],
    popupAnchor: [0, -32],
});
