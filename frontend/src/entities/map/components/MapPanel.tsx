import React from 'react';
import type { GeoJsonCollection } from '../types/map';
import { useMarketMap } from '../../market/hooks/useMarketMap';
import { AnalysisMap } from './AnalysisMap';

interface MapPanelProps {
  categoryId: number | null;
  geoJson: GeoJsonCollection | null;
  onSelectRegion: (admCode: string) => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  categoryId,
  geoJson,
  onSelectRegion,
}) => {
  const { mapData, isLoading, error } = useMarketMap(categoryId);

  return (
    <div className="w-2/3 h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/50 flex justify-center items-center">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 bg-gray-100 flex justify-center items-center p-4">
          <div className="text-center text-red-500">
            <p className="font-semibold">지도 데이터 로딩 실패</p>
            <p className="text-sm mt-1">데이터를 불러오는 중 오류가 발생했습니다.</p>
          </div>
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

