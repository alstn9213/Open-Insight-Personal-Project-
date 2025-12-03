import os
import sys
import random
import time
import requests
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

# 1. 업종별 코드 매핑 (공공데이터포털 엑셀 파일 참조)
CATEGORY_CODES = {
    '카페': 'I21201',
    '치킨': 'I21006',
    '편의점': 'G20405',
    '미용실': 'S20701'
}

def fetch_store_data():
  try:
    print("상권 분석 데이터 수집 및 생성 시작...")
    
    with db_connection.connect() as conn:
      regions_df = pd.read_sql(text("SELECT region_id, adm_code, province, district FROM regions"), conn)
      categories_df = pd.read_sql(text("SELECT category_id, name FROM categories"), conn)
      
      # 중복 방지 로직: 오늘 날짜로 이미 적재된 데이터 확인
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
        
        target_code = CATEGORY_CODES.get(category['name'])
        if not target_code:
          print(f"{category['name']}에 대한 매핑 코드가 없습니다. 건너뜁니다.")
          continue
        
        print(f"[{current_step}/{total_steps}] {region['province']} {region['district']} - {category['name']} 분석 중...")

        real_store_count = 0
        
        params = {
                  "serviceKey": API_KEY,
                  "pageNo": 1,
                  "numOfRows": 1,         # 개수만 알면 되므로 1개만 요청 (body의 totalCount 활용)
                  "divId": "signguCd",    # 구 단위 조회 (법정동 단위면 'adongCd')
                  "key": region['adm_code'],
                  "indsSclsCd": target_code, # 업종별 소분류
                  "type": "json"
                }
        
        try:
          if API_URL:
            response = requests.get(API_URL, params=params, timeout=3)
          if response.status_code == 200:
            data = response.json()
            if 'body' in data and 'totalCount' in data['body']:
              real_store_count = int(data['body']['totalCount'])
              print(f"   -> API 조회 성공: {real_store_count}개 점포")
        except Exception as e:
          print(f"    -> API 오류: {e}")
          
        # API 실패 또는 결과가 0일 경우 시뮬레이션 데이터 사용
        if real_store_count == 0:
            real_store_count = random.randint(50, 500)
            print(f"   -> (API 실패/0건) 더미 데이터 사용: {real_store_count}개")
            
        # ---------------------------------------------------------
        # 2. 파생 지표 생성 (폐업률 정보 API를 구하기 어려워 점포 수(store_count)와 연동하여 그럴듯한 데이터를 생성.)
        # ---------------------------------------------------------
        
        # (1) 매출 (Average Sales): 점포 수 많을수록 경쟁으로 인해 평균 매출이 다소 낮아지는 경향 반영
        base_sales = 40000000 # 4천만원
        competition_factor = real_store_count / 1000.0
        average_sales = int(base_sales * random.uniform(0.7, 1.8) - (competition_factor * 5000000))

        # (2) 성장률 (Growth Rate): -5% ~ +15%
        growth_rate = round(random.uniform(-5.0, 15.0), 2)

        # (3) 폐업률 (Closing Rate): 0% ~ 10% (매출이 낮으면 폐업률이 높게 나오도록 상관관계 부여)
        risk_factor = 1.0 if average_sales > 40000000 else 2.5
        closing_rate = round(random.uniform(0.5, 5.0) * risk_factor, 2)

        # (4) 순성장률 (Net Growth Rate) = 성장률 - 폐업률
        net_growth_rate = round(growth_rate - closing_rate, 2)

        # (5) 상권 등급 (Market Grade) 판별
        # GREEN: 순성장률 >= 3.0 (성장이 폐업을 압도)
        # RED: 순성장률 <= -1.0 (쇠퇴)
        # YELLOW: 그 외
        market_grade = 'YELLOW'
        if net_growth_rate >= 3.0:
          market_grade = 'GREEN'
        elif net_growth_rate <= -1.0:
          market_grade = 'RED'
          
        market_data_list.append({
          'region_id': region['region_id'],
          'category_id': category['category_id'],
          'store_count': real_store_count,
          'average_sales': average_sales,
          'growth_rate': growth_rate,
          'closing_rate': closing_rate,
          'net_growth_rate': net_growth_rate,
          'market_grade': market_grade,
          'created_at': pd.Timestamp.now(),
          'updated_at': pd.Timestamp.now()
      })
        time.sleep(0.05)
        # for 문 종료
    if market_data_list:
      df = pd.DataFrame(market_data_list)
      df.to_sql(name='market_stats', con=db_connection, if_exists='append', index=False)
      print(f"총 {len(df)}건의 상권 분석 데이터 적재 완료!")
    else:
      print("적재할 새로운 데이터가 없습니다.")
  except Exception as e:
    print(f"데이터 적재 중 오류 발생: {e}")
    
if __name__ == "__main__":
  fetch_store_data()