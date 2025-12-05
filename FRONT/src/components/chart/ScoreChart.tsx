import type { MarketGrade } from "../../types/market";

const GRADE_CONFIG = {
  GREEN: { color: "badge-success", text: "추천(안전)", icon: "🟢" },
  YELLOW: { color: "badge-warning", text: "주의 (정체)", icon: "🟡" },
  RED: { color: "badge-error", text: "위험 (쇠퇴)", icon: "🔴" },
};

const GradeBadge = ({grade}: {grade: MarketGrade}) => {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.YELLOW;

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-4xl mb-2">{config.icon}</span>
      <div className={`badge ${config.color} gap-2 p-4 text-white font-bold text-lg`}>
        {config.text}
      </div>
      <p className="text-sm text-gray-500 mt-2">상권 종합 등급</p>
    </div>
  );
};

export default GradeBadge;