export type MarketGrade = "GREEN" | "YELLOW" | "RED";

export interface MarketDetailResponse {
  statsId: number;
  regionName: string;
  categoryName: string;
  averageSales: number | null;
  storeCount: number | null;
  growthRate: number | null;
  closingRate: number | null;
  netGrowthRate: number | null;
  marketGrade: MarketGrade;
  description: string;
}

export interface WeightOption {
  salesWeight: number;     // 매출 비중
  stabilityWeight: number; // 안정성(폐업률) 비중
  growthWeight: number;    // 성장률 비중
}

export interface MarketAnalysisRequest {
  admCode: string | null;       // 전체 지역 대상일 경우 null
  categoryId: number | null;    // 전체 업종 대상일 경우 null
  weightOption: WeightOption;
}

export interface StartupRankingResponse {
  rank: number;
  regionName: string;
  categoryName: string;
  totalScore: number;
  badge: string | null;
}

export interface Category {
  id: number;
  name: string;
}