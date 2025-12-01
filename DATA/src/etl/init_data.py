import pandas as pd
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__)) # .../src/etl
project_root = os.path.abspath(os.path.join(current_dir, "../../")) # .../DATA (두 단계 위로)
sys.path.append(project_root)

from src.config.database import db_connection

def init_basic_data():
  
  # 업종 코드와 매핑될 기준
  categories = pd.DataFrame({
    'name': ['한식', '카페', '치킨', '편의점', '베이커리']
  })
  
  # 지역 데이터
  regions = pd.DataFrame({
    'province': ['서울특별시', '서울특별시', '부산광역시'],
    'district': ['강남구', '마포구', '해운대구'],
    'adm_code': ['11680', '11440', '26350']
  })
  
  try:
    print("기초 데이터 적재를 시작합니다...")
    
    categories.to_sql(name='categories', con=db_connection, if_exists='append', index=False)
    print(f"[categories] 테이블에 데이터 {len(categories)}건 저장 완료!")

    regions.to_sql(name='regions', con=db_connection, if_exists='append', index=False)
    print(f"[regions] 테이블에 데이터 {len(regions)}건 저장 완료!")

    print("모든 기초 데이터 준비 끝! 이제 분석 데이터를 넣을 차례입니다.")
    
  except Exception as e:
    print("데이터 저장 중 오류 발생:", e)
    
  # finally:
  #   conn.close()
    
if __name__ == "__main__":
  init_basic_data()