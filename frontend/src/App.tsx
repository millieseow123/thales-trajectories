// src/App.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  return (
    <MapContainer center={[1.35, 103.82]} zoom={6} style={{ height: "100vh", width: "100vw" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[1.35, 103.82]}>
        <Popup>Singapore</Popup>
      </Marker>
    </MapContainer>
  );
}

export default App;
