export type MarketGrade = "GREEN" | "YELLOW" | "RED";

export interface MarketDetailResponse {
  statsId: number;
  regionName: string;
  categoryName: string;
  averageSales: number;
  storeCount: number;
  growthRate: number;
  closingRate: number;
  netGrowthRate: number;
  marketGrade: MarketGrade;
  description: string;
}