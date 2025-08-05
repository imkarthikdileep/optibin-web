import React, { useState, useEffect, useCallback } from 'react';
import ControlPanel from './ControlPanel';
import OptiBinMap from './OptiBinMap';
import { Cpu, Activity } from 'lucide-react';
import L from 'leaflet';

// Define data structures
interface ApiBin {
  id: number;
  location: { lat: number; lng: number };
  fill_level: number;
}
interface BinData {
  id: string;
  location: { lat: number; lng: number };
  fillLevel: number;
  status: 'green' | 'yellow' | 'red';
}

const OptiBinDashboard: React.FC = () => {
  const backendUrl = 'http://localhost:5000';

  const [bins, setBins] = useState<BinData[]>([]);
  const [isOptimized, setIsOptimized] = useState(false);
  // --- NEW STATE: To hold the route coordinates ---
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLngExpression[] | null>(null);
  const [routeStats, setRouteStats] = useState({ distance: 'N/A', stops: 0 });
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([40.7128, -74.006]); // Default center

  // Fetch initial bin data from the backend
  useEffect(() => {
    const fetchBins = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/bins`);
        const data: ApiBin[] = await response.json();

        const transformedBins = data.map(bin => {
          let status: 'green' | 'yellow' | 'red' = 'green';
          if (bin.fill_level > 80) status = 'red';
          else if (bin.fill_level >= 51) status = 'yellow';
          return {
            id: `BIN${bin.id}`,
            location: bin.location,
            fillLevel: bin.fill_level,
            status,
          };
        });
        
        setBins(transformedBins);

        // --- NEW: Center the map based on the loaded bins ---
        if (data.length > 0) {
            const avgLat = data.reduce((acc, b) => acc + b.location.lat, 0) / data.length;
            const avgLng = data.reduce((acc, b) => acc + b.location.lng, 0) / data.length;
            setMapCenter([avgLat, avgLng]);
        }

      } catch (error) {
        console.error("Failed to fetch bins from backend:", error);
      }
    };
    fetchBins();
  }, [backendUrl]);

  const redBins = bins.filter(bin => bin.status === 'red');

  // Handle route optimization API call
  const handleOptimizeRoute = async () => {
    if (redBins.length === 0) {
      alert("No bins require service.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/optimize-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bins_to_service: redBins }),
      });
      const result = await response.json();
      
      setRouteStats({
        distance: `${result.total_distance_km} km`,
        stops: redBins.length,
      });

      // --- NEW: Store the coordinates for the map component ---
      setRouteCoordinates(result.optimized_route_coords.map((c: { lat: any; lng: any; }) => [c.lat, c.lng]));
      setIsOptimized(true);

    } catch (error) {
      console.error("Failed to optimize route:", error);
    }
  };

  // Reset the state
  const handleRefreshData = () => {
    setIsOptimized(false);
    setRouteCoordinates(null);
    setRouteStats({ distance: 'N/A', stops: 0 });
    // In a real app, you might re-fetch data here as well.
  };

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      <header className="bg-card border-b border-border shadow-sm">
        {/* Header content remains the same */}
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <ControlPanel
          totalBins={bins.length}
          binsRequiringService={redBins.length}
          optimizedDistance={routeStats.distance}
          stopsOnRoute={routeStats.stops}
          // Efficiency gain can be mocked or calculated properly later
          efficiencyGain={`${Math.floor(Math.random() * 30 + 30)}% Fuel Saved`}
          isOptimized={isOptimized}
          onOptimizeRoute={handleOptimizeRoute}
          onRefreshData={handleRefreshData}
        />

        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-elegant border border-border">
            {/* --- Pass the new props to our powerful map component --- */}
            <OptiBinMap
              allBins={bins}
              routeCoordinates={routeCoordinates}
              mapCenter={mapCenter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptiBinDashboard;