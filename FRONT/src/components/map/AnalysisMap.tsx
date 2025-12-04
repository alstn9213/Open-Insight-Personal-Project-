import { Map, Polygon, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState } from "react";
import type { MarketMapData, GeoJsonCollection } from "../../types/map";

const GRADE_COLORS = {
  GREEN: { fill: "#00FF00", stroke: "#009900" },
  YELLOW: { fill: "#FFFF00", stroke: "#999900" },
  RED: { fill: "#FF0000", stroke: "#990000" },
} as const;

interface AnalysisMapProps {
  mapData: MarketMapData[];
  geoJson: GeoJsonCollection | null;
  onSelectRegion: (admCode: string) => void;
}

const AnalysisMap = ({ mapData, geoJson, onSelectRegion }: AnalysisMapProps) => {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ["services", "clusterer"],
  });

  const [center, setCenter] = useState({ lat: 37.566826, lng: 126.9786567 });

  const getPolygonPath = (coordinates: number[][][]) => {
    return coordinates[0].map((coord) => ({
      lng: coord[0],
      lat: coord[1],
    }));
  };

  const getRegionInfo = (admCode: string): MarketMapData | undefined => {
    return mapData.find((data) => data.admCode === admCode);
  };

  if (loading) return <div className="flex justify-center items-center h-full">지도를 불러오는 중...</div>;
  if (error) return <div className="text-red-500">지도를 불러오는데 실패했습니다.</div>;

  return (
    <Map
      center={center}
      style={{ width: "100%", height: "100%" }}
      level={8}
    >
      {geoJson &&
        geoJson.features.map((feature, index) => {
          const admCode = feature.properties.adm_code;
          const regionInfo = getRegionInfo(admCode);
          
          const grade = regionInfo?.marketGrade;
          const color = grade && GRADE_COLORS[grade]
            ? GRADE_COLORS[grade]
            : { fill: "#CCCCCC", stroke: "#999999" };

          return (
            <Polygon
              key={index}
              path={getPolygonPath(feature.geometry.coordinates)}
              strokeWeight={2}
              strokeColor={color.stroke}
              strokeOpacity={0.8}
              strokeStyle={"solid"}
              fillColor={color.fill}
              fillOpacity={0.6}
              onMouseover={(polygon) => polygon.setOptions({ fillOpacity: 0.8 })}
              onMouseout={(polygon) => polygon.setOptions({ fillOpacity: 0.6 })}
              onClick={() => onSelectRegion(admCode)}
            />
          );
        })}
    </Map>
  );
};

export default AnalysisMap;