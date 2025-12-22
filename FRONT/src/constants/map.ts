export const GRADE_COLORS = {
  GREEN: { fill: "#00FF00", stroke: "#009900", label: "기회 (경쟁자 적음)" },
  YELLOW: { fill: "#FFFF00", stroke: "#999900", label: "보통 (경쟁자 적당)" },  
  RED: { fill: "#FF0000", stroke: "#990000", label: "과밀 (경쟁자 많음)" },
} as const;

export type MarketGradeType = keyof typeof GRADE_COLORS;