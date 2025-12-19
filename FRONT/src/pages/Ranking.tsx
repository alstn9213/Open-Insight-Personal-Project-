import { useState, useEffect } from "react";
import type {
  MarketAnalysisRequest,
  SortOption,
  StartupRankingResponse,
} from "../types/market";
import { marketApi } from "../api/marketApi";

const Ranking = () => {
  const [rankings, setRankings] = useState<StartupRankingResponse[]>([]);
  const [currentSort, setCurrentSort] = useState<SortOption>("OPPORTUNITY");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 요청 파라미터 관리
  const [requestParams, setRequestParams] = useState<MarketAnalysisRequest>({
    admCode: null, 
    categoryId: null,
    sortOption: "OPPORTUNITY",
  });

  const handleSortChange = (option: SortOption) => {
    setCurrentSort(option);
    setRequestParams(prev => ({ ...prev, sortOption: option }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await marketApi.getMarkgetRankings(requestParams);
        setRankings(data);
      } catch(err) {
        console.error("랭킹 데이터 로드 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestParams]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center py-20">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-outline btn-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            🏆 지역별 상권 현황 랭킹
          </h2>
          <p className="text-gray-500 mt-2">
            데이터에 기반하여 공급 대비 수요가 좋은 지역을 찾으세요.
          </p>
        </div>
        
        {/* 탭 버튼 UI (DaisyUI Tabs) */}
        <div className="tabs tabs-boxed bg-gray-100 p-1 mt-4 md:mt-0">
          <a 
            className={`tab ${currentSort === 'OPPORTUNITY' ? 'tab-active bg-white shadow-sm font-bold text-primary' : ''}`}
            onClick={() => handleSortChange('OPPORTUNITY')}
          >
            💎 틈새시장 Top 10
          </a>
          <a 
            className={`tab ${currentSort === 'OVERCROWDED' ? 'tab-active bg-white shadow-sm font-bold text-red-500' : ''}`}
            onClick={() => handleSortChange('OVERCROWDED')}
          >
            🔥 격전지 Top 10
          </a>
          <a 
            className={`tab ${currentSort === 'POPULATION' ? 'tab-active bg-white shadow-sm font-bold' : ''}`}
            onClick={() => handleSortChange('POPULATION')}
          >
            🏃 유동인구 순
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="overflow-hidden shadow-xl rounded-2xl border border-gray-100 bg-white">
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="py-4 pl-6">순위</th>
                <th>지역 / 업종</th>
                <th className="text-right">점포 수</th>
                <th className="text-right">유동인구</th>
                <th className="text-right pr-6 bg-blue-50/50">
                  {/* 정렬 기준에 따라 헤더 이름 동적 변경 */}
                  {currentSort === 'OPPORTUNITY' || currentSort === 'OVERCROWDED' 
                    ? '점포 1곳당 인구 (명)' 
                    : '주요 지표'}
                </th>
              </tr>
            </thead>

            <tbody>
              {rankings.length > 0 ? (
                // ★ 여기가 핵심: index를 활용하여 순위 매기기
                rankings.map((item, index) => {
                  const rank = index + 1; // 0부터 시작하므로 +1
                  
                  return (
                    <tr key={`${rank}-${item.regionName}`} className="hover:bg-gray-50 transition-colors">
                      {/* 1. 순위 컬럼 */}
                      <td className="pl-6 font-bold text-lg">
                        {rank === 1 && "🥇"}
                        {rank === 2 && "🥈"}
                        {rank === 3 && "🥉"}
                        <span className="ml-2">{rank}위</span>
                      </td>

                      {/* 2. 지역 및 업종 */}
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-base">
                            {item.regionName}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                             <div className="badge badge-xs badge-outline">{item.categoryName}</div>
                             {item.badge && <span className="text-primary font-medium">{item.badge}</span>}
                          </span>
                        </div>
                      </td>

                      {/* 3. 팩트 데이터 (점포수, 유동인구) */}
                      <td className="text-right font-medium text-gray-600">
                        {item.storeCount.toLocaleString()}개
                      </td>
                      <td className="text-right font-medium text-gray-600">
                        {(item.floatingPopulation / 10000).toFixed(1)}만명
                      </td>

                      {/* 4. 핵심 지표 (점포당 인구수) */}
                      <td className="text-right pr-6 font-extrabold text-lg text-blue-600 bg-blue-50/30">
                        {Math.round(item.populationPerStore).toLocaleString()}명
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-400 flex flex-col items-center">
                    <span className="text-4xl mb-2">텅</span>
                    <span>조건에 맞는 데이터가 없습니다.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Ranking;