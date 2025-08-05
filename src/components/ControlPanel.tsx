import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Route, RefreshCw, Truck, MapPin, TrendingUp } from 'lucide-react';

interface ControlPanelProps {
  totalBins: number;
  binsRequiringService: number;
  optimizedDistance: string;
  stopsOnRoute: number;
  efficiencyGain: string;
  isOptimized: boolean;
  onOptimizeRoute: () => void;
  onRefreshData: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  totalBins,
  binsRequiringService,
  optimizedDistance,
  stopsOnRoute,
  efficiencyGain,
  isOptimized,
  onOptimizeRoute,
  onRefreshData
}) => {
  return (
    <div className="w-80 h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Control Section */}
      <Card className="m-4 bg-sidebar-accent border-sidebar-border">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Route Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={onOptimizeRoute}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            <Route className="w-4 h-4 mr-2" />
            Optimize Collection Route
          </Button>
          
          <Button 
            onClick={onRefreshData}
            variant="outline"
            className="w-full border-sidebar-border hover:bg-sidebar-accent"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Bin Data
          </Button>
        </CardContent>
      </Card>

      <Separator className="mx-4 bg-sidebar-border" />

      {/* Statistics Section */}
      <Card className="m-4 flex-1 bg-sidebar-accent border-sidebar-border">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Network Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-sidebar-foreground/80">Total Bins in Network</span>
              <span className="text-2xl font-bold text-accent">{totalBins}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-sidebar-foreground/80">Bins Requiring Service</span>
              <span className="text-2xl font-bold text-destructive">{binsRequiringService}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-sidebar-foreground/80">Optimized Route Distance</span>
              <span className={`text-2xl font-bold ${isOptimized ? 'text-success' : 'text-sidebar-foreground/50'}`}>
                {optimizedDistance}
              </span>
            </div>

            {isOptimized && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-sidebar-foreground/80">Stops on Route</span>
                  <span className="text-2xl font-bold text-primary">{stopsOnRoute}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-sidebar-foreground/80">Efficiency Gain</span>
                  <span className="text-2xl font-bold text-success">{efficiencyGain}</span>
                </div>
              </>
            )}
          </div>

          {isOptimized && (
            <div className="pt-4 border-t border-sidebar-border">
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-success">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Route Optimized Successfully</span>
                </div>
                <p className="text-xs text-sidebar-foreground/70 mt-1">
                  Collection route has been calculated for maximum efficiency.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlPanel;