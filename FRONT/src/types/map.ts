// 기본 좌표 타입 (경도, 위도)
export type Position = [number, number];

// Polygon 좌표 구조: Position[][] (Ring)의 배열 -> Position[][][]
// GeoJSON 표준에서 Polygon은 Ring(닫힌 선)의 배열입니다. (첫 번째는 외곽선, 나머지는 구멍)
export type PolygonCoordinates = Position[][];

// MultiPolygon 좌표 구조: Polygon의 배열 -> Position[][][]
export type MultiPolygonCoordinates = PolygonCoordinates[];

export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: PolygonCoordinates }
  | { type: "MultiPolygon"; coordinates: MultiPolygonCoordinates };

export interface GeoJsonProperties {
  adm_cd: string; // 예: "1111051500"
  adm_cd2: string;
  adm_nm: string;   // 예: "청운효자동"
  [key: string]: unknown; // 추가 속성이 있을 경우를 대비 (optional)
}
// GeoJSON 관련 타입 (표준 GeoJSON 구조에 맞게 확장 가능)
export interface GeoJsonFeature {
  type: "Feature";
  properties: GeoJsonProperties;
  geometry: GeoJsonGeometry;
}
export interface GeoJsonCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface MarketMapData {
  admCode: string;
  district: string;
  storeCount: number;
  marketGrade: "GREEN" | "YELLOW" | "RED";
  netGrowthRate: number;
}

