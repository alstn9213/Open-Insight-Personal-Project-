# Python 연결

파이썬과 스프링 부트를 연결하는 가장 직관적이고 효과적인 방법은 **"데이터베이스(MariaDB) 공유"** 방식입니다.

파이썬 코드가 자바 코드를 직접 호출하는 것이 아니라 **[Python이 데이터를 DB에 넣고] -\> [Spring Boot가 그 DB에서 꺼내가는]** 구조로 연결됩니다.


-----

### 1단계: 파이썬 개발 환경 및 라이브러리 설치

가장 먼저 파이썬이 데이터베이스와 통신할 수 있도록 도구(라이브러리)를 설치해야 합니다.

1.  **가상환경 생성 (터미널에서 DATA 폴더로 이동 후):**

    ```bash
    python -m venv venv
    source venv/bin/activate  # (Windows: venv\Scripts\activate)
    ```

2.  **필수 라이브러리 설치:**

      * `pandas`: 데이터 분석 및 계산 (포화지수 산출용)
      * `sqlalchemy`: 파이썬에서 DB를 쉽게 다루기 위한 ORM
      * `pymysql`: MariaDB(MySQL) 드라이버

    <!-- end list -->

    ```bash
    pip install pandas sqlalchemy pymysql requests
    ```

-----

### 2단계: DB 연결 설정 (connection.py)

파이썬이 마리아DB에 접속할 수 있도록 연결 코드를 작성합니다. 이때 **스프링 부트의 `application.properties`에 적힌 DB 정보와 똑같아야 합니다.**

**`DATA/src/db_connector.py` (예시):**

```python
from sqlalchemy import create_engine

# [주의] 본인의 DB 계정/비밀번호/DB명으로 수정 필수
# 형식: mysql+pymysql://아이디:비밀번호@주소:포트/데이터베이스이름
db_connection_str = 'mysql+pymysql://root:1234@localhost:3306/open_insight_db'
db_connection = create_engine(db_connection_str)

def get_connection():
    return db_connection.connect()
```

-----

### 3단계: 외래키(Foreign Key) 데이터 먼저 넣기

`MarketStats.java`를 보면 `Region`(지역)과 `Category`(업종)가 `@ManyToOne`으로 연결되어 있습니다. 즉, **지역과 업종 데이터가 먼저 DB에 있어야 상권 통계 데이터를 넣을 수 있습니다.**

**`DATA/src/init_data.py` (기초 데이터 적재):**

```python
import pandas as pd
from db_connector import db_connection

# 1. 카테고리 데이터 준비
categories = pd.DataFrame({
    'name': ['한식', '카페', '치킨', '편의점']
})

# 2. 지역 데이터 준비 (행정동 코드 포함)
regions = pd.DataFrame({
    'province': ['서울특별시', '서울특별시', '부산광역시'],
    'district': ['강남구', '마포구', '해운대구'],
    'adm_code': ['11680', '11440', '26350'] # 컬럼명은 DB 테이블과 일치시켜야 함
})

# 3. DB에 저장 ('categories', 'regions'는 실제 테이블 이름이어야 함)
# if_exists='append': 데이터가 있으면 추가함
categories.to_sql(name='categories', con=db_connection, if_exists='append', index=False)
regions.to_sql(name='regions', con=db_connection, if_exists='append', index=False)

print("기초 데이터 적재 완료!")
```

-----

### 4단계: 핵심 로직 구현 및 데이터 적재 (ETL)

이제 프로젝트의 핵심인 공공 데이터를 가져와 분석하고 `market_stats` 테이블에 넣는 작업입니다. `MarketStats` 엔티티의 필드명(`storeCount`, `growthRate` 등)과 DB 컬럼명을 잘 매핑해야 합니다.

**`DATA/src/market_analysis.py` (분석 로직):**

```python
import pandas as pd
from db_connector import db_connection

def run_analysis():
    # 1. (가정) 공공데이터나 크롤링으로 수집한 Raw 데이터
    raw_data = {
        'region_id': [1, 2],    # DB에 들어간 region의 ID (FK)
        'category_id': [1, 2],  # DB에 들어간 category의 ID (FK)
        'store_count': [120, 50],
        'closing_rate': [2.1, 5.5],  # 폐업률
        'growth_rate': [5.2, -1.0],  # 증가율
        'average_sales': [45000000, 20000000]
    }
    df = pd.DataFrame(raw_data)

    # 2. 파이썬으로 계산 (포화 지수 & 등급 판별) - 프로젝트의 핵심 로직
    # 예: (증가율 - 폐업률)이 낮으면 위험
    df['saturation_index'] = df['growth_rate'] - df['closing_rate']
    
    # 등급 매기기 (Lambda 함수 활용)
    df['market_grade'] = df['saturation_index'].apply(
        lambda x: 'GREEN' if x > 3 else ('YELLOW' if x > 0 else 'RED')
    )

    # 3. DB 적재 (market_stats 테이블)
    # MarketStats.java의 필드들이 DB에서는 snake_case로 저장될 확률이 높음 (예: averageSales -> average_sales)
    # JPA가 생성한 실제 테이블 컬럼명을 확인하고 to_sql을 실행하세요.
    df.to_sql(name='market_stats', con=db_connection, if_exists='append', index=False)
    print("분석 데이터 적재 완료!")

if __name__ == "__main__":
    run_analysis()
```

-----

### 5단계: 스프링 부트에서 확인하기

이제 "연결"이 잘 되었는지 확인할 차례입니다.

1.  MariaDB 클라이언트(HeidiSQL, DBeaver 등)를 켜서 `market_stats` 테이블에 데이터가 들어왔는지 확인합니다.
2.  스프링 부트 서버를 실행합니다.
3.  `MarketAnalysisRequest` DTO 등을 활용하여 해당 데이터를 조회하는 API를 호출해봅니다.
4.  결과가 JSON으로 잘 나온다면, **파이썬(수집/가공) -\> DB(저장) -\> 스프링(조회)** 파이프라인이 완성된 것입니다.

### 요약

1.  **파이썬 라이브러리** 설치 (`pandas`, `sqlalchemy`, `pymysql`).
2.  파이썬 코드에서 **DB 연결** 설정 (스프링과 같은 DB 주소).
3.  파이썬으로 **데이터 가공 후 `to_sql` 함수**로 DB에 Insert.
4.  스프링 부트는 아무것도 바꿀 필요 없이, **DB에 들어온 데이터를 읽기만 하면 됨.**