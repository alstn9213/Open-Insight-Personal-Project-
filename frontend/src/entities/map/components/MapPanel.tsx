import React from 'react';
import type { GeoJsonCollection, MarketMapData } from '../types/map';
import { AnalysisMap } from './AnalysisMap';

interface MapPanelProps {
  mapData: MarketMapData[];
  geoJson: GeoJsonCollection | null;
  onSelectRegion: (admCode: string) => void;
  isLoading: boolean;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  mapData,
  geoJson,
  onSelectRegion,
  isLoading,
}) => {
  return (
    <div className="w-2/3 h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/50 flex justify-center items-center">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      )}
      <AnalysisMap
        mapData={mapData}
        geoJson={geoJson}
        onSelectRegion={onSelectRegion}
      />
    </div>
  );
};

