import sys
import os
import json
import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__)) # /src/etl
project_root = os.path.abspath(os.path.join(current_dir, "../../")) # /DATA
sys.path.append(project_root)

from src.config.database import db_connection
from src.config.constants import TARGET_CATEGORY_CODES, KOSTAT_TO_MOIS_GU



def init_basic_data():
  print("기초 데이터 적재를 시작합니다...")

  csv_path = os.path.abspath(os.path.join(project_root, "resources/category_code.csv"))
  try:
    print(f"업종 코드 csv 파일을 읽습니다: {csv_path}") 
    try:
      df_csv = pd.read_csv(csv_path, encoding="cp949")
    except UnicodeDecodeError:
      df_csv = pd.read_csv(csv_path, encoding="utf-8")

    df_filtered = df_csv[df_csv["소분류코드"].isin(TARGET_CATEGORY_CODES)]
    categories = df_filtered[["소분류명"]].drop_duplicates().rename(columns={"소분류명": "name"})
    print(f"총 {len(categories)}개의 업종 데이터를 적재합니다.")

    with db_connection.connect() as conn:
      try:
        categories.to_sql(name="categories", con=conn, if_exists="append", index=False)
        print("업종 데이터 적재 완료")
      except Exception as e:
        print(f"업종 데이터 적재 중 중복 오류 발생: {e}")
  except FileNotFoundError:
    print("CSV 파일을 찾을 수 없습니다.")
  except Exception as e:
    print(f"CSV 데이터 처리 단계에서 알 수 없는 오류 발생: {e}")

  geojson_path = os.path.abspath(os.path.join(
     project_root,
     "../FRONT/public/assets/geojson/Local_HangJeongDong-master/hangjeongdong_서울특별시.geojson"
  ))

  print(f"GeoJSON 파일을 읽습니다: {geojson_path}")
  try:
    with open(geojson_path, "r", encoding="utf-8") as f:
        geo_data = json.load(f)

    region_list = []
     
    for feature in geo_data["features"]:
      props = feature["properties"]
      full_adm_code = str(props.get("adm_cd"))
      full_name = props.get("adm_nm")

      if full_adm_code and full_name:        
        fianl_adm_cdoe = full_adm_code

        if len(full_adm_code) == 7:
          gu_code_kostat = full_adm_code[:5] # 앞 5자리(서울+구)
          dong_code = full_adm_code[5:] # 뒤 2자리(동)

          if gu_code_kostat in KOSTAT_TO_MOIS_GU:
            new_gu_code = KOSTAT_TO_MOIS_GU[gu_code_kostat]
            fianl_adm_cdoe = new_gu_code + dong_code + "0" 
          else:
            fianl_adm_cdoe += 0

        # 서울특별시 강남구 역삼1동 -> '서울특별시'와 '강남구 역삼1동'으로 분리
        parts = full_name.split(" ", 1)
        province = parts[0]
        district = parts[1] if len(parts) > 1 else full_name

        region_list.append({
            "province": province,
            "district": district,
            "adm_code": fianl_adm_cdoe
        })

    regions = pd.DataFrame(region_list)

    print(f"[Regions] 서울시 {len(regions)}개 행정동 데이터 적재 중...")

    with db_connection.connect() as conn:
      regions.to_sql(name="regions", con=conn, if_exists="append", index=False)
      print("지역 데이터 초기화 완료")

  except FileNotFoundError:
    print("GeoJSON 파일을 찾을 수 없습니다.")
  except Exception as e:
    print(f"GeoJson 데이터 처리 단계에서 알 수 없는 오류 발생: {e}")

  print("모든 기초 데이터 준비 완료!")

if __name__ == "__main__":
  init_basic_data()