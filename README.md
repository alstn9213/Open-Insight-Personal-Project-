# [Open Insight] 상권 현황 대시보드

> 공공데이터를 활용하여 **상권 밀도, 유동인구, 경쟁 현황**을 시각화하고, 예비 창업자의 합리적인 의사결정을 돕는 **분석 대시보드** 풀스택 웹 애플리케이션입니다.

<br/>

## 1. 프로젝트 소개 (Overview)

- **기획 의도:** "이 상권은 무조건 성공합니다"라는 근거 없는 예측 대신, **"현재 이곳의 상황은 이렇습니다"**라는 정보(Fact)를 보여주고자 했습니다. 감에 의존한 창업을 방지하고, 데이터에 기반한 합리적인 입지 선정을 돕습니다.
- **핵심 가치:** 
    1. **정확성:** 공공데이터 원천 값을 그대로 시각화합니다.
    2. **직관성:** 행정동 단위의 유동인구와 업소 밀도를 지도 위에 히트맵으로 표현합니다.
- **개발 기간:** 2025.11.28 ~ 2025.12.xx (진행 중)
- **인원:** 개인 프로젝트 (Full Stack)

<br/>

## 2. 기술 스택 (Tech Stack)

안정적인 서비스 운영과 대용량 공공데이터의 유연한 처리를 위해 **Spring Boot**와 **Python**을 결합한 하이브리드 아키텍처를 채택했습니다.

| 분류 | 기술 스택 | 선정 이유 및 활용 |
| :-- | :-- | :-- |
| **Backend** | **Java 17, Spring Boot 3.5.8** | 안정적인 REST API 구축, 대용량 트래픽 처리를 위한 기반 마련 |
| **ORM / DB** | **JPA, QueryDSL, MariaDB** | 복잡한 상권 검색 조건(동적 쿼리) 처리 및 데이터 무결성 보장 |
| **Cache** | **Redis** | 변동 주기가 긴 상권 통계 데이터 캐싱으로 조회 성능 최적화 |
| **Security** | **Spring Security, JWT** | Stateless한 인증 방식 구현 및 사용자 개인화 데이터 보호 |
| **Data Eng.** | **Python, Pandas, Asyncio** | `aiohttp`를 활용한 공공데이터 고속 비동기 수집(ETL) 및 전처리 |
| **Frontend** | **React 19, TypeScript, Vite** | 컴포넌트 기반의 대시보드 설계 및 빠른 렌더링 최적화 |
| **Styling** | **Tailwind CSS, daisyUI** | 직관적인 데이터 표현을 위한 유틸리티 퍼스트 디자인 |
| **Visual** | **Chart.js, Kakao Map SDK** | 행정동별 유동인구 히트맵(Polygon) 및 비교 분석 차트 시각화 |

<br/>

## 3. 시스템 아키텍처 (Architecture)

1.  **ETL Pipeline (Python):** `aiohttp`를 이용해 서울시 열린데이터 광장(유동인구) 및 공공데이터포털(상가정보) API에서 데이터를 비동기로 수집합니다. 
    * *Key Logic:* 행정동 단위로 데이터를 매핑하고, 결측치를 정제하여 신뢰도 높은 데이터셋을 구축합니다.
2.  **Scheduler (Spring Boot):** 매일 새벽 `MarketEtlScheduler`가 Python 스크립트를 트리거하여 최신 데이터 현황을 DB에 업데이트합니다.
3.  **API Service:** 사용자가 특정 지역/업종을 조회하면 QueryDSL을 통해 조건에 맞는 통계 데이터를 추출하고, Redis를 통해 응답 속도를 가속화합니다.
4.  **Client:** GeoJSON을 활용하여 지도 위에 **업소 밀도**와 **유동인구 분포**를 시각적으로 렌더링합니다.

<br/>

## 4. 핵심 기능 (Key Features)

### 📊 1. 상권 밀도 및 경쟁 현황 분석 (Density Analysis)
- **업소 밀도:** 선택한 행정동 내 동일 업종 점포 수를 집계하여 경쟁 강도를 보여줍니다.
- **추세 분석:** 전년/전월 대비 점포 수 증감 추이를 그래프로 제공하여 상권의 팽창/쇠퇴 흐름을 파악할 수 있습니다.

### 🗺️ 2. 유동인구 히트맵 시각화 (Population Heatmap)
- 행정동별 유동인구 데이터를 **3단계(🟢여유, 🟡보통, 🔴밀집)** 색상 코드로 지도에 표현했습니다.
- 단순히 사람이 많은 곳이 아닌, **'점포 수 대비 유동인구(잠재 수요)'** 지표를 제공하여 실속 있는 알짜 상권을 찾도록 돕습니다.

### ⚖️ 3. 임대료 및 주요 지표 비교 (Market Indicators)
- **임대료 정보:** 지역별 평균 임대료 정보를 함께 제공하여, 유동인구 대비 가성비가 좋은 지역을 선별할 수 있습니다.
- **종합 대시보드:** [경쟁 점포 수 vs 유동인구 vs 임대료]를 한눈에 비교할 수 있는 차트를 제공하여 사용자의 의사결정을 보조합니다.

<br/>

## 5. 기술적 도전 및 해결 (Troubleshooting)

### 🚀 1. 대용량 공공데이터 수집 속도 10배 향상 (Sync → Async)
- **문제:** `requests` 라이브러리로 서울시 전체 행정동 데이터를 수집할 때 동기(Blocking) 처리로 인해 약 20분 이상 소요되는 병목 현상 발생.
- **해결:** Python의 `asyncio`와 `aiohttp`를 도입하여 I/O 바운드 작업을 비동기(Non-blocking) 방식으로 전환하고, `Semaphore`로 동시 요청 수를 효율적으로 제어함.
- **결과:** 전체 데이터 수집 및 갱신 시간을 **약 1분 내외로 단축 (약 10배 성능 향상)**.
- [👉 상세 트러블슈팅 문서 보기](docs/troubleshooting/async_processing.md)

### 🔍 2. QueryDSL을 활용한 동적 필터링 구현
- **문제:** "강남구 + 카페 + 유동인구 5만 이상" 등 사용자의 다양한 검색 조합을 처리하기 위해 JPA Method name으로는 한계가 발생.
- **해결:** `QueryDSL`을 도입하여 컴파일 시점의 타입 안정성을 확보하고, `BooleanExpression`을 활용해 확장 가능한 동적 쿼리 구조를 설계.

### 💾 3. Redis 캐싱을 통한 지도 렌더링 최적화
- **문제:** 지도 이동 시마다 수십 개의 행정동 데이터를 DB에서 조회하여 응답 속도가 저하됨.
- **해결:** 변동 주기가 하루 단위인 상권 통계 데이터의 특성을 고려하여, 주요 조회 데이터(`MarketMapResponse`)에 Redis 캐싱(`@Cacheable`) 적용.
- **결과:** 반복 조회 시 API 응답 속도를 획기적으로 단축하여 부드러운 지도 UX 제공.

<br/>

## 6. 프로젝트 구조 (Directory Structure)

```bash
Open-Insight
├── BACK (Spring Boot)
│   ├── src/main/java/com/back
│   │   ├── domain       # 도메인별(Region, Market, Category) 로직 분리
│   │   ├── global       # Security, Config, Error Handling
│   │   └── ...
│   └── build.gradle
│
├── FRONT (React)
│   ├── src
│   │   ├── components   # Map(Leaflet/Kakao), Chart, Dashboard UI
│   │   ├── pages        # Analysis, Home
│   │   └── ...
│   └── ...
│
└── DATA (Python)
    ├── src
    │   ├── api          # Public Data Portal API Client
    │   ├── etl          # Async Data Collector
    │   └── ...
    └── ...

```

## 7. 실행 방법 (Getting Started)

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