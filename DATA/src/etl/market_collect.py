import os
import sys
import random
import time
import requests
import pandas as pd
from dotenv import load_dotenv

current_dir = os.path.dirname(os.path.abspath(__file__)) # .../src/etl
project_root = os.path.abspath(os.path.join(current_dir, "../../")) # .../DATA (두 단계 위로)
sys.path.append(project_root)
from src.config.database import get_connection

def fetch_store_data():
  conn = get_connection()
  
  try:
    print("상권 분석 데이터 생성 및 적재 시작...")

    regions_df = pd.read_sql("SELECT region_id FROM regions", conn)
    categories_df = pd.read_sql("SELECT category_id FROM categories", conn)
    
    if regions_df.empty or categories_df.empty:
      print("기초 데이터(Region/Category)가 없습니다. init_data.py를 먼저 실행하세요.")
      return
    
    market_data_list = []
    
    for r_id in regions_df['region_id']:
      for c_id in categories_df['category_id']:
        
      # 가상 데이터 생성 (공공데이터 API 연동 전 테스트용)
        store_count = random.randint(10, 200)       # 점포 수
        average_sales = random.randint(2000, 8000) * 10000 # 평균 매출 (2천~8천만원)
        growth_rate = round(random.uniform(-5.0, 10.0), 2) # 성장률 (-5% ~ 10%)
        closing_rate = round(random.uniform(0.0, 5.0), 2)
        
        # 포화(saturation) 지수 계산
        saturation_index = round(growth_rate - closing_rate, 2) # (성장률 - 폐업률)이 높을수록 좋음
        
        market_grade = 'YELLOW'
        if saturation_index >= 3.0:
          market_grade = 'GREEN'
        elif saturation_index <= 0.0:
          market_grade = 'RED'
          
        market_data_list.append({
          'region_id': r_id,
          'category_id': c_id,
          'store_count': store_count,
          'average_sales': average_sales,
          'growth_rate': growth_rate,
          'closing_rate': closing_rate,
          'saturation_index': saturation_index,
          'market_grade': market_grade,
          'created_at': pd.Timestamp.now(),
          'updated_at': pd.Timestamp.now()
        })

    df = pd.DataFrame(market_data_list)

    df.to_sql(name='market_stats', con=conn, if_exists='append', index=False)
    print(f"총 {len(df)}건의 상권 분석 데이터 적재 완료!")
  except Exception as e:
    print(f"데이터 적재 중 오류 발생: {e}")
  finally:
    conn.close()
    
if __name__ == "__main__":
  fetch_store_data()