import sys
import os
import pandas as pd
from sqlalchemy import text

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
sys.path.append(project_root)

from src.config.database import get_connection
from src.config.constants import CATEGORY_MAP

def init_categories():
    print("업종 데이터 적재를 시작합니다...")

    category_names = list(CATEGORY_MAP.keys())
    data = [{"name": name} for name in category_names]

    df = pd.DataFrame(data)
    print(f"총 {len(df)} 개의 업종: {category_names}")

    conn = get_connection()
    try:
        df.to_sql(name="categories", con=conn, if_exists="append", index=False)
        print("업종 데이터 적재 완료")
    except Exception as e:
        print(f"데이터 적재 중 오류 발생: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_categories()