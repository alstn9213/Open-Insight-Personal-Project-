from sqlalchemy import create_engine

db_connection_str = 'mysql+pymysql://root:@localhost:3306/open_insight_db'
db_connection = create_engine(db_connection_str)

def get_connection():
  """DB 연결 객체를 반환하는 함수"""
  return db_connection.connect()

print("DB 연결 설정이 준비되었습니다.")