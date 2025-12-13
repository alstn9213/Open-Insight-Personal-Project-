import os
import sys
import asyncio
import aiohttp
import time
import logging
from datetime import datetime
from dotenv import load_dotenv

# 프로젝트 루트 경로를 path에 추가 (모듈 import를 위해)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
sys.path.append(project_root)

from src.utils.file_loader import load_category_map
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

  async def process_single_category(self, session, semaphore, region, category, seoul_pop_map, existing_keys):
    async with semaphore: # 동시 요청 수 제한
      adm_code = str(region["adm_code"])
      cat_name = category["name"]
      cat_code = CATEGORY_CODES.get(cat_name)
      store_count = await self.api_client.fetch_store_count(session, adm_code, cat_code)
      floating_pop = seoul_pop_map.get(adm_code, 0)

      metrics = self.calculator.calculate(
        store_count=store_count,
        floating_pop=floating_pop,
        category_name=cat_name
      )

      row_data = {
        "region_id": region["region_id"],
        "category": category["category_id"],
        "floating_population": floating_pop,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
      }
      row_data.update(metrics)

      current_key = (region["region_id"], category["category_id"])
      delete_key = current_key if current_key in existing_keys else None

      return row_data, delete_key

  async def run_async(self):
    logger.info("상권 분석 데이터 수집을 시작합니다.")

    regions_df, categories_df = self.repository.get_base_info()
    seoul_pop_map = self.api_client.fetch_seoul_population()
    existing_keys = self.repository.get_existing_keys(self.today_str)

    market_data_list = []
    ids_to_delete = []

    # 세마포어: 동시에 보낼 최대 요청 수 (공공데이터 포털은 보통 10~50 정도 권장)
    semaphore = asyncio.Semaphore(5)
    
    async with aiohttp.ClientSession() as session:

      tasks = []

      for _, region in regions_df.iterrows():
        for _, category in categories_df.iterrows():
          task = asyncio.create_task(
            self.process_single_category(
              session, semaphore, region, category, seoul_pop_map, existing_keys
            )
          )
          tasks.append(task)

      logger.info(f"총 {len(tasks)}개의 수집 작업이 예약되었습니다.")
      results = await asyncio.gather(*tasks)
    
    for row, del_key in results:
      if row:
        market_data_list.append(row)
      if del_key:
        ids_to_delete.append(del_key)
          
    if ids_to_delete:
      logger.info(f"기존 중복 데이터 {len(ids_to_delete)}건 삭제 중...")
      self.repository.delete_market_stats(ids_to_delete, self.today_str)

    if market_data_list:
      logger.info(f"신규 데이터 {len(market_data_list)}건 적재 중...")
      self.repository.save_market_stats(market_data_list)
        
    logger.info("작업 완료")

  def run(self):
    asyncio.run(self.run_async())   

if __name__ == "__main__":
  MarketDataETL().run()