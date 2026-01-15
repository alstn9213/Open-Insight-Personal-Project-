import { useState, useEffect } from "react";
import { marketApi } from "../api/marketApi";
import type { MarketMapData } from "../../map/types/map";
import type { MarketDetailResponse } from "../types/market";

const DEFAULT_PROVINCE = "서울특별시";

export const useMarketAnalysis = (initialCategoryId: number | null) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string | null>(null);

  const [mapData, setMapData] = useState<MarketMapData[]>([]);
  const [marketDetail, setMarketDetail] = useState<MarketDetailResponse | null>(null);

  const [mapLoading, setMapLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch map data when category changes
  useEffect(() => {
    const fetchMapData = async () => {
      if (!selectedCategoryId) return;
      setMapLoading(true);
      try {
        const data = await marketApi.getMapInfo(DEFAULT_PROVINCE, selectedCategoryId);
        setMapData(data);
      } catch (error) {
        console.error("Failed to load map data:", error);
      } finally {
        setMapLoading(false);
      }
    };
    fetchMapData();
  }, [selectedCategoryId]);

  // Fetch detail data
  const fetchMarketDetail = async (admCode: string, categoryId: number) => {
    setDetailLoading(true);
    setMarketDetail(null);
    try {
      const data = await marketApi.getMarketAnalysis(admCode, categoryId);
      setMarketDetail(data);
    } catch (error) {
      console.error("Failed to load market detail data:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handler for selecting a region on the map
  const handleSelectRegion = async (admCode: string) => {
    setSelectedRegionCode(admCode);
    if (selectedCategoryId) {
      await fetchMarketDetail(admCode, selectedCategoryId);
    }
  };

  // Handler for changing the category
  const handleCategoryChange = (newCategoryId: number) => {
    setSelectedCategoryId(newCategoryId);
    // If a region is already selected, refresh the detail view
    if (selectedRegionCode) {
      fetchMarketDetail(selectedRegionCode, newCategoryId);
    }
  };

  // Update selectedCategoryId when initialCategoryId changes
  useEffect(() => {
    setSelectedCategoryId(initialCategoryId);
  }, [initialCategoryId]);

  return {
    selectedCategoryId,
    mapData,
    marketDetail,
    mapLoading,
    detailLoading,
    handleSelectRegion,
    handleCategoryChange,
  };
};
