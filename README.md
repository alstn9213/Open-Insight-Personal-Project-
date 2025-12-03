# [Open Insight] 데이터 기반 예비 창업자 맞춤형 상권 분석 플랫폼

### 1. 프로젝트 개요

- **주제:** 공공데이터 분석을 통한 상권 위험도 진단 및 블루오션 업종 추천 서비스
- **기획 의도:** 진입 장벽이 낮은 요식업 등의 높은 폐업률 문제를 해결하기 위해, 예비 창업자에게 직관적인 데이터(순성장률, 매출, 폐업률)를 제공하여 객관적인 의사결정을 돕고자 합니다.
- **타겟 사용자:** 퇴직 후 창업을 고려하는 중장년층, 데이터 기반으로 입지를 선정하고 싶은 예비 창업자.

### 2. 기술 스택 (Tech Stack)

이 프로젝트는 **하이브리드 아키텍처**를 채택하여, 웹 서비스의 안정성과 데이터 분석의 유연성을 동시에 확보했습니다.

| 구분          | 기술 스택                      | 선정 이유                                                              |
| :------------ | :----------------------------- | :--------------------------------------------------------------------- |
| **Backend** | **Java, Spring Boot, JPA** | 안정적인 REST API 서버 구축 및 객체 지향적인 데이터 관리               |
| **Data Eng.** | **Python (Pandas, Requests)** | 공공 데이터 수집(ETL), 전처리 및 순성장률 등 파생 지표 연산 수행       |
| **Database** | **MariaDB** | 대용량 상권 데이터를 저장하고 Python과 Java 간의 데이터 공유 허브 역할 |
| **Frontend** | **React, Chart.js, Kakao Map** | 분석된 데이터를 차트와 히트맵(지도)으로 시각화하여 사용자 경험(UX) 극대화 |

### 3. 시스템 아키텍처

1.  **데이터 수집/가공 (Python):** 소상공인시장진흥공단 상가 정보 등 공공데이터를 수집하고 정제하여 MariaDB에 적재.
2.  **데이터베이스 (MariaDB):** 분석된 통계 데이터(MarketStats)와 지역 정보 관리.
3.  **API 서버 (Spring Boot):** 프론트엔드의 요청에 따라 분석 결과 및 랭킹을 조회하여 JSON 형태로 반환.
4.  **클라이언트 (React):** 지표를 그래프와 지도로 시각화하여 제공.

### 4. 핵심 기능 (Key Features)

#### 4.1. 지역/업종별 시장 분석 (Net Growth Rate)

- **기능:** 사용자가 관심 지역과 업종을 선택하면 해당 시장의 상태를 신호등(🔴위험, 🟡주의, 🟢추천)으로 표시.
- **로직:** **순성장률(Net Growth Rate)** 지표를 활용하여 상권의 활력도 진단.
  - $$순성장률 = 점포 증가율(\%) - 폐업률(\%)$$
  - 양수(+)일수록 성장세, 음수(-)일수록 쇠퇴세를 의미.

#### 4.2. 지도 기반 상권 시각화 (Map Visualization)

- **기능:** 카카오맵 API를 활용하여 행정동(구 단위)별 상권 등급을 히트맵 형태로 시각화.
- **활용:** 사용자는 지도만 보고도 어느 지역이 현재 '뜨는 상권(Green)'인지 직관적으로 파악 가능.

#### 4.3. 맞춤형 창업 순위 추천 알고리즘

- 단순 매출 순이 아닌, 리스크와 성장성을 종합적으로 반영한 자체 스코어링 시스템.
- **알고리즘:** $$Score = (매출 \times W_{sales}) + (순성장률 \times W_{growth}) - (폐업률 \times W_{risk})$$
- 사용자에게 "수익성 중시" vs "안전성 중시" 옵션을 받아 가중치($W$)를 조절하여 개인화된 순위 제공.

### 5. 데이터베이스 설계 (ERD 요약)

- **`regions`:** 행정동 코드, 시/도, 구/군 정보를 관리하는 기준 테이블.
- **`categories`:** 분석 대상 업종(한식, 카페, 편의점 등) 관리.
- **`market_stats`:** 지역/업종별 통계 데이터(점포 수, 매출, 폐업률, 순성장률 등)를 담는 핵심 테이블. Python 배치 작업으로 주기적 업데이트.

### 6. 기대 효과

- 감에 의존한 창업을 방지하고 데이터에 기반한 의사결정 유도.
- 공공 데이터를 시각화(지도, 차트)함으로써 정보의 비대칭성 해소.

# 백엔드 패키지 구조 (Package Structure)

```bash
src/main/java/com/BACK
├── global                  # 프로젝트 전반에 공통으로 쓰이는 설정 및 유틸리티
│   ├── config              # 설정 클래스 (Security, CORS 등)
│   └── error               # Global Exception Handling
│
├── domain                  # [Entity] 핵심 도메인 모델
│   ├── common              # BaseTimeEntity
│   ├── region              # Region (지역)
│   ├── category            # Category (업종)
│   └── market              # MarketStats (상권 통계)
│
├── dto                     # [DTO] 계층 간 데이터 교환 객체
│   ├── request             # MarketAnalysisRequest 등
│   └── response            # MarketDetailResponse, StartupRankingResponse 등
│
├── repository              # [Repository] JPA Repository
│
├── service                 # [Service] 비즈니스 로직
│   └── analysis            # ★핵심: 점수 계산, 순성장률 기반 등급 판별 로직
│
└── controller              # [Controller] API Endpoints
````

# 프론트엔드 패키지 구조 (Package Structure)

```bash
FRONT
├── src/
│   ├── api/                 # API 호출 로직
│   ├── components/          # UI 컴포넌트
│   │   ├── layout/          # Header, Footer
│   │   ├── map/             # ★ 지도 관련 (KakaoMap, Polygon)
│   │   └── chart/           # ★ 차트 관련 (Chart.js)
│   │
│   ├── pages/               # 라우팅 페이지
│   │   ├── Home.jsx         # 메인 대시보드
│   │   ├── Analysis.jsx     # 상권 상세 분석 (신호등/지도 화면)
│   │   └── Ranking.jsx      # 창업 순위 추천
│   │
│   ├── hooks/               # 커스텀 훅 (useMap, useFetch)
│   └── utils/               # 포맷팅 함수 등
```

# 추후 예정

1.  **Swagger 적용:** API 문서 자동화 및 테스트 환경 구축.
2.  **배치 스케줄링:** Python ETL 스크립트를 Jenkins나 Cron으로 주기적 실행.

