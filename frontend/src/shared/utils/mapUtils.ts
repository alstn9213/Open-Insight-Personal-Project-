// GeoJSON의 경도, 위도 좌표를 카카오맵의 좌표 형식으로 변환합니다.
export const getPathFromRing = (ring: number[][]) => {
  return ring.map((coord) => ({
    lng: coord[0],
    lat: coord[1],
  }));
};
