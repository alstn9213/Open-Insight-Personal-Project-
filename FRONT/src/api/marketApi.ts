import type { MarketMapData } from "../types/map";
import type { MarketAnalysisRequest, MarketDetailResponse, StartupRankingResponse } from "../types/market";
import axiosClient from "./axiosClient";

export const marketApi = {
  getMarketAnalysis: async (admCode: string, categoryId: number): Promise<MarketDetailResponse> => {
    const {data} = await axiosClient.get<MarketDetailResponse>("/market/analysis", {
      params: {admCode, categoryId},
    });
    return data;
  },

  getStartupRanking: async (request: MarketAnalysisRequest): Promise<StartupRankingResponse[]> => {
    const {data} = await axiosClient.post<StartupRankingResponse[]>('/market/recommend', request);
    return data;
  },

  getMapInfo: async (province: string, categoryId: number): Promise<MarketMapData[]> => {
    const {data} = await axiosClient.get<MarketMapData[]>('/market/map-info', {
      params: {province, categoryId},
    });
    return data;
  }
}