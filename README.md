# [Open Insight] 상권 현황 대시보드

> 공공데이터를 활용하여 **상권 밀도, 유동인구, 경쟁 현황**을 시각화하고, 예비 창업자의 합리적인 의사결정을 돕는 **분석 대시보드** 풀스택 웹 애플리케이션입니다.

<br/>

## 프로젝트 소개 (Overview)

- **기획 의도:** 특정 지역에서 창업시, 유동 인구와 지역 내 동일 업종 점포 수를 바탕으로 해당 업종이 지역 내에서 레드오션인지 블루 오션인지 판단하는데 필요한 정보를 제공합니다.
- **핵심 가치:** 
    1. **정확성:** 공공데이터 값을 지도로 시각화합니다.
    2. **직관성:** 행정동 단위의 유동인구와 업소 밀도를 지도 위에 히트맵으로 표현합니다.
- **개발 기간:** 2025.11.28 ~ 2025.12.31
- **인원:** 1인

<br/>

## 기술 스택 (Tech Stack)

안정적인 서비스 운영과 대용량 공공데이터의 유연한 처리를 위해 **Spring Boot**와 **Python**을 결합한 하이브리드 아키텍처를 채택했습니다.

| 분류 | 기술 스택 | 선정 이유 및 활용 |
| :-- | :-- | :-- |
| **Backend** | **Java 17, Spring Boot 3.5.8** | 안정적인 REST API 구축, 대용량 트래픽 처리를 위한 기반 마련 |
| **ORM / DB** | **JPA, QueryDSL, MariaDB** | 복잡한 상권 검색 조건(동적 쿼리) 처리 및 데이터 무결성 보장 |
| **Cache** | **Redis** | 변동 주기가 긴 상권 통계 데이터 캐싱으로 조회 성능 최적화 |
| **Data** | **Python, Pandas, Asyncio** | `aiohttp`를 활용한 공공데이터 고속 비동기 수집(ETL) 및 전처리 |
| **Frontend** | **React 19, TypeScript, Vite** | 컴포넌트 기반의 대시보드 설계 및 빠른 렌더링 최적화 |
| **Styling** | **Tailwind CSS, daisyUI** | 직관적인 데이터 표현을 위한 유틸리티 퍼스트 디자인 |
| **Visual** | **Chart.js, Kakao Map SDK** | 행정동별 유동인구 히트맵(Polygon) 및 비교 분석 차트 시각화 |

<br/>

## 시스템 아키텍처 (Architecture)

1.  **ETL Pipeline (Python):** `aiohttp`를 이용해 서울시 열린데이터 광장(유동인구) 및 공공데이터포털(상가정보) API에서 데이터를 비동기로 수집합니다. 
    * *Key Logic:* 행정동 단위로 데이터를 매핑하고, 결측치를 정제하여 신뢰도 높은 데이터셋을 구축합니다.
2.  **Scheduler (Spring Boot):** 매일 새벽 `MarketEtlScheduler`가 Python 스크립트를 트리거하여 최신 데이터 현황을 DB에 업데이트합니다.
3.  **API Service:** 사용자가 특정 지역/업종을 조회하면 QueryDSL을 통해 조건에 맞는 통계 데이터를 추출하고, Redis를 통해 응답 속도를 가속화합니다.
4.  **Client:** GeoJSON을 활용하여 지도 위에 **업소 밀도**와 **유동인구 분포**를 시각적으로 렌더링합니다.

<br/>

## 핵심 기능 (Key Features)

### 📊 1. 상권 밀도 및 경쟁 현황 분석 (Density Analysis)
- **업소 밀도:** 선택한 행정동 내 동일 업종 점포 수를 집계하여 경쟁 강도를 보여줍니다.

### 🗺️ 2. 유동인구 히트맵 시각화 (Population Heatmap)
- 행정동별 유동인구 데이터를 **3단계(🟢여유, 🟡보통, 🔴밀집)** 색상 코드로 지도에 표현했습니다.
- 단순히 사람이 많은 곳이 아닌, **'점포 수 대비 유동인구(잠재 수요)'** 지표를 제공하여 실속 있는 알짜 상권을 찾도록 돕습니다.

<br/>

## 실행 방법 (Getting Started)

### Backend

```bash
cd BACK
./gradlew clean build
java -jar build/libs/BACK-0.0.1-SNAPSHOT.jar

```

### Frontend

```bash
cd FRONT
npm install
npm run dev

```

### Data Pipeline (Optional)

```bash
cd DATA
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate  
pip install -r requirements.txt
python src/etl/init_data.py  # 기초 데이터(지역/업종) 적재
python src/etl/market_collect.py # 공공데이터 수집 및 적재

```

## 👨‍💻 Developer

**alstn9213**
<br> - GitHub: https://github.com/alstn9213
<br> - Velog: https://velog.io/@kms0425/posts
<br> - Email: alstn9213@naver.com