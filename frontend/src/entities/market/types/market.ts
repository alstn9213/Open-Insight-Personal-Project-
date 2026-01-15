export type MarketGrade = "GREEN" | "YELLOW" | "RED";

export type SortOption = 'OPPORTUNITY' | 'OVERCROWDED' | 'POPULATION' | 'STORE_COUNT';

export interface MarketDetailResponse {
  statsId: number;
  regionName: string;
  categoryName: string;
  storeCount: number;
  floatingPopulation: number;
  populationPerStore: number
  marketGrade: MarketGrade;
  description: string;
  malePercent: number;
  femalePercent: number;
  ageGroup: string;
}

export interface MarketAnalysisRequest {
  admCode: string | null;       // 전체 지역 대상일 경우 null
  categoryId: number | null;    // 전체 업종 대상일 경우 null
  sortOption: SortOption;
}

export interface StartupRankingResponse {
  statsId: number;
  regionName: string;
  categoryName: string;
  storeCount: number;
  floatingPopulation: number;
  populationPerStore: number;
  badge: string | null;
}

export interface Category {
  id: number;
  name: string;
}