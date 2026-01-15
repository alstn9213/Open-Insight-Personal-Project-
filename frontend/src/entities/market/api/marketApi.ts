import type { MarketMapData } from "../../map/types/map";
import type { Category, MarketDetailResponse } from "../types/market";
import axiosClient from "../../../api/axiosClient";

export const marketApi = {
  getMarketAnalysis: async (admCode: string, categoryId: number): Promise<MarketDetailResponse> => {
    const {data} = await axiosClient.get<MarketDetailResponse>("/market/analysis", {
      params: {admCode, categoryId},
    });
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