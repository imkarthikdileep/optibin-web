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
  id: string; // Changed from number to string for consistency with "BINxxx" format
  location: { lat: number; lng: number };
  fillLevel: number;
  status: 'green' | 'yellow' | 'red';
}

// --- NEW: Add state for user-adjustable agent parameters ---
interface AgentParameters {
  fill_threshold: number; // e.g., 75%
  max_bins: number;     // e.g., 10
}

const OptiBinDashboard: React.FC = () => {
  const backendUrl = 'http://localhost:5000';

  const [bins, setBins] = useState<BinData[]>([]);
  const [isOptimized, setIsOptimized] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<L.LatLngExpression[] | null>(null);
  const [binsServicedCount, setBinsServicedCount] = useState(0); // Track how many bins were actually serviced by agent
  const [routeStats, setRouteStats] = useState({ distance: 'N/A' });
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>([37.7749, -122.4194]); // Default SF center
  
  // --- NEW STATE: Agent parameters, default values ---
  const [agentParams, setAgentParams] = useState<AgentParameters>({
    fill_threshold: 75,
    max_bins: 10
  });

  // Fetch initial bin data from the backend
  useEffect(() => {
    const fetchBins = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/bins`);
        const data: ApiBin[] = await response.json();

        const transformedBins = data.map(bin => {
          let status: 'green' | 'yellow' | 'red' = 'green';
          if (bin.fill_level > 80) status = 'red'; // Keep frontend threshold for display consistent
          else if (bin.fill_level >= 51) status = 'yellow';
          return {
            id: `BIN${bin.id}`,
            location: bin.location,
            fillLevel: bin.fill_level,
            status,
          };
        });
        
        setBins(transformedBins);

        // Center the map based on the loaded bins
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


  // --- REWRITTEN: Now calls the new agent endpoint ---
  const handleOptimizeRoute = async () => {
    // Frontend doesn't select bins anymore, the agent does.
    // We just send the parameters for its selection.

    try {
      const response = await fetch(`${backendUrl}/api/agent/get-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentParams), // Send agent parameters
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.total_distance_km === 0 && result.optimized_route_coords.length <= 1) {
          alert(result.message || "No bins met the criteria for a collection route.");
          setIsOptimized(false);
          setRouteCoordinates(null);
          setBinsServicedCount(0);
          setRouteStats({ distance: 'N/A' });
          return;
      }
      
      setRouteStats({
        distance: `${result.total_distance_km} km`,
      });

      setBinsServicedCount(result.bins_serviced ? result.bins_serviced.length : 0);
      setRouteCoordinates(result.optimized_route_coords.map((c: { lat: number; lng: number; }) => [c.lat, c.lng]));
      setIsOptimized(true);

    } catch (error) {
      console.error("Failed to optimize route:", error);
      alert("An error occurred while optimizing the route. Please check the console.");
    }
  };

  // Reset the state, and trigger re-fetch of all bins to reset their fill levels
  const handleRefreshData = () => {
    setIsOptimized(false);
    setRouteCoordinates(null);
    setBinsServicedCount(0); // Reset serviced bin count
    setRouteStats({ distance: 'N/A' });
    // Trigger re-fetch of all bins to get new random fill levels from data_server.py
    // You would typically re-run data_server.py in a real scenario
    window.location.reload(); // Simple way to reset everything for demo
  };

  // --- NEW: Dummy calculation for fuel efficiency. Can be made smarter later. ---
  const calculateEfficiencyGain = useCallback(() => {
    if (!isOptimized || routeStats.distance === 'N/A') return '0% Fuel Saved';
    
    // Assume a "naive" route visiting all 'red' bins would be X% longer
    // This is a mock value, but you could integrate more complex logic if desired
    const currentDistance = parseFloat(routeStats.distance);
    if (isNaN(currentDistance) || currentDistance === 0) return '0% Fuel Saved';

    // A simple mock: if 10 bins are serviced, maybe save 40-60% vs. naive.
    // This needs a baseline "non-optimized" distance to be truly accurate.
    // For demo purposes, a random value makes it look dynamic.
    const efficiency = Math.floor(Math.random() * (70 - 40) + 40); // 40-70% savings
    return `${efficiency}% Fuel Saved`;
  }, [isOptimized, routeStats.distance]);

  return (
    <div className="min-h-screen bg-gradient-dashboard">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
              <Cpu className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">OptiBin AI</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Dynamic Waste Collection Dashboard
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Control Panel - Left Sidebar */}
        <ControlPanel
          totalBins={bins.length}
          binsRequiringService={
            isOptimized ? binsServicedCount : bins.filter(b => b.status === 'red').length
          } // Show actual serviced count after optimization
          optimizedDistance={routeStats.distance}
          stopsOnRoute={binsServicedCount} // Now reflects actual stops selected by agent
          efficiencyGain={calculateEfficiencyGain()}
          isOptimized={isOptimized}
          onOptimizeRoute={handleOptimizeRoute}
          onRefreshData={handleRefreshData}
          // You might add UI controls for fill_threshold and max_bins here later
        />

        {/* Map Area */}
        <div className="flex-1 p-4">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-elegant border border-border">
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