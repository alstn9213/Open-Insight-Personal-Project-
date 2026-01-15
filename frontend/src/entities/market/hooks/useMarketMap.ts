import { useState, useEffect } from "react";
import { marketApi } from "../api/marketApi";
import type { MarketMapData } from "../../map/types/map";

const DEFAULT_PROVINCE = "서울특별시";

export const useMarketMap = (categoryId: number | null) => {
  const [mapData, setMapData] = useState<MarketMapData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      if (!categoryId) {
        setMapData([]); // 카테고리 ID가 없으면 데이터 초기화
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await marketApi.getMapInfo(DEFAULT_PROVINCE, categoryId);
        setMapData(data);
      } catch (err) {
        setError(err as Error);
        // UI에서 에러를 직접 처리하므로 console.error는 주석 처리하거나 로깅 서비스에 보낼 수 있습니다.
        // console.error("Failed to load map data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMapData();
  }, [categoryId]);

  return { mapData, isLoading, error };
};
