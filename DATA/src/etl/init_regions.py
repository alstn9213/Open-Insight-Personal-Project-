import json
import os
import sys
import pandas as pd
from sqlalchemy import text

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
sys.path.append(project_root)

from src.config.database import get_connection

def init_regions_from_geojson():
    geojson_path = os.path.join(project_root, "../FRONT/public/assets/geojson/HangJeongDong_ver20250401.geojson")
    print(f"GeoJson 로딩중...")
    with open(geojson_path, "r", encoding="utf-8") as f:
        geo_data = json.load(f)

    regions_list = []

    for feature in geo_data["features"]:
        props = feature["properties"]
        # adm_cd2는 행안부 코드(보통 10자리, API는 앞 8자리 사용)
        full_code = props.get("adm_cd2", "")
        api_code = full_code[:8] if full_code else ""
        full_name = props.get("adm_nm", "")

        # 서울특별시만 필터링
        if "서울특별시" not in full_name:
            continue

        # 서울시의 구와 동 얻기
        parts = full_name.split()
        if len(parts) >= 3:
            district = parts[1] # 구
            town = parts[2] # 동
        else:
            continue

        # 지역 이름 조합(시 + 구 + 동)
        regions_list.append({
            "adm_code": api_code, # 8자리 행정동 코드 저장
            "province": "서울특별시",
            "district": district,
            "town": town
        })

    df = pd.DataFrame(regions_list)
    conn = get_connection()

    try:
        print(f"{len(df)} 개의 지역을 DB에 적재 중...")
        df.to_sql(name="regions", con=conn, if_exists="append", index=False)
        print("적재 완료!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_regions_from_geojson()
