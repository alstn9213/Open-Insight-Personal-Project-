import { useState, useEffect } from "react";
import AnalysisMap from "../components/map/AnalysisMap";
import type { GeoJsonCollection, MarketMapData } from "../types/map";
import type { MarketDetailResponse } from "../types/market";
// import axiosClient from "../api/axiosClient";
import GradeBadge from "../components/chart/ScoreChart";
import AnalysisChart from "../components/chart/AnalysisChart";
import { marketApi } from "../api/marketApi";
import { convertToMoisCode } from "../utils/convertToMoisCode";




const Analysis = () => {
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJsonCollection | null>(null);
  const [marketDetail, setMarketDetail] = useState<MarketDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<MarketMapData[]>([]);
  const DEFAULT_PROVINCE = "서울특별시";
  const DEFAULT_CATEGORY_ID = 1;

  // GeoJson 로드
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const [response, mapInfoResponse]= await Promise.all([
          fetch("/assets/geojson/Local_HangJeongDong-master/hangjeongdong_서울특별시.geojson"),
          marketApi.getMapInfo(DEFAULT_PROVINCE, DEFAULT_CATEGORY_ID)
        ]);

        if(!response.ok) throw new Error("GeoJSON 파일을 불러오는데 실패했습니다.");
        const geoData = await response.json();
        setGeoJson(geoData);
        setMapData(mapInfoResponse);

      } catch (error) {
        console.error("GeoJSON 데이터 로드 실패:", error);
      }
    };

    fetchGeoJson();

  }, []);

  const handleSelectRegion = async (admCode: string) => {
    const targetAdmCode = convertToMoisCode(admCode);
    setSelectedRegionCode(targetAdmCode);
    setLoading(true);
    setMarketDetail(null);

    try {
      const marketData = await marketApi.getMarketAnalysis(targetAdmCode, DEFAULT_CATEGORY_ID);
      setMarketDetail(marketData);

    } catch(error) {
      console.error("상세 분석 데이터 로드 실패: ", error);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">🗺️ 상권 지도 분석</h1>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* 왼쪽: 지도 영역 */}
        <div className="w-2/3 h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative bg-white">
          <AnalysisMap
            mapData={mapData}
            geoJson={geoJson}
            onSelectRegion={handleSelectRegion}
          />
        </div>

        {/* 오른쪽: 상세 정보 패널 */}
        <div className="w-1/3 h-full bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            상세 분석 리포트
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : marketDetail ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* 1. 지역 및 업종 정보 */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{marketDetail.regionName}</h3>
                <p className="text-gray-500 font-medium">{marketDetail.categoryName} 분석 결과</p>
              </div>

              {/* 2. 종합 등급 배지 */}
              <GradeBadge grade={marketDetail.marketGrade} />

              {/* 3. 핵심 요약 카드 */}
              <div className="stats shadow w-full">
                <div className="stat place-items-center">
                  <div className="stat-title">월 평균 매출</div>
                  <div className="stat-value text-primary text-2xl">
                    {marketDetail.averageSales.toLocaleString()}원
                  </div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title">순성장률</div>
                  <div className={`stat-value text-2xl ${marketDetail.netGrowthRate >= 0 ? 'text-success' : 'text-error'}`}>
                    {marketDetail.netGrowthRate}%
                  </div>
                </div>
              </div>

              {/* 4. 차트 영역 */}
              <div className="mt-6">
                <AnalysisChart data={marketDetail} loading={loading} />
              </div>

              {/* 5. 한줄 평 */}
              <div className="alert alert-info shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h3 className="font-bold">분석 결과 요약</h3>
                  <div className="text-xs">{marketDetail.description}</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-4xl mb-2">👆</span>
              <p>지도에서 지역을 클릭하면<br/>상세 분석 결과가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;
