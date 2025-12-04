// 백엔드 MarketMapResponse DTO와 일치하는 상권 데이터 타입
export interface MarketMapData {
  admCode: string;
  district: string;
  storeCount: number;
  marketGrade: "GREEN" | "YELLOW" | "RED";
  netGrowthRate: number;
}

// GeoJSON 관련 타입 (표준 GeoJSON 구조에 맞게 확장 가능)
export interface GeoJsonFeature {
  type: string;
  properties: {
    adm_code: string; // GeoJSON 파일의 속성명에 맞춤
  };
  geometry: {
    type: string;
    coordinates: number[][][]; // 3차원 배열 (Polygon 좌표)
  };
}

export interface GeoJsonCollection {
  type: string;
  features: GeoJsonFeature[];
}