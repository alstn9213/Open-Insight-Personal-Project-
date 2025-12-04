// src/pages/Analysis.tsx
import { useState, useEffect } from "react";
import AnalysisMap from "../components/map/AnalysisMap";
import type { GeoJsonCollection, MarketMapData } from "../types/map";

// 임시 백엔드 데이터 (MarketMapResponse 형태)
const MOCK_MAP_DATA: MarketMapData[] = [
  { admCode: "1168051000", district: "강남구", marketGrade: "GREEN",storeCount: 500, netGrowthRate: 3.5 },
  { admCode: "1144066000", district: "마포구", marketGrade: "RED", storeCount: 200, netGrowthRate: 3.5 },
];

const Analysis = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJsonCollection | null>(null);

  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const response = await fetch("/assets/geojson/Local_HangJeongDong-master/hangjeongdong_서울특별시.geojson");
        if(!response.ok) {
          throw new Error("GeoJSON 파일을 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setGeoJson(data);
      } catch(error) {
        console.error("GeoJSON Load Error:", error)
      }
    };
    fetchGeoJson();
  }, []);

  const handleSelectRegion = (admCode: string) => {
    console.log("선택된 지역 코드:", admCode);
    setSelectedRegion(admCode);
    // TODO: 여기서 상세 분석 API 호출
  };

  return (
      <div className="flex flex-col h-screen p-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">🗺️ 상권 지도 분석</h1>
        
        <div className="flex flex-1 gap-4">
          {/* 지도 영역 */}
          <div className="w-2/3 h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
            <AnalysisMap 
              mapData={MOCK_MAP_DATA} 
              geoJson={geoJson} 
              onSelectRegion={handleSelectRegion} 
            />
          </div>

          {/* 상세 정보 패널 */}
          <div className="w-1/3 h-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">상세 정보</h2>
            {selectedRegion ? (
              <div className="space-y-4">
                <div className="alert alert-info">
                  <span>선택된 지역 코드: <strong>{selectedRegion}</strong></span>
                </div>
                <p className="text-gray-600">
                  분석 데이터가 여기에 표시됩니다.
                </p>
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