import { useState, useEffect } from "react";
import AnalysisMap from "../components/map/AnalysisMap";
import type { GeoJsonCollection, MarketMapData } from "../types/map";
import type { Category, MarketDetailResponse } from "../types/market";
import { marketApi } from "../api/marketApi";
import { convertToMoisCode } from "../utils/convertToMoisCode";

const Analysis = () => {
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);

  const [geoJson, setGeoJson] = useState<GeoJsonCollection | null>(null);
  const [mapData, setMapData] = useState<MarketMapData[]>([]);
  const [marketDetail, setMarketDetail] = useState<MarketDetailResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  const DEFAULT_PROVINCE = "서울특별시";

  // 초기 데이터 로드
  useEffect(() => {
    const initData = async () => {
      try {
        const [geoResponse, categoryResponse]= await Promise.all([
          fetch("/assets/geojson/HangJeongDong_ver20250401.geojson"),
          marketApi.getCategories()
        ]);

        if(!geoResponse.ok) throw new Error("GeoJSON 로드 실패.");

        // 서울지역(행정동 코드 11)만 필터링
        const geoData = await geoResponse.json();
        const seoulFeatures = geoData.features.filter((feature: any) => {
          const admCode = String(feature.properties.adm_cd);
          return admCode.startsWith("11");
        });

        // 필터링된 features로 GeoJSON 설정
        setGeoJson({...geoData, features: seoulFeatures});
        setCategories(categoryResponse);

        if(categoryResponse.length > 0) {
          setSelectedCategoryId(categoryResponse[0].id);
        }

      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
      }

    };

    initData();
  }, []);

  // 업종 카테고리가 변경될 때마다 지도 정보 업데이트
  useEffect(() => {
    const fetchMapData = async () => {
      if(!selectedCategoryId) return;
      setMapLoading(true);

      try {
        const data = await marketApi.getMapInfo(DEFAULT_PROVINCE, selectedCategoryId);
        setMapData(data);
      } catch(error) {
        console.error("지도 데이터 로드 실패:", error);
      } finally {
        setMapLoading(false);
      }

    };

    fetchMapData();
  }, [selectedCategoryId]);

  // 지역 선택시 나타나는 상세 분석 핸들러
  const handleSelectRegion = async (admCode: string) => {
    const targetAdmCode = convertToMoisCode(admCode);
    setSelectedRegionCode(targetAdmCode);
    await fetchMarketDetail(targetAdmCode, selectedCategoryId);
  };

  // 상세 정보 로드 함수
  const fetchMarketDetail = async (admCode: string, categoryId: number) => {
    setLoading(true);
    setMarketDetail(null);

    try {
      const data = await marketApi.getMarketAnalysis(admCode, categoryId);
      setMarketDetail(data);
    } catch(error) {
      console.error("상세 분석 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }

  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const newCategoryId = Number(e.target.value);
    setSelectedCategoryId(newCategoryId);

    // 이미 지역을 선택했다면 상세 분석 정보도 갱신
    if(selectedRegionCode) {
      fetchMarketDetail(selectedRegionCode, newCategoryId);
    }

  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-gray-50">
      {/* 상단 헤더 영역: 제목 및 필터 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🗺️ 상권 지도 분석
        </h1>
        
        {/* 업종 선택 드롭다운 (DaisyUI Select) */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">분석 업종:</span>
          <select 
            className="select select-bordered select-sm w-full max-w-xs"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            disabled={categories.length === 0}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* 왼쪽: 지도 영역 */}
        <div className="w-2/3 h-full rounded-xl overflow-hidden shadow-lg border border-gray-200 relative bg-white">
          {mapLoading && (
             <div className="absolute inset-0 z-10 bg-white/50 flex justify-center items-center">
                <span className="loading loading-spinner text-primary"></span>
             </div>
          )}
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

            
              {/* 3. 핵심 요약 카드 */}
              <div className="stats shadow mb-6 w-full">
  
                <div className="stat place-items-center">
                  <div className="stat-title">경쟁 점포 수</div>
                  <div className="stat-value text-secondary text-2xl">
                    {marketDetail.storeCount.toLocaleString()}개
                  </div>
                  <div className="stat-desc">선택 지역 내</div>
                </div>
                
                <div className="stat place-items-center">
                  <div className="stat-title">잠재 고객(유동)</div>
                  <div className="stat-value text-secondary text-2xl">
                    {(marketDetail.floatingPopulation / 10000).toFixed(1)}만명
                  </div>
                </div>

              </div>

              {/* 핵심 지표 하이라이트 */}
              <div className="alert shadow-lg bg-base-100 border-l-4 border-primary">
                <div>
                  <h3 className="font-bold">점포 1곳당 약 {Math.round(marketDetail.populationPerStore)}명의 유동인구</h3>
                  <div className="text-xs text-gray-500">
                    이 수치가 높을수록 경쟁 강도가 낮아 영업하기 유리한 환경입니다.
                  </div>
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
