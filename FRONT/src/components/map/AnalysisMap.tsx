import { Map, Polygon, useKakaoLoader } from "react-kakao-maps-sdk";
import { useMemo, useState } from "react";
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

const AnalysisMap = ({
  mapData,
  geoJson,
  onSelectRegion,
}: AnalysisMapProps) => {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ["services", "clusterer"],
  });

  // 서울 시청 중심 좌표
  const [center, setCenter] = useState({ lat: 37.566826, lng: 126.9786567 });

  // admCode로 백엔드 데이터 매핑을 빠르게 하기 위해 Map 객체로 변환 (최적화)
  const mapDataMap = useMemo(() => {
    const map = new Map<string, MarketMapData>();
    mapData.forEach((data) => map.set(data.admCode, data));
    return map;
  }, [mapData]);

  // 좌표 변환 함수 (GeoJSON [lng, lat] -> Kakao {lat, lng})
  const getPolygonPath = (coordinates: number[][][]) => {
    return coordinates[0].map((coord) => ({
      lng: coord[0],
      lat: coord[1],
    }));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        지도를 불러오는 중...
      </div>
    );
  if (error)
    return <div className="text-red-500">지도를 불러오는데 실패했습니다.</div>;

  return (
    <Map
      center={center}
      style={{ width: "100%", height: "100%" }}
      level={8}
    >
      {geoJson &&
        geoJson.features.map((feature, index) => {
          const admCode = feature.properties.adm_code;
          const regionInfo = mapDataMap.get(admCode); // 데이터 매핑

          // 데이터가 없으면 기본 회색, 있으면 등급별 색상
          const color = regionInfo?.marketGrade && GRADE_COLORS[regionInfo.marketGrade]
            ? GRADE_COLORS[regionInfo.marketGrade]
            : { fill: "#CCCCCC", stroke: "#999999" };
          
          const fillOpacity = regionInfo ? 0.6 : 0.3; // 데이터가 있으면 좀 더 진하게

          // Polygon과 MultiPolygon 처리 분기
          const coordinates = feature.geometry.coordinates;
          const type = feature.geometry.type;

          const paths = [];

          if (type === "Polygon") {
            // Polygon: coordinates[0]이 외곽선
            // 타입 단언을 사용하여 구조를 명확히 함
            const polygonCoords = coordinates as number[][][];
            paths.push(getPolygonPath(polygonCoords[0]));
          } else if (type === "MultiPolygon") {
            // MultiPolygon: 여러 개의 Polygon으로 구성됨
            const multiPolygonCoords = coordinates as number[][][][];
            multiPolygonCoords.forEach((polygon) => {
              paths.push(getPolygonPath(polygon[0]));
            });
          }

          // paths 배열에 있는 모든 폴리곤을 렌더링
          return paths.map((path, pathIndex) => (
            <Polygon
              key={`${index}-${pathIndex}`}
              path={path}
              strokeWeight={2}
              strokeColor={color.stroke}
              strokeOpacity={0.8}
              strokeStyle={"solid"}
              fillColor={color.fill}
              fillOpacity={fillOpacity}
              onMouseover={(polygon) => polygon.setOptions({ fillOpacity: 0.8 })}
              onMouseout={(polygon) => polygon.setOptions({ fillOpacity: fillOpacity })}
              onClick={() => onSelectRegion(admCode)}
            />
          ));
        })}
    </Map>
  );
};

export default AnalysisMap;