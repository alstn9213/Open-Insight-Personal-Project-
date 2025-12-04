import pandas as pd
import sys
import os
from sqlalchemy import text

current_dir = os.path.dirname(os.path.abspath(__file__)) # .../src/etl
project_root = os.path.abspath(os.path.join(current_dir, "../../")) # .../DATA (두 단계 위로)
sys.path.append(project_root)

from src.config.database import db_connection

def init_basic_data():
  
  categories = pd.DataFrame({
    'name': ['카페', '치킨', '편의점', '미용실']
  })
  
  regions = pd.DataFrame({
        'province': [
            '서울특별시', '서울특별시', '서울특별시', 
            '부산광역시', '경기도'
        ],
        'district': [
            '강남구 역삼1동', '마포구 서교동', '송파구 잠실6동', 
            '해운대구 우1동', '성남시 분당구 정자1동'
        ],
        'adm_code': [
            '11680640',  # 1168064000 -> 11680640
            '11440660',  # 1144066000 -> 11440660
            '11710710',  # 1171071000 -> 11710710
            '26350510',  # 2635051000 -> 26350510
            '41135550'   # 4113555000 -> 41135550
        ]
    })
  
  try:
    print("기초 데이터 적재를 시작합니다...")
    
    with db_connection.connect() as conn:
      # 기존 데이터 중복 적재 방지를 위해 간단히 테이블을 비우거나(Truncate) 
      # 혹은 중복 체크 로직이 필요하지만, 초기화 스크립트이므로 IGNORE 등을 사용할 수도 있습니다.
      # 여기서는 편의상 중복 에러가 나면 넘어가도록 처리합니다.
      print(f"[Categories] {len(categories)}건 적재 중...")
      try:
          categories.to_sql(name='categories', con=conn, if_exists='append', index=False)
      except Exception:
          print(" -> categories 테이블에 데이터가 이미 있거나 중복됩니다. (Skip)")

      print(f"[Regions] {len(regions)}건 적재 중...")
      try:
          regions.to_sql(name='regions', con=conn, if_exists='append', index=False)
      except Exception:
            print(" -> regions 테이블에 데이터가 이미 있거나 중복됩니다. (Skip)")

    print("✅ 모든 기초 데이터 준비 완료!")
    
  except Exception as e:
    print("데이터 저장 중 오류 발생:", e)
    
if __name__ == "__main__":
  init_basic_data()