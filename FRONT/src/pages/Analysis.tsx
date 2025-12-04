// src/pages/Analysis.tsx
import { useState, useEffect } from "react";
import AnalysisMap from "../components/map/AnalysisMap";

// 임시 GeoJSON 데이터 (테스트용 사각형 2개)
// 실제 개발 시에는 public 폴더에 있는 .geojson 파일을 fetch로 불러와야 합니다.
const MOCK_GEOJSON = {
  features: [
    {
      type: "Feature",
      properties: { adm_code: "1168051000" }, // 강남구 역삼1동 (예시)
      geometry: {
        type: "Polygon",
        coordinates: [[
          [127.02, 37.49], [127.04, 37.49], 
          [127.04, 37.51], [127.02, 37.51]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { adm_code: "1144066000" }, // 마포구 서교동 (예시)
      geometry: {
        type: "Polygon",
        coordinates: [[
          [126.91, 37.54], [126.93, 37.54], 
          [126.93, 37.56], [126.91, 37.56]
        ]]
      }
    }
  ]
};

// 임시 백엔드 데이터 (MarketMapResponse 형태)
const MOCK_MAP_DATA = [
  { admCode: "1168051000", district: "강남구", marketGrade: "GREEN", storeCount: 500 },
  { admCode: "1144066000", district: "마포구", marketGrade: "RED", storeCount: 200 },
];

const Analysis = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleSelectRegion = (admCode: string) => {
    console.log("선택된 지역 코드:", admCode);
    setSelectedRegion(admCode);
    // TODO: 여기서 상세 분석 API 호출 (GET /api/market/analysis?admCode=...)
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold text-gray-800">🗺️ 상권 지도 분석</h1>
      
      <div className="flex flex-1 gap-4">
        {/* 왼쪽: 지도 영역 (2/3 차지) */}
        <div className="w-2/3 h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <AnalysisMap 
            mapData={MOCK_MAP_DATA} 
            geoJson={MOCK_GEOJSON} 
            onSelectRegion={handleSelectRegion} 
          />
        </div>

        {/* 오른쪽: 상세 정보 패널 (1/3 차지) */}
        <div className="w-1/3 h-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">상세 정보</h2>
          {selectedRegion ? (
            <div className="space-y-4">
              <div className="alert alert-info">
                <span>선택된 지역 코드: <strong>{selectedRegion}</strong></span>
              </div>
              <p className="text-gray-600">
                지도에서 선택한 지역의 상세 분석 데이터가 이곳에 표시됩니다.
                <br/>(매출 추이 차트, 유동인구 등)
              </p>
              {/* 추후 여기에 Chart.js 컴포넌트 추가 */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p>지도에서 분석하고 싶은 구역을 클릭하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;