import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Define the data structures for props
interface Bin {
  id: string;
  location: { lat: number; lng: number };
  fillLevel: number;
  status: 'green' | 'yellow' | 'red';
}

interface OptiBinMapProps {
  allBins: Bin[];
  routeCoordinates: L.LatLngExpression[] | null;
  mapCenter: L.LatLngExpression;
}

const getBinColor = (status: string) => {
  switch (status) {
    case 'red': return '#EF4444';
    case 'yellow': return '#F59E0B';
    case 'green': return '#22C55E';
    default: return 'grey';
  }
};


// --- THIS IS THE NEW, CRUCIAL COMPONENT ---
// It receives the map instance from its parent and handles all dynamic layers
const MapLayers: React.FC<Omit<OptiBinMapProps, 'mapCenter'>> = ({ allBins, routeCoordinates }) => {
  const map = useMap(); // Get the map instance

  // This useEffect will run whenever the route changes
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      // Automatically zoom and pan the map to fit the entire route
      map.flyToBounds(routeCoordinates, { padding: [50, 50] });
    }
  }, [routeCoordinates, map]);

  const depotPosition = routeCoordinates ? routeCoordinates[0] : null;

  return (
    <>
      {/* Render all bins as CircleMarkers */}
      {allBins.map(bin => (
        <CircleMarker
          key={bin.id}
          center={[bin.location.lat, bin.location.lng]}
          radius={7} // Slightly bigger
          pathOptions={{
            color: getBinColor(bin.status),
            weight: 2,
            fillColor: getBinColor(bin.status),
            fillOpacity: 0.9
          }}
        >
          <Popup>
            <b>Bin ID:</b> {bin.id}<br />
            <b>Fill Level:</b> {bin.fillLevel}%<br/>
            <b>Status:</b> <span style={{color: getBinColor(bin.status)}}>{bin.status.toUpperCase()}</span>
          </Popup>
        </CircleMarker>
      ))}

      {/* Render the optimized route line */}
      {routeCoordinates && (
        <Polyline pathOptions={{ color: '#4F46E5', weight: 5, opacity: 0.8 }} positions={routeCoordinates} />
      )}
      
      {/* Render a special marker for the depot */}
      {depotPosition && (
         <Marker position={depotPosition}>
           <Popup><b>Depot</b><br />Route Start & End Point</Popup>
         </Marker>
      )}
    </>
  );
};


// The main component now just sets up the map container
const OptiBinMap: React.FC<OptiBinMapProps> = ({ allBins, routeCoordinates, mapCenter }) => {
  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      {/* Use a dark theme for the map tiles to match the UI */}
      <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
/>
      {/* Render the dynamic layers using our new component */}
      <MapLayers allBins={allBins} routeCoordinates={routeCoordinates} />
    </MapContainer>
  );
};

export default OptiBinMap;