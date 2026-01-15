import React from 'react';
import type { MarketDetailResponse } from '../../entities/market/types/market';

interface AnalysisReportProps {
  marketDetail: MarketDetailResponse | null;
  isLoading: boolean;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  marketDetail,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!marketDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-4xl mb-2">👆</span>
        <p>지도에서 지역을 클릭하면<br/>상세 분석 결과가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">{marketDetail.regionName}</h3>
        <p className="text-gray-500 font-medium">{marketDetail.categoryName} 분석 결과</p>
      </div>

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

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
          👥 인구 통계
        </h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span className="text-blue-600 font-bold">👨 남성 {marketDetail.malePercent}%</span>
              <span className="text-pink-600 font-bold">👩 여성 {marketDetail.femalePercent}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-blue-400 transition-all duration-1000"
                style={{ width: `${marketDetail.malePercent}%` }}
              />
              <div
                className="h-full bg-pink-400 transition-all duration-1000"
                style={{ width: `${marketDetail.femalePercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-sm text-gray-500">주 이용 연령층</span>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-lg font-bold">
                {marketDetail.ageGroup}
              </span>
              <span className="text-xs text-gray-400">비중 1위</span>
            </div>
          </div>
        </div>
      </div>

      <div className="alert shadow-lg bg-base-100 border-l-4 border-primary">
        <div>
          <h3 className="font-bold">점포 1곳당 약 {Math.round(marketDetail.populationPerStore)}명의 유동인구</h3>
          <div className="text-xs text-gray-500">
            이 수치가 높을수록 영업하기 유리한 환경입니다.
          </div>
        </div>
      </div>
    </div>
  );
};

