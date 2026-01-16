import { useState, useEffect } from 'react';
import { marketApi } from '../entities/market/api/marketApi';
import type { Category } from '../entities/market/types/market';
import type { GeoJsonCollection } from '../entities/map/types/map';

const SEOUL_ADM_CODE_PREFIX = '11';

export const useInitialData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [geoJson, setGeoJson] = useState<GeoJsonCollection | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setInitialLoading(true);
        const [geoResponse, categoryResponse] = await Promise.all([
          fetch('/assets/geojson/HangJeongDong_ver20250401.geojson'),
          marketApi.getCategories(),
        ]);

        if (!geoResponse.ok) {
          throw new Error('Failed to load GeoJSON.');
        }

        const geoData = await geoResponse.json();
        const seoulFeatures = geoData.features.filter((feature: any) => {
          const admCode = String(feature.properties.adm_cd);
          return admCode.startsWith(SEOUL_ADM_CODE_PREFIX);
        });

        setGeoJson({ ...geoData, features: seoulFeatures });
        setCategories(categoryResponse);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      } finally {
        setInitialLoading(false);
      }
    };

    initData();
  }, []);

  return { categories, geoJson, initialLoading, error };
};
