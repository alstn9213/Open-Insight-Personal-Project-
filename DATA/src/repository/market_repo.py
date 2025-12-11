import pandas as pd
import logging
from sqlalchemy import text, Engine
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)

class MarketRepository:
  """
  MariaDB(또는 MySQL) 데이터베이스에 대한 CRUD 작업을 전담하는 클래스입니다.
  """
  def __init__(self, db_engine: Engine):
    self.engine = db_engine
    
  def get_base_info(self):
    
    try:
      with self.engine.connect() as conn:
        regions_df = pd.read_sql(
          text("SELECT region_if, adm_code, province, district FROM regions"),
          conn
        )
        categories_df = pd.read_sql(
          text("SELECT category_id, name FROM categories"),
          conn
        )
        return regions_df, categories_df
    except SQLAlchemyError as e:
      logger.error(f"기초 데이터 조회 중 DB 에러 발생: {e}")
      raise
    
  def get_existing_keys(self, target_date: str) -> set:
   
    query = text("""
        SELECT region_id, category_id
        FROM market_stats
        WHERE DATE(created_at) = :target_date
    """)
    
    try:
      with self.engine.connect() as conn:
        result = conn.execute(query, {"target_date": target_date}).fetchall()
        return set((row[0], row[1]) for row in result)
    except SQLAlchemyError as e:
      logger.error(f"기 적재 데이터 조회 실패: {e}")
      return set()
  
  def delete_market_stats(self, id_pairs: list, target_date: str):
   
    if not id_pairs:
      return

    delete_query = text(
      """
        DELETE FROM market_stats
        WHERE region_id = :rid
          AND category_id = :cid
          AND DATE(created_at) = :target_date
      """
    )
    
    try:
    # 대량 삭제 시 트랜잭션 처리
      with self.engine.begin() as conn:
          for rid, cid in id_pairs:
              conn.execute(delete_query, {
                "rid": rid,
                "cid": cid,
                "target_date": target_date
              })
      logger.info(f"기존 데이터 {len(id_pairs)}건 삭제 완료.")
    except SQLAlchemyError as e:
        logger.error(f"데이터 삭제 중 오류 발생: {e}")
        raise
  
  def save_market_stats(self, data_list: list):
    
    if not data_list:
      logger.info("저장할 데이터가 없습니다.")
      return

    try:
      df = pd.DataFrame(data_list)
      
      # DB 스키마에 없는 컬럼(is_simulated 등)이 있다면 제거 후 저장
      if "is_simulated" in df.columns:
          df = df.drop(columns=["is_simulated"])

      with self.engine.connect() as conn:
          df.to_sql(name="market_stats", con=conn, if_exists="append", index=False)
      
      logger.info(f"데이터 {len(df)}건 DB 적재 성공")
        
    except SQLAlchemyError as e:
      logger.error(f"데이터 적재(Insert) 실패: {e}")
      raise
    except Exception as e:
      logger.error(f"데이터 저장 중 알 수 없는 에러: {e}")
      raise