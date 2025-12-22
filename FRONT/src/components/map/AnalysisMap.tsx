// 리액트의 Map과 카카오맵에서 쓰는 Map이 겹치니까 별칭 설정
import { Map as KakaoMap, Polygon, useKakaoLoader } from "react-kakao-maps-sdk";
import { useMemo, useState } from "react";
import type { MarketMapData, GeoJsonCollection } from "../../types/map";

const GRADE_COLORS = {
  GREEN: { fill: "#00FF00", stroke: "#009900", label: "기회 (경쟁자 적음)" },
  YELLOW: { fill: "#FFFF00", stroke: "#999900", label: "보통 (경쟁자 적당)" },  
  RED: { fill: "#FF0000", stroke: "#990000", label: "과밀 (경쟁자 많음)" },
} as const;

interface AnalysisMapProps {
  mapData: MarketMapData[];
  geoJson: GeoJsonCollection | null;
  onSelectRegion: (admCode: string) => void;
}

// 1. 범례 컴포넌트 생성 (지도 위에 둥둥 떠있는 상자)
const MapLegend = () => {
  return (
    <div className="absolute bottom-8 right-8 z-[100] bg-white/95 p-4 rounded-xl shadow-xl border border-gray-200 backdrop-blur-sm">
      <h4 className="text-sm font-bold mb-3 text-gray-800 border-b pb-2">
        🚦 밀집도 등급
      </h4>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shadow-sm border border-gray-300"
            style={{ backgroundColor: GRADE_COLORS.GREEN.fill }}
          ></span>
          <span className="text-xs text-gray-600 font-medium">
            {GRADE_COLORS.GREEN.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shadow-sm border border-gray-300"
            style={{ backgroundColor: GRADE_COLORS.YELLOW.fill }}
          ></span>
          <span className="text-xs text-gray-600 font-medium">
            {GRADE_COLORS.YELLOW.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded shadow-sm border border-gray-300"
            style={{ backgroundColor: GRADE_COLORS.RED.fill }}
          ></span>
          <span className="text-xs text-gray-600 font-medium">
            {GRADE_COLORS.RED.label}
          </span>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        * 해당 구역의 ( 점포 수 / 유동인구 ) 기준
      </p>
    </div>
  );
};

const AnalysisMap = ({mapData, geoJson, onSelectRegion}: AnalysisMapProps) => {
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
      map.set(data.admCode, data);
    });
    return map;
  }, [mapData]);
  
  // 좌표 변환 함수 (GeoJSON 경도 위도를 Kakao 경도 위도로)
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
      <MapLegend />
      {geoJson &&
        geoJson.features.map((feature, index) => {
          const props = feature.properties;
          if(!props) return null;
          let targetAdmCode = "";
          if(props.adm_cd2) {
            targetAdmCode = String(props.adm_cd2).substring(0, 8);
          } else {
            targetAdmCode = String(props.adm_cd);
          }
          const regionInfo = mapDataMap.get(targetAdmCode); // 색상 결정 및 데이터 매핑
          const color =
            regionInfo?.marketGrade && GRADE_COLORS[regionInfo.marketGrade]
              ? GRADE_COLORS[regionInfo.marketGrade]
              : { fill: "#CCCCCC", stroke: "#999999" }; // 데이터 없으면 회색

          const fillOpacity = regionInfo ? 0.6 : 0.2;

          // Geometry 타입에 따른 좌표 처리 (Type Narrowing)
          const geometry = feature.geometry;
          const paths: { lat: number; lng: number }[][] = [];

          if(geometry.type === "Polygon") {
            paths.push(getPathFromRing(geometry.coordinates[0]));
          } else if(geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((polygonCoords) => {
              paths.push(getPathFromRing(polygonCoords[0]));
            });
          }

          // 4. 폴리곤 렌더링
          return paths.map((path, pathIndex) => (
            <Polygon
              key={`${targetAdmCode}-${index}-${pathIndex}`}
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
              onClick={() => onSelectRegion(targetAdmCode)}
            />
          ));
        })}
    </KakaoMap>
  );
};

export default AnalysisMap;