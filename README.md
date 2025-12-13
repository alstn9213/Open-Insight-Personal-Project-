# [Open Insight] 데이터 기반 예비 창업자 맞춤형 상권 분석 플랫폼

> 공공데이터를 분석하여 **순성장률(Net Growth Rate)** 기반의 상권 등급과 **맞춤형 창업 순위**를 제공하는 서비스입니다.

<br/>

## 1. 프로젝트 소개 (Overview)

- **기획 의도:** 무분별한 창업으로 인한 폐업률 증가 문제를 해결하기 위해, 객관적인 데이터 지표(매출, 유동인구, 폐업률 등)를 시각화하여 예비 창업자의 의사결정을 돕습니다.
- **핵심 가치:** 단순 매출 순위가 아닌, 성장성과 안전성을 종합한 **'순성장률'** 지표를 자체 개발하여 제공합니다.
- **개발 기간:** 2025.11.28 ~ 2025.12.xx (진행 중)
- **인원:** 개인 프로젝트 (Full Stack)

<br/>

## 2. 기술 스택 (Tech Stack)

이 프로젝트는 **안정적인 서비스 운영**과 **유연한 데이터 처리**를 위해 Spring Boot와 Python을 결합한 하이브리드 아키텍처를 채택했습니다.

| 분류 | 기술 스택 | 선정 이유 및 활용 |
| :-- | :-- | :-- |
| **Backend** | **Java 17, Spring Boot 3.5.8** | 안정적인 REST API 구축, `Record`를 활용한 불변 DTO 관리 |
| **ORM / DB** | **JPA, QueryDSL, MariaDB** | 복잡한 동적 쿼리 처리 및 대용량 상권 데이터 관리 |
| **Cache** | **Redis** | 상권 분석 조회 및 지도 데이터 등 반복 요청에 대한 성능 최적화 |
| **Security** | **Spring Security, JWT** | Stateless한 인증 방식 구현 및 비밀번호 암호화 |
| **Data Eng.** | **Python, Pandas, Asyncio** | `aiohttp`를 활용한 공공데이터 비동기 수집(ETL) 및 지표 연산 |
| **Frontend** | **React 19, TypeScript, Vite** | 컴포넌트 기반 UI 설계 및 빠른 빌드 환경 구축 |
| **Styling** | **Tailwind CSS, daisyUI** | 유틸리티 퍼스트 CSS를 통한 빠른 UI 개발 |
| **Visual** | **Chart.js, Kakao Map SDK** | 상권 등급 히트맵(Polygon) 및 분석 차트 시각화 |

<br/>

## 3. 시스템 아키텍처 (Architecture)

1.  **ETL Pipeline (Python):** `aiohttp`와 `asyncio`를 사용해 공공데이터 포털 API에서 서울시 전역의 데이터를 비동기로 수집 및 가공하여 MariaDB에 적재합니다.
2.  **Scheduler (Spring Boot):** 매일 새벽 4시 `MarketEtlScheduler`가 Python 스크립트를 실행하여 최신 데이터를 반영합니다.
3.  **API Service:** 클라이언트 요청 시 Redis 캐시를 우선 조회하며, QueryDSL을 통해 조건에 맞는 데이터를 효율적으로 조회합니다.
4.  **Client:** GeoJSON 기반의 폴리곤 렌더링을 통해 지도 위에 직관적인 상권 등급(신호등)을 표시합니다.

<br/>

## 4. 핵심 기능 (Key Features)

### 📊 1. 순성장률 기반 상권 정밀 분석
- **순성장률(Net Growth Rate)** = `점포 증가율(%)` - `폐업률(%)`
- 선택한 지역/업종의 월 평균 매출, 점포 수, 유동인구 데이터를 대시보드 형태로 제공합니다.
- **시각화:** `Chart.js`를 활용하여 매출 규모와 성장성/위험도를 그래프로 표현합니다.

### 🗺️ 2. 지도 기반 상권 등급 시각화 (Heatmap)
- 행정동 단위로 상권 등급을 **3단계(🟢추천, 🟡주의, 🔴위험)**로 구분하여 지도에 폴리곤 색상을 입혔습니다.
- `Kakao Map API`와 `GeoJSON` 데이터를 매핑하여, 사용자가 지도를 보며 직관적으로 '뜨는 동네'를 찾을 수 있습니다.

### 🏆 3. 가중치 기반 맞춤형 창업 추천 (Algorithm)
- 사용자가 선호하는 기준(수익성 vs 안전성)에 따라 가중치를 조절하여 개인화된 순위를 추천합니다.
- **Scoring:** `(매출 × W1) + (순성장률 × W2) - (폐업률 × W3) + 유동인구 가산점`

<br/>

## 5. 기술적 도전 및 해결 (Troubleshooting)

### 🚀 1. 공공데이터 수집 속도 10배 향상 (Sync → Async)
- **문제:** `requests` 라이브러리로 서울시 전체 데이터를 수집할 때 동기(Blocking) 처리로 인해 약 20분 이상 소요됨.
- **해결:** Python의 `asyncio`와 `aiohttp`를 도입하여 비동기(Non-blocking) 방식으로 전환하고, `Semaphore`로 동시 요청 수를 제어함.
- **결과:** 데이터 수집 시간을 **약 1분 내외로 단축 (약 10배 성능 향상)**.
- [👉 상세 트러블슈팅 문서 보기](docs/troubleshooting/async_processing.md)

### 🔍 2. QueryDSL을 활용한 동적 쿼리 및 성능 최적화
- **문제:** 지역, 업종, 매출 기준 등 다양한 필터링 조건이 조합될 때 JPA Method name만으로는 한계가 발생. 또한 연관 관계 조회 시 N+1 문제 우려.
- **해결:** `QueryDSL`을 도입하여 컴파일 시점의 타입 안정성을 확보하고, 동적 쿼리(`BooleanExpression`)를 구현. `Fetch Join`을 적용하여 연관된 `Region`, `Category` 엔티티를 한 번에 조회하도록 최적화.

### 💾 3. Redis 캐싱을 통한 조회 성능 개선
- **문제:** 지도 시각화를 위해 서울시 전체 구/동 데이터를 조회할 때 DB 부하가 발생하고 응답 속도가 느려짐.
- **해결:** 변동이 적은 분석 데이터(`MarketAnalysisService`)와 지도 데이터(`MarketMapResponse`)에 Redis 캐싱(`@Cacheable`) 적용.
- **결과:** 반복 조회 시 응답 속도를 밀리초(ms) 단위로 단축.

<br/>

## 6. 프로젝트 구조 (Directory Structure)

```bash
Open-Insight
├── BACK (Spring Boot)
│   ├── src/main/java/com/back
│   │   ├── domain       # 도메인별(Auth, Member, Market, Region) 로직 분리
│   │   ├── global       # Security, JWT, Error, Config 설정
│   │   └── ...
│   └── build.gradle
│
├── FRONT (React)
│   ├── src
│   │   ├── api          # Axios Client & API 모듈
│   │   ├── components   # Chart, Map, Common UI 컴포넌트
│   │   ├── pages        # Analysis, Ranking, Home 페이지
│   │   └── types        # TypeScript Interface 정의
│   └── ...
│
└── DATA (Python)
    ├── src
    │   ├── api          # 공공데이터 API 클라이언트
    │   ├── etl          # 데이터 수집 및 적재 로직 (Async)
    │   └── service      # 지표 계산 로직 (Calculator)
    └── ...
````

<br>

## 7\. 실행 방법 (Getting Started)

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
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
python src/etl/init_data.py  # 기초 데이터 적재
python src/etl/market_collect.py # 상권 데이터 수집
```

-----



