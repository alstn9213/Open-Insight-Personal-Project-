import os
import sys
import time
import logging
from datetime import datetime
from dotenv import load_dotenv

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

class MarketDataETL:
  """
  상권 데이터 수집(ETL) 프로세스를 총괄하는 메인 클래스입니다.
  """
  def __init__(self):
    self.api_client = PublicDataClient(
      api_key=os.getenv("PUBLIC_DATA_API_KEY"),
      api_url=os.getenv("PUBLIC_DATA_API_URL")
    )
    self.calculator = MarketMetricsCalculator()
    self.repository = MarketRepository(db_engine=db_connection)
    self.today_str = datetime.now().strftime("%Y-%m-%d")
    
  def run(self):
    logger.info("상권 분석 데이터 수집을 시작합니다.")

    try:
      regions_df, categories_df = self.repository.get_base_info()
      if regions_df.empty or categories_df.empty:
        logger.error("기초 데이터(지역/업종)가 없습니다. init_data.py를 먼저 실행하세요.")
        return
      
      existing_keys = self.repository.get_existing_keys(self.today_str)
      logger.info(f"오늘자 기 적재 데이터: {len(existing_keys)}건")
      
      market_data_list = []
      ids_to_delete = []
      
      total_tasks = len(regions_df) * len(categories_df)
      processed_count = 0
      
      for _, region in regions_df.iterrows():
        for _, category in categories_df.iterrows():
          processed_count += 1
          
          if processed_count % 20 == 0 or processed_count == total_tasks:
            logger.info(f"진행률 [{processed_count}/{total_tasks}] - {region['district']} {category['name']}")
            
          current_key = (region["region_id"], category["category_id"])
          if current_key in existing_keys:
            ids_to_delete.append(current_key)

          store_count = self.api_client.fetch_store_count(region["adm_code"])
          metrics = self.calculator.calculate(store_count)
          
          row_data = {
            "region_id": region["region_id"],
            "category_id": category["category_id"],
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
      logger.error(f"ETL 프로세스 실행 중 치명적 오류 발생: {e}")
      
if __name__ == "__main__":
  etl_process = MarketDataETL()
  etl_process.run()