import { useMemo } from 'react';
import { useInitialData } from '../hooks/useInitialData';
import { useMarketAnalysis } from '../entities/market/hooks/useMarketAnalysis';
import { CategorySelector } from '../features/analysis-header/components/CategorySelector';
import { MapPanel } from '../entities/map/components/MapPanel';
import { AnalysisReport } from '../entities/map/components/AnalysisReport';

export const Analysis = () => {
  const { categories, geoJson, initialLoading, error } = useInitialData();

  const initialCategoryId = useMemo(() => {
    return categories.length > 0 ? categories[0].id : null;
  }, [categories]);

  const {
    selectedCategoryId,
    mapData,
    marketDetail,
    mapLoading,
    detailLoading,
    handleSelectRegion,
    handleCategoryChange,
  } = useMarketAnalysis(initialCategoryId);

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-gray-50">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🗺️ 상권 분석
        </h1>
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleCategoryChange}
          disabled={initialLoading || mapLoading}
        />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <MapPanel
          mapData={mapData}
          geoJson={geoJson}
          onSelectRegion={handleSelectRegion}
          isLoading={mapLoading}
        />
        
        <div className="w-1/3 h-full bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            상세 분석 리포트
          </h2>
          <AnalysisReport marketDetail={marketDetail} isLoading={detailLoading} />
        </div>
      </div>
    </div>
  );
};

