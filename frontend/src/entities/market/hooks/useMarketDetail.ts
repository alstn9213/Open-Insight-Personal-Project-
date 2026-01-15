import { useState, useEffect } from "react";
import { marketApi } from "../api/marketApi";
import type { MarketDetailResponse } from "../types/market";

export const useMarketDetail = (
  admCode: string | null,
  categoryId: number | null
) => {
  const [marketDetail, setMarketDetail] = useState<MarketDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarketDetail = async () => {
      if (!admCode || !categoryId) {
        setMarketDetail(null); // 행정동 코드나 카테고리가 없으면 데이터를 비워둠
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await marketApi.getMarketAnalysis(admCode, categoryId);
        setMarketDetail(data);
      } catch (err) {
        setError(err as Error);
        // UI에서 에러를 직접 처리하므로 console.error는 주석 처리하거나 로깅 서비스에 보낼 수 있습니다.
        // console.error("Failed to load market detail data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketDetail();
  }, [admCode, categoryId]);

  return { marketDetail, isLoading, error };
};
