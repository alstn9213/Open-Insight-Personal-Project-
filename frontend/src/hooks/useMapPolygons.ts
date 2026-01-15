import { useMemo } from "react";
import type { GeoJsonCollection, MarketMapData } from "../entities/map/types/map";
import { getPathFromRing } from "../shared/utils/mapUtils";
import { GRADE_COLORS } from "../shared/constants/map";

export const useMapPolygons = (
  geoJson: GeoJsonCollection | null,
  mapDataMap: Map<string, MarketMapData>
) => {
  const polygons = useMemo(() => {
    if (!geoJson) return [];

    return geoJson.features.flatMap((feature, index) => {
      const props = feature.properties;
      if (!props) return [];

      let targetAdmCode = "";
      if (props.adm_cd2) targetAdmCode = String(props.adm_cd2).substring(0, 8);
      else targetAdmCode = String(props.adm_cd);

      const regionInfo = mapDataMap.get(targetAdmCode);
      const color =
        regionInfo?.marketGrade && GRADE_COLORS[regionInfo.marketGrade]
          ? GRADE_COLORS[regionInfo.marketGrade]
          : { fill: "#CCCCCC", stroke: "#999999" };

      const fillOpacity = regionInfo ? 0.6 : 0.2;

      const geometry = feature.geometry;
      const paths: { lat: number; lng: number }[][] = [];

      if (geometry.type === "Polygon") {
        paths.push(getPathFromRing(geometry.coordinates[0]));
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((polygonCoords) => {
          paths.push(getPathFromRing(polygonCoords[0]));
        });
      }

      return paths.map((path, pathIndex) => ({
        key: `${targetAdmCode}-${index}-${pathIndex}`,
        path,
        strokeWeight: 1,
        strokeColor: color.stroke,
        strokeOpacity: 0.8,
        strokeStyle: "solid" as const,
        fillColor: color.fill,
        fillOpacity,
        targetAdmCode,
      }));
    });
  }, [geoJson, mapDataMap]);

  return polygons;
};
