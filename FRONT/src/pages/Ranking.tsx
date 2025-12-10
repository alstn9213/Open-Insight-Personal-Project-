import { useState, useEffect } from "react";
import type {
  MarketAnalysisRequest,
  StartupRankingResponse,
} from "../types/market";
import { marketApi } from "../api/marketApi";

const Ranking = () => {
  const [rankings, setRankings] = useState<StartupRankingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 기본 요청 조건 (전체 지역, 전체 업종, 기본 가중치)
  // 추후 상단에 필터 UI를 만들어 이 상태값을 변경.
  const [requestParams] = useState<MarketAnalysisRequest>({
    admCode: null, // 전체 지역
    categoryId: null, // 전체 업종
    weightOption: {
      salesWeight: 0.4, // 매출 40%
      stabilityWeight: 0.4, // 안정성 40%
      growthWeight: 0.2, // 성장률 20%
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await marketApi.getStartupRanking(requestParams);
        setRankings(data);
      } catch (err) {
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📊 맞춤형 창업 순위 추천
      </h2>

      {/* 로딩 중일 때 보여줄 UI */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-100 bg-white">
          <table className="table table-zebra w-full">
            {/* 테이블 헤더 */}
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th>순위</th>
                <th>지역</th>
                <th>업종</th>
                <th>종합 점수</th>
                <th>특이사항</th>
              </tr>
            </thead>

            {/* 테이블 바디 */}
            <tbody>
              {rankings.length > 0 ? (
                rankings.map((item) => (
                  <tr key={`${item.rank}-${item.regionName}-${item.categoryName}`} className="hover">
                    <td className="font-bold text-lg">
                      {item.rank <= 3 ? (
                        <span className={`text-${item.rank === 1 ? 'yellow-500' : item.rank === 2 ? 'gray-400' : 'orange-400'}`}>
                          {item.rank}위 🏅
                        </span>
                      ) : (
                        <span>{item.rank}위</span>
                      )}
                    </td>
                    <td>{item.regionName}</td>
                    <td>
                      <div className="badge badge-outline">{item.categoryName}</div>
                    </td>
                    <td className="font-semibold text-blue-600">
                      {item.totalScore}점
                    </td>
                    <td>
                      {/* 뱃지가 있을 때만 렌더링 */}
                      {item.badge && (
                        <span
                          className={`badge ${
                            item.badge.includes("수익성")
                              ? "badge-primary"
                              : item.badge.includes("안전성")
                              ? "badge-success"
                              : "badge-secondary"
                          } text-white`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    조건에 맞는 랭킹 데이터가 없습니다.
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