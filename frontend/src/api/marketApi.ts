import type { MarketMapData } from "../types/map";
import type { Category, MarketAnalysisRequest, MarketDetailResponse, StartupRankingResponse } from "../types/market";
import axiosClient from "./axiosClient";

export const marketApi = {
  getMarketAnalysis: async (admCode: string, categoryId: number): Promise<MarketDetailResponse> => {
    const {data} = await axiosClient.get<MarketDetailResponse>("/market/analysis", {
      params: {admCode, categoryId},
    });
    return data;
  },

  getMarkgetRankings: async (request: MarketAnalysisRequest): Promise<StartupRankingResponse[]> => {
    const {data} = await axiosClient.post<StartupRankingResponse[]>('/market/ranking', request);
    return data;
  },

  getMapInfo: async (province: string, categoryId: number): Promise<MarketMapData[]> => {
    const {data} = await axiosClient.get<MarketMapData[]>('/market/map-info', {
      params: {province, categoryId},
    });
    return data;
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await axiosClient.get<Category[]>("/market/categories");
    return data;
  },
}