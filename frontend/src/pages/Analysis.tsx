import { useState, useEffect } from 'react';
import { useInitialData } from '../hooks/useInitialData';
import { CategorySelector } from '../features/analysis-header/components/CategorySelector';
import { MapPanel } from '../entities/map/components/MapPanel';
import { AnalysisReport } from '../features/analysis-report/AnalysisReport';

export const Analysis = () => {
  // 1. 페이지에 필요한 초기 데이터(GeoJSON, 카테고리 목록) 로드
  const { categories, geoJson, initialLoading, error: initialDataError } = useInitialData();

  // 2. 여러 자식 컴포넌트가 공유하는 핵심 상태만 관리
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);

  // 초기 카테고리가 로드되면 첫 번째 항목을 기본값으로 설정
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // 3. 자식 컴포넌트의 이벤트를 받아 상태를 업데이트하는 핸들러
  const handleCategoryChange = (newCategoryId: number) => {
    setSelectedCategoryId(newCategoryId);
  };

  const handleSelectRegion = (admCode: string) => {
    setSelectedRegionCode(admCode);
  };

  // 초기 데이터 로딩/에러는 페이지 전체에 영향을 주므로 여기서 처리
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (initialDataError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error
      </div>
    );
  }

  // 4. 상태와 핸들러를 각자 필요한 자식 컴포넌트에 props로 전달하여 조립
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
          disabled={initialLoading}
        />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <MapPanel
          categoryId={selectedCategoryId}
          geoJson={geoJson}
          onSelectRegion={handleSelectRegion}
        />
        
        <div className="w-1/3 h-full bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            상세 분석 리포트
          </h2>
          <AnalysisReport 
            categoryId={selectedCategoryId}
            regionCode={selectedRegionCode} 
          />
        </div>
      </div>
    </div>
  );
};

