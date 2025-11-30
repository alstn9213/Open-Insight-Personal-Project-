import { useState, useEffect } from "react";
import mockData from "../mocks/rankingData.json";

interface RankingItem {
  rank: number;
  regionName: string;
  categoryName: string;
  totalScore: number;
  badge: string | null;
}

const Ranking = () => {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      // 0.5초 뒤에 데이터를 가져온 것처럼 흉내냅니다.
      setTimeout(() => {
        setRankings(mockData);
        setLoading(false);
      }, 500);
    };
    fetchData();
  }, []);

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
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-100">
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
              {rankings.map((item) => (
                <tr key={item.rank} className="hover">
                  <td className="font-bold text-lg">
                    {/* 1~3위는 메달 아이콘 등으로 강조 가능 */}
                    {item.rank}위
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Ranking;