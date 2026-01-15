import { Map as KakaoMap, Polygon, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState } from "react";
import type { MarketMapData, GeoJsonCollection } from "../types/map";
import { useMapPolygons } from "../../../hooks/useMapPolygons";
import { useMarketDataMap } from "../../market/hooks/useMarketDataMap";
import { MapLegend } from "./MapLegend";

interface AnalysisMapProps {
  mapData: MarketMapData[];
  geoJson: GeoJsonCollection | null;
  onSelectRegion: (admCode: string) => void;
}

export const AnalysisMap = ({ mapData, geoJson, onSelectRegion }: AnalysisMapProps) => {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ["services", "clusterer"],
  });

  const [center] = useState({ lat: 37.566826, lng: 126.9786567 });

  const mapDataMap = useMarketDataMap(mapData);
  const polygons = useMapPolygons(geoJson, mapDataMap);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        <span className="loading loading-spinner loading-md"></span>
        <span className="ml-2">지도를 불러오는 중...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 font-bold p-4">
        지도를 불러오는데 실패했습니다. API 키를 확인해주세요.
      </div>
    );

  return (
    <KakaoMap
      center={center}
      style={{ width: "100%", height: "100%" }}
      level={8}
    >
      <MapLegend />

      {polygons.map((polygonProps) => (
        <Polygon
          key={polygonProps.key}
          path={polygonProps.path}
          strokeWeight={polygonProps.strokeWeight}
          strokeColor={polygonProps.strokeColor}
          strokeOpacity={polygonProps.strokeOpacity}
          strokeStyle={polygonProps.strokeStyle}
          fillColor={polygonProps.fillColor}
          fillOpacity={polygonProps.fillOpacity}
          onMouseover={(p) =>
            p.setOptions({ fillOpacity: 0.8, strokeWeight: 2 })
          }
          onMouseout={(p) =>
            p.setOptions({
              fillOpacity: polygonProps.fillOpacity,
              strokeWeight: 1,
            })
          }
          onClick={() => onSelectRegion(polygonProps.targetAdmCode)}
        />
      ))}
    </KakaoMap>
  );
};
