import { useMemo } from "react";
import type { MarketMapData } from "../../map/types/map";

export const useMarketDataMap = (mapData: MarketMapData[]) => {
  const mapDataMap = useMemo(() => {
    const map = new Map<string, MarketMapData>();
    mapData.forEach((data) => {
      map.set(data.admCode, data);
    });
    return map;
  }, [mapData]);

  return mapDataMap;
};
