# 📝 [Troubleshooting] Python ETL 데이터 적재 및 DB 트랜잭션 이슈

## 1\. 개요 (Overview)

Python(Pandas, SQLAlchemy)을 활용한 데이터 파이프라인(ETL) 구축 과정에서 발생한 **데이터 미적재 현상** 및 **스키마 불일치 오류**에 대한 원인 분석과 해결 과정을 기술한다.

## 2\. 발생 이슈 및 해결 과정

### 이슈 1: 실행 로그 성공 후 DB 데이터 미적재 (Transaction Commit)

  * **현상:**
      * Python 스크립트 실행 시 에러 로그 없이 "적재 완료" 메시지가 출력됨.
      * 하지만 DB 클라이언트(DBeaver 등)로 조회 시 테이블이 비어 있음.
  * **원인 분석:**
      * `pandas.to_sql()` 메서드 사용 시 `Connection` 객체를 직접 주입함.
      * SQLAlchemy 1.4/2.0 버전 이후, `Connection` 객체는 명시적인 트랜잭션 관리가 필요함.
      * Pandas가 데이터를 Insert 했으나, 세션이 종료될 때 **`commit()`이 호출되지 않아 Rollback 처리됨.**
  * **해결책:**
      * `Connection` 객체 대신 **`Engine` 객체**를 `to_sql()`의 `con` 파라미터로 직접 전달.
      * `Engine`을 전달할 경우, Pandas 내부에서 커넥션 생성/사용/커밋/종료(Auto-commit) 라이프사이클을 자동으로 관리함.

<!-- end list -->

```python
# [Before] Connection 객체 사용 (데이터 안 들어감)
conn = get_connection() # engine.connect()
df.to_sql(name='table', con=conn, ...) 

# [After] Engine 객체 사용 (해결)
from src.config.database import db_connection # create_engine() 결과값
df.to_sql(name='table', con=db_connection, ...)
```

-----

### 이슈 2: 테이블 생성 순서 및 FK 제약 조건 오류 (Foreign Key Constraint)

  * **현상:**
      * `errno: 150 "Foreign key constraint is incorrectly formed"` 에러 발생.
  * **원인 분석:**
      * **Python 선행 실행:** `init_data.py`가 `regions` 테이블을 생성했으나, PK(Primary Key) 설정 없이 단순 데이터 테이블로 생성함.
      * **Spring Boot 후행 실행:** JPA가 `market_stats` 테이블을 생성하며 `regions`의 PK를 참조하려 했으나, 참조 대상 컬럼이 PK(인덱스)가 아니어서 제약 조건 생성 실패.
  * **해결책:**
      * **실행 순서 변경:** Schema 생성의 주체와 Data 적재의 주체를 분리.
    1.  **Spring Boot (JPA):** DDL(Auto-DDL)을 통해 PK/FK가 완벽한 테이블 스키마 생성.
    2.  **Python (ETL):** 생성된 테이블에 데이터만 `INSERT` (`if_exists='append'` 옵션 사용).

-----

### 이슈 3: 모듈 경로 참조 오류 (ModuleNotFoundError)

  * **현상:**
      * `src/etl` 내부 스크립트 실행 시 `ModuleNotFoundError: No module named 'src'` 발생.
  * **원인 분석:**
      * Python 실행 컨텍스트가 스크립트 파일 위치(`DATA/src/etl`)로 잡혀 있어, 상위 패키지인 `src`(Root)를 인식하지 못함.
  * **해결책:**
      * `sys.path`에 프로젝트 루트 디렉토리(`DATA`)를 동적으로 추가하여 패키지 경로 인식 문제 해결.


```python
import sys
import os
# 현재 파일 기준 두 단계 상위 폴더를 path에 추가
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))
```

-----

## 3\. 결론 및 배운 점

1.  **ORM/라이브러리 버전 특성 이해:** SQLAlchemy의 버전 변경에 따른 트랜잭션 처리 방식 차이를 이해해야 함.
2.  **역할 분리:** 스키마 관리(JPA)와 데이터 적재(Python)의 역할을 명확히 하고 실행 순서를 정의해야 데이터 무결성이 보장됨.

