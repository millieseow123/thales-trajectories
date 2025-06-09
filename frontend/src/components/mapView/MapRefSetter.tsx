import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

export function MapRefSetter({ mapRef }: { mapRef: React.RefObject<L.Map | null> }) {
    const map = useMap();

    useEffect(() => {
        mapRef.current = map;
    }, [map, mapRef]);

    return null;
}
