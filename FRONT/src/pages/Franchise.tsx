import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import franchiseData from "../mocks/franchiseData.json";

interface ComparisonItem {
  label: string;
  franchiseValue: number;
  localAverage: number;
  unit: string;
}

interface FranchiseData {
  brandName: string;
  lifespan: ComparisonItem;
  initialCost: ComparisonItem;
  risk: ComparisonItem;
}

const Franchise = () => {
  const [data, setData] = useState<FranchiseData | null>(null);

  useEffect(() => {
    setData(franchiseData);
  }, []);

  if(!data) return <div className="p-10 text-center">로딩중...</div>;

  const chartData = {
    labels: ["존속 기간(개월)", "초기 비용(만원)", "폐업률(%)"],
    datasets : [
      {
        label: `${data.brandName}`,
        data: [
          data.lifespan.franchiseValue,
          data.initialCost.franchiseValue,
          data.risk.franchiseValue,
        ],
        backgroundColor: "rgba(59, 130, 246, 0.7)", // 파란색 (프랜차이즈)
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "지역 개인창업 평균",
        data: [
          data.lifespan.localAverage,
          data.initialCost.localAverage,
          data.risk.localAverage,
        ],
        backgroundColor: "rgba(156, 163, 175, 0.7)", // 회색 (평균)
        borderColor: "rgba(156, 163, 175, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${data.brandName} vs 개인 창업 지표 비교`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        ⚖️ 프랜차이즈 vs 개인 창업 비교
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 왼쪽: 차트 영역 */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <Bar data={chartData} options={options} />
        </div>

        {/* 오른쪽: 텍스트 분석 결과 */}
        <div className="flex flex-col gap-4">
          <div className="card bg-base-100 shadow-md border border-gray-200">
            <div className="card-body">
              <h3 className="card-title text-blue-600">💡 분석 인사이트</h3>
              <p className="text-gray-600">
                선택하신 <strong>{data.brandName}</strong>은(는) 지역 평균보다{" "}
                <span className="text-green-600 font-bold">오래 생존</span>
                하지만,{" "}
                <span className="text-red-500 font-bold">초기 비용이 더 높습니다.</span>
              </p>
              
              <div className="divider"></div>

              <div className="stats stats-vertical lg:stats-horizontal shadow bg-gray-50">
                <div className="stat">
                  <div className="stat-title">평균 존속 기간</div>
                  <div className="stat-value text-primary">{data.lifespan.franchiseValue}개월</div>
                  <div className="stat-desc">개인보다 +{data.lifespan.franchiseValue - data.lifespan.localAverage}개월</div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">폐업률 위험도</div>
                  <div className="stat-value text-secondary">{data.risk.franchiseValue}%</div>
                  <div className="stat-desc text-green-600">평균보다 안전함</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Franchise;