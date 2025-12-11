import os
import sys
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
from src.utils.file_loader import load_category_map

# 프로젝트 루트 경로를 path에 추가 (모듈 import를 위해)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
sys.path.append(project_root)

from src.config.database import db_connection
from src.api.public_data import PublicDataClient
from src.service.calculator import MarketMetricsCalculator
from src.repository.market_repo import MarketRepository

logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s [%(levelname)s] %(message)s",
  datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger(__name__)
load_dotenv()

CATEGORY_CODES = load_category_map()

class MarketDataETL:

  def __init__(self):
    self.api_client = PublicDataClient(
      public_api_key=os.getenv("PUBLIC_DATA_API_KEY"),
      public_api_url=os.getenv("PUBLIC_DATA_API_URL"),
      seoul_api_key=os.getenv("SEOUL_DATA_API_KEY"),
      seoul_api_url=os.getenv("SEOUL_DATA_API_URL")
    )
    self.calculator = MarketMetricsCalculator()
    self.repository = MarketRepository(db_engine=db_connection)
    self.today_str = datetime.now().strftime("%Y-%m-%d")
    
  def run(self):
    logger.info("상권 분석 데이터 수집을 시작합니다.")
    try:
      regions_df, categories_df = self.repository.get_base_info()
      seoul_pop_map = self.api_client.fetch_seoul_population()
      existing_keys = self.repository.get_existing_keys(self.today_str)

      market_data_list = []
      ids_to_delete = []
      
      for _, region in regions_df.iterrows():

        adm_code = str(region["adm_code"])
        floating_pop = seoul_pop_map.get(adm_code, 0)
        store_count = self.api_client.fetch_store_count(adm_code)

        for _, category in categories_df.iterrows():
          
          cat_name = category["name"]
          cat_code = CATEGORY_CODES.get(cat_name)
          store_count = self.api_client.fetch_store_count(adm_code, cat_code)
          metrics = self.calculator.calculate(store_count, ...)
          current_key = (region["region_id"], category["category_id"])
          
          if current_key in existing_keys:
            ids_to_delete.append(current_key)

          metrics = self.calculator.calculate(
            store_count=store_count,
            floating_pop=floating_pop,
            category_name=category["name"]
            )
          
          row_data = {
            "region_id": region["region_id"],
            "category_id": category["category_id"],
            "floating_population": floating_pop,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
          }
          row_data.update(metrics)

          market_data_list.append(row_data)

        time.sleep(0.05)
          
      if ids_to_delete:
        logger.info("기존 중복 데이터 삭제를 시작합니다...")
        self.repository.delete_market_stats(ids_to_delete, self.today_str)

      if market_data_list:
        logger.info("신규 데이터 적재를 시작합니다...")
        self.repository.save_market_stats(market_data_list)
        
      logger.info("작업 완료")

    except Exception as e:
      logger.error(f"ETL 실행 중 오류 발생: {e}")
      
if __name__ == "__main__":
  MarketDataETL().run()