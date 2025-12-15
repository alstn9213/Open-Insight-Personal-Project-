import type { MarketDetailResponse } from "../../types/market";
import GrowthChart from "./GrowthChart";
import SalesChart from "./SalesChart";

interface AnalysisChartProps {
  data: MarketDetailResponse | null;
  loading?: boolean;
}

const AnalysisChart = ({data, loading = false}: AnalysisChartProps) => {
  if(loading) {
    return(
      <div className="flex justify-center items-center h-64 w-full bg-gray-50 rounded-xl border border-gray-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if(!data) {
    return(
      <div className="flex flex-col items-center justify-center h-64 w-full bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
        <span className="text-4xl mb-2">📉</span>
        <p>표시할 분석 데이터가 없습니다.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {/* 1. 매출 및 규모 분석 (SalesChart) */}
      <div className="card bg-white shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          💰 매출 및 규모
          <div className="tooltip" data-tip="월 평균 매출과 점포 수를 비교합니다.">
            <span className="badge badge-xs badge-info text-white">?</span>
          </div>
        </h3>
        <div className="relative h-64 w-full">
          <SalesChart
            averageSales={data.averageSales ?? 0}
            storeCount={data.storeCount ?? 0}
          />
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          * 매출 단위: 만원 / 점포 수 단위: 개
        </div>
      </div>

      {/* 2. 성장성 및 위험도 분석 (GrowthChart) */}
      <div className="card bg-white shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          📈 성장성 vs 위험도
          <div className="tooltip" data-tip="성장률에서 폐업률을 뺀 순성장률이 중요합니다.">
            <span className="badge badge-xs badge-info text-white">?</span>
          </div>
        </h3>
        <div className="relative h-64 w-full">
          <GrowthChart
            growthRate={data.growthRate ?? 0}
            closingRate={data.closingRate ?? 0}
            netGrowthRate={data.netGrowthRate ?? 0}
          />
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          * 순성장률 = 성장률 - 폐업률
        </div>
      </div>
    </div>
  );
};

export default AnalysisChart;