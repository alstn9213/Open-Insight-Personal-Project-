import os
import sys
import random
import time
# import requests
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import text

current_dir = os.path.dirname(os.path.abspath(__file__)) # .../src/etl
project_root = os.path.abspath(os.path.join(current_dir, "../../")) # .../DATA (두 단계 위로)
sys.path.append(project_root)

from src.config.database import db_connection

load_dotenv()
API_KEY = os.getenv("PUBLIC_DATA_API_KEY")
API_URL = os.getenv("PUBLIC_DATA_API_URL")

def fetch_store_data():
  try:
    print("상권 분석 데이터 생성 및 적재 시작...")
    with db_connection.connect() as conn:
      regions_df = pd.read_sql(text("SELECT region_id, adm_code, province, district FROM regions"), conn)
      categories_df = pd.read_sql(text("SELECT category_id, name FROM categories"), conn)
      
      # 중복 방지 로직
      today_str = pd.Timestamp.now().strftime('%Y-%m-%d')
      print(f"오늘({today_str}) 적재된 데이터가 있는지 확인합니다...")
      check_query = text(
              """
                SELECT region_id, category_id
                FROM market_stats
                WHERE DATE(created_at) = :today
              """)
      result = conn.execute(check_query, {'today': today_str}).fetchall()
      existing_pairs = set((row[0], row[1]) for row in result) # 빠른 조회를 위해 집합(Set)으로 변환
    print(f"적재 데이터: {len(existing_pairs)}건 (중복 수집 건너뜀)")
    
    if regions_df.empty or categories_df.empty:
      print("기초 데이터(Region/Category)가 없습니다. init_data.py를 먼저 실행하세요.")
      return
    
    market_data_list = []
    total_steps = len(regions_df) * len(categories_df)
    current_step = 0
    
    for _, region in regions_df.iterrows():
      for _, category in categories_df.iterrows():
        current_step += 1
        if (region['region_id'], category['category_id']) in existing_pairs: # 이미 DB에 있으면 스킵
          print(f"[{current_step}/{total_steps}] [Skip] {region['district']} - {category['name']} (이미 존재함)")
          continue
        print(f"[{current_step}/{total_steps}] {region['province']} {region['district']} - {category['name']} 데이터 수집 중...")

        params = {
                  "serviceKey": API_KEY,
                  "pageNo": 1,
                  "numOfRows": 1,         # 개수만 알면 되므로 1개만 요청 (body의 totalCount 활용)
                  "divId": "signguCd",    # 구 단위 조회 (법정동 단위면 'adongCd')
                  "key": region['adm_code'], # 예: 강남구 11680
                  "indsSclsCd": "",       # 세분류 (생략 시 전체) - 정확도를 위해선 업종 코드 매핑 필요
                  "type": "json"
                }
        
        # 업종 키워드로 검색이 안되므로, 간단히 'store_count'를 API에서 가져왔다고 가정하거나,
        # 포트폴리오용으로 API가 실패할 경우를 대비해 랜덤값으로 fallback 처리를 해둡니다.
        # (실제로는 업종코드 매핑 테이블이 필요함: '카페' -> 'Q12' 등)
        real_store_count = 0
        try:
          response = requests.get(API_URL, params=params, timeout=5)
          if response.status_code == 200:
            data = response.json()
            if 'body' in data and 'totalCount' in data['body']:
              total_cnt = data['body']['totalCount']
              real_store_count = int(total_cnt * 0.05)
              if real_store_count == 0:
                real_store_count = random.randint(10, 50)
            else:
              real_store_count = random.randint(20, 100)
          else:
            print(f"API 호출 실패 (Status: {response.status_code}), 더미 데이터 사용")
            real_store_count = random.randint(20, 100)
        except Exception as e:
          print(f"API 연결 오류: {e}, 더미 데이터 사용")
          real_store_count = random.randint(20, 100)
        # --- 데이터 시뮬레이션 (매출, 폐업률 등) ---
        # *매출/폐업률은 유료/민감 데이터라 공공 API로 구하기 어렵다.
        # 대신, 점포 수(store_count)와 연동하여 그럴듯한 데이터를 생성.
        # 점포가 많을수록 경쟁 심화 -> 매출 감소, 폐업률 증가 경향 반영
        competition_factor = real_store_count / 100.0  # 경쟁 계수
        base_sales = 50000000 # 5천만원
        average_sales = int(base_sales * random.uniform(0.8, 1.5) - (competition_factor * 1000000))
        closing_rate = round(random.uniform(1.0, 3.0) + (competition_factor * 0.5), 2)
        growth_rate = round(random.uniform(-2.0, 5.0) - (competition_factor * 0.2), 2)
        saturation_index = round(growth_rate - closing_rate, 2) # 포화(saturation) 지수, (성장률 - 폐업률)이 높을수록 좋음
        
        market_grade = 'YELLOW'
        if saturation_index >= 3.0:
          market_grade = 'GREEN'
        elif saturation_index <= -1.0:
          market_grade = 'RED'
          
        market_data_list.append({
          'region_id': region['region_id'],
          'category_id': category['category_id'],
          'store_count': real_store_count,
          'average_sales': average_sales,
          'growth_rate': growth_rate,
          'closing_rate': closing_rate,
          'saturation_index': saturation_index,
          'market_grade': market_grade,
          'created_at': pd.Timestamp.now(),
          'updated_at': pd.Timestamp.now()
        })
        time.sleep(0.1)
        # for 문 종료
    if market_data_list:
      df = pd.DataFrame(market_data_list)
      df.to_sql(name='market_stats', con=db_connection, if_exists='append', index=False)
      print(f"총 {len(df)}건의 상권 분석 데이터(Hybrid) 적재 완료!")
    else:
      print("적재할 데이터가 없습니다.")
  except Exception as e:
    print(f"데이터 적재 중 오류 발생: {e}")
    
if __name__ == "__main__":
  fetch_store_data()