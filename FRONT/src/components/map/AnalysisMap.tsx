// 리액트의 Map과 카카오맵에서 쓰는 Map이 겹치니까 별칭 설정
import { Map as KakaoMap, Polygon, useKakaoLoader } from "react-kakao-maps-sdk";
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

  // 초기 중심 좌표(서울 시청)
  const [center] = useState({ lat: 37.566826, lng: 126.9786567 });

  // admCode로 백엔드 데이터 매핑을 빠르게 하기 위해 Map 객체로 변환 (최적화)
  const mapDataMap = useMemo(() => {
    const map = new Map<string, MarketMapData>();
    mapData.forEach((data) => {
      const shortCode = data.admCode.substring(0, 8);
      map.set(shortCode, data);
    });
    return map;
  }, [mapData]);

  // 좌표 변환 함수 (GeoJSON [lng, lat] -> Kakao {lat, lng})
  const getPathFromRing = (ring: number[][]) => {
    return ring.map((coord) => ({
      lng: coord[0],
      lat: coord[1],
    }));
  };

  if(loading)
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        <span className="loading loading-spinner loading-md"></span>
        <span className="ml-2">지도를 불러오는 중...</span>
      </div>
    );
  if(error)
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
      {geoJson &&
        geoJson.features.map((feature, index) => {
          const { adm_cd } = feature.properties;
          const shortAdmCode = adm_cd.substring(0, 8);

          // 색상 결정 및 데이터 매핑
          const regionInfo = mapDataMap.get(shortAdmCode);
          const color =
            regionInfo?.marketGrade && GRADE_COLORS[regionInfo.marketGrade]
              ? GRADE_COLORS[regionInfo.marketGrade]
              : { fill: "#CCCCCC", stroke: "#999999" }; // 데이터 없으면 회색

          const fillOpacity = regionInfo ? 0.6 : 0.2;

          // Geometry 타입에 따른 좌표 처리 (Type Narrowing)
          const geometry = feature.geometry;
          const paths: { lat: number; lng: number }[][] = [];

          if (geometry.type === "Polygon") {
            paths.push(getPathFromRing(geometry.coordinates[0]));
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((polygonCoords) => {
              paths.push(getPathFromRing(polygonCoords[0]));
            });
          }

          // 4. 폴리곤 렌더링
          return paths.map((path, pathIndex) => (
            <Polygon
              key={`${shortAdmCode}-${index}-${pathIndex}`}
              path={path}
              strokeWeight={1}
              strokeColor={color.stroke}
              strokeOpacity={0.8}
              strokeStyle={"solid"}
              fillColor={color.fill}
              fillOpacity={fillOpacity}
              onMouseover={(polygon) =>
                polygon.setOptions({ fillOpacity: 0.8, strokeWeight: 2 })
              }
              onMouseout={(polygon) =>
                polygon.setOptions({
                  fillOpacity: fillOpacity,
                  strokeWeight: 1,
                })
              }
              onClick={() => onSelectRegion(adm_cd)}
            />
          ));
        })}
    </KakaoMap>
  );
};

export default AnalysisMap;
