import React from 'react';
import { useMarketDetail } from '../../entities/market/hooks/useMarketDetail';

interface AnalysisReportProps {
  categoryId: number | null;
  regionCode: string | null;
}

const gradeInfo: any = {
    GREEN: {
      label: '매력도 높음',
      icon: '🟢',
      colorClasses: 'bg-green-50 text-green-800 border-green-200',
    },
    YELLOW: {
      label: '보통',
      icon: '🟡',
      colorClasses: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    RED: {
      label: '주의 필요',
      icon: '🔴',
      colorClasses: 'bg-red-50 text-red-800 border-red-200',
    },
  };

const StatCard: React.FC<{
    icon: string;
    label: string;
    value: string;
    unit: string;
  }> = ({ icon, label, value, unit }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-bold text-xl text-gray-800">
          {value}
          <span className="text-sm font-normal ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  categoryId,
  regionCode,
}) => {
  const { marketDetail, isLoading, error } = useMarketDetail(regionCode, categoryId);

  // 1. 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 2. 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <span className="text-3xl mb-2">⚠️</span>
        <p className="font-semibold">상세 정보 로딩 실패</p>
        <p className="text-sm mt-1">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // 3. 데이터가 없는 초기 상태 또는 API 결과가 없는 상태
  if (!marketDetail) {
    const message = regionCode
      ? "해당 지역의 분석 데이터가 없습니다."
      : "지도에서 지역을 클릭하면<br/>상세 분석 결과가 표시됩니다.";
    const icon = regionCode ? "🤔" : "👆";

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
        <span className="text-4xl mb-2">{icon}</span>
        <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    );
  }

  const currentGrade = gradeInfo[marketDetail.marketGrade];
  
  // 4. 데이터가 성공적으로 로드된 상태
  return (
    <div className="space-y-6 animate-fade-in h-full">
      {/* 리포트 헤더 */}
      <div>
        <p className="text-gray-600 font-medium">{marketDetail.regionName}</p>
        <h3 className="text-2xl font-bold text-gray-800">{marketDetail.categoryName}</h3>
      </div>

      {/* 종합 평가 */}
      <div className={`p-4 rounded-xl border ${currentGrade.colorClasses}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{currentGrade.icon}</span>
          <div>
            <p className="font-bold text-lg">{currentGrade.label}</p>
            <p className="text-sm leading-snug">{marketDetail.description}</p>
          </div>
        </div>
      </div>
      
      {/* 핵심 지표 */}
      <div>
        <h4 className="text-lg font-bold mb-3 text-gray-700">핵심 지표</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StatCard
            icon="🏪"
            label="경쟁 점포 수"
            value={marketDetail.storeCount.toLocaleString()}
            unit="개"
          />
          <StatCard
            icon="🚶"
            label="일일 유동인구"
            value={(marketDetail.floatingPopulation / 10000).toFixed(1)}
            unit="만 명"
          />
          <StatCard
            icon="📈"
            label="점포당 유동인구"
            value={Math.round(marketDetail.populationPerStore).toLocaleString()}
            unit="명"
          />
        </div>
      </div>

      {/* 인구 통계 */}
      <div>
        <h4 className="text-lg font-bold mb-3 text-gray-700">인구 통계</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StatCard
                icon="👨"
                label="남성 비율"
                value={`${marketDetail.malePercent}`}
                unit="%"
            />
            <StatCard
                icon="👩"
                label="여성 비율"
                value={`${marketDetail.femalePercent}`}
                unit="%"
            />
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between mt-3">
            <div className='flex items-center gap-4'>
                <div className="text-3xl">🎯</div>
                <div>
                    <div className="text-sm text-gray-500">주요 연령층</div>
                    <div className="font-bold text-xl text-gray-800">
                        {marketDetail.ageGroup}
                    </div>
                </div>
            </div>
            <span className="badge badge-primary font-bold">비중 1위</span>
        </div>
      </div>
    </div>
  );
};