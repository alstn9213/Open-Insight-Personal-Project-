// 기본 좌표 타입 (경도, 위도)
export type Position = [number, number];

export type PolygonCoordinates = Position[][];

export type MultiPolygonCoordinates = PolygonCoordinates[];

export type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: PolygonCoordinates }
  | { type: "MultiPolygon"; coordinates: MultiPolygonCoordinates };

export interface GeoJsonProperties {
  adm_code: string; // 예: "1111051500"
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
