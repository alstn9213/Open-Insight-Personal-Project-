import { GRADE_COLORS } from "../../../shared/constants/map";

// 범례 컴포넌트 (지도 위에 둥둥 떠있는 상자)
export const MapLegend = () => {
  return (
    <div className="absolute top-8 right-8 z-[100] bg-white/95 p-4 rounded-xl shadow-xl border border-gray-200 backdrop-blur-sm">
      
      <h4 className="text-sm font-bold mb-3 text-gray-800 border-b pb-2">
        🚦 밀집도 등급
      </h4>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shadow-sm border border-gray-300"
            style={{ backgroundColor: GRADE_COLORS.GREEN.fill }}
          ></span>
          <span className="text-xs text-gray-600 font-medium">
            {GRADE_COLORS.GREEN.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shadow-sm border border-gray-300"
            style={{ backgroundColor: GRADE_COLORS.YELLOW.fill }}
          ></span>
          <span className="text-xs text-gray-600 font-medium">
            {GRADE_COLORS.YELLOW.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shadow-sm border border-gray-300"
            style={{ backgroundColor: GRADE_COLORS.RED.fill }}
          ></span>
          <span className="text-xs text-gray-600 font-medium">
            {GRADE_COLORS.RED.label}
          </span>
        </div>

      </div>

      <p className="text-[10px] text-gray-400 mt-3 text-center">
        * 해당 구역의 ( 점포 수 / 유동인구 ) 기준
      </p>
      
    </div>
  );
};
