# Python 데이터 파이프라인 구축 가이드

파이썬과 스프링 부트를 연결하는 가장 직관적이고 효과적인 방법은 **"데이터베이스(MariaDB) 공유"** 방식입니다.
**[Python이 공공데이터를 수집/가공하여 DB에 적재] -> [Spring Boot가 그 DB에서 데이터를 조회]** 하는 구조로 연결됩니다.

---

## 구축 단계 (Step-by-Step)

### 1단계: 개발 환경 및 라이브러리 설정

프로젝트 전용 '가상환경'을 만들어 라이브러리 버전을 관리합니다.

1.  **가상환경 생성 및 활성화**

```bash
# DATA 폴더로 이동 후
python -m venv venv

# 가상환경 켜기 (Windows)
.\venv\Scripts\activate
# (Mac/Linux: source venv/bin/activate)
```

2.  **필수 라이브러리 설치**

```bash
pip install pandas sqlalchemy pymysql requests python-dotenv
```

-----

### 2단계: 보안 및 DB 연결 설정

소스 코드에 비밀번호나 API 키를 노출하지 않기 위해 환경변수 파일(`.env`)을 사용합니다.

1.  **`.env` 파일 생성 (`DATA/.env`)**

```properties
DB_USER=root
DB_PASSWORD=내_DB_비밀번호
DB_HOST=localhost
DB_PORT=3306
DB_NAME=open_insight_db
PUBLIC_DATA_API_KEY=공공데이터포털_Decoding_Key
```

2.  **DB 연결 모듈 작성 (`DATA/src/config/database.py`)**

```python
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")

# DB 연결 엔진 생성
db_connection_str = f'mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}'
db_connection = create_engine(db_connection_str)

def get_connection():
    return db_connection.connect()
```

-----

