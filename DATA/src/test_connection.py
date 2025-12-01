# DATA/src/test_connection.py

from src.config.database import get_connection
from sqlalchemy import text

try:
    conn = get_connection()
    print("🎉 DB 연결 성공! 문이 열렸습니다.")

    # 2. 간단한 SQL 실행 (현재 시간 확인)
    result = conn.execute(text("SELECT NOW()")).fetchone()
    print(f"현재 DB 시간: {result[0]}")

    conn.close()

except Exception as e:
    print("😭 연결 실패... 다음 에러 메시지를 확인하세요:")
    print(e)