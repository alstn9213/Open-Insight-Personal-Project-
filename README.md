# [Open Insight] 데이터 기반 예비 창업자 맞춤형 상권 분석 및 컨설팅 플랫폼

### 1. 프로젝트 개요

- **주제:** 빅데이터 분석을 통한 자영업 창업 위험도 진단 및 업종 추천 서비스
- **기획 의도:** 진입 장벽이 낮은 요식업 등의 높은 폐업률 문제를 해결하기 위해, 예비 창업자에게 직관적인 데이터(폐업률, 수익률, 과포화 지수)를 제공하여 객관적인 의사결정을 돕고자 함.
- **타겟 사용자:** 퇴직 후 창업을 고려하는 중장년층, 요식업 창업을 준비하는 청년, 프랜차이즈 가맹을 고민하는 예비 점주.

### 2. 기술 스택 (Tech Stack)

이 프로젝트는 **하이브리드 아키텍처**를 채택하여, 웹 서비스의 안정성과 데이터 분석의 유연성을 동시에 확보했습니다.

| 구분          | 기술 스택                      | 선정 이유                                                              |
| :------------ | :----------------------------- | :--------------------------------------------------------------------- |
| **Backend**   | **Java, Spring Boot, JPA**     | 안정적인 REST API 서버 구축 및 객체 지향적인 데이터 관리               |
| **Data Eng.** | **Python (Pandas, Requests)**  | 공공 데이터 수집(ETL), 전처리 및 복잡한 가중치 연산 수행               |
| **Database**  | **MariaDB**                    | 대용량 상권 데이터를 저장하고 Python과 Java 간의 데이터 공유 허브 역할 |
| **Frontend**  | **React, Chart.js, Kakao Map** | 분석된 데이터를 시각화(차트, 히트맵)하여 사용자 경험(UX) 극대화        |

### 3. 시스템 아키텍처

1.  **데이터 수집/가공 (Python):** 공공데이터포털 및 웹 크롤링을 통해 상권/매출/폐업 데이터를 수집하고 정제하여 MariaDB에 적재.
2.  **데이터베이스 (MariaDB):** 분석된 통계 데이터와 사용자 정보 관리.
3.  **API 서버 (Spring Boot):** 프론트엔드의 요청에 따라 분석 결과를 조회하여 JSON 형태로 반환.
4.  **클라이언트 (React):** 지표를 그래프와 지도로 시각화하여 제공.

### 4. 핵심 기능 (Key Features)

#### 4.1. 지역/업종별 시장 분석 (Red vs Blue Ocean)

- **기능:** 사용자가 관심 지역과 업종을 선택하면 해당 시장의 상태를 신호등(🔴위험, 🟡주의, 🟢추천)으로 표시.
- **로직:** 해당 지역의 `점포 수 증가율` vs `폐업률`을 비교 분석하여 포화도 산출.

#### 4.2. 창업 추천 순위 알고리즘

- 단순 매출 순이 아닌, 리스크를 반영한 자체 스코어링 시스템 적용.
- **알고리즘:** $$Score = (평균 매출 \times W_1) - (폐업률 \times W_2) - (초기비용 \times W_3)$$
- 사용자에게 "수익성 중시" vs "안전성 중시" 옵션을 받아 가중치($W$)를 조절하여 개인화된 순위 제공.

#### 4.3. 프랜차이즈 vs 개인 창업 비교

- 특정 브랜드의 가맹점 평균 존속 기간, 본사 부담금, 폐업률 데이터를 개인 사업자 평균과 비교 분석하는 차트 제공.

### 5. 데이터베이스 설계 (ERD 요약)

- **`regions`, `categories`:** 정규화를 통해 데이터 중복을 최소화한 기준 정보 테이블.
- **`market_stats`:** 지역/업종별 통계 데이터를 담는 핵심 테이블. Python 배치 작업으로 주기적 업데이트.
- **`franchises`:** 프랜차이즈 브랜드별 상세 정보(비용, 계약기간 등) 저장.
- **`startup_guides`:** 업종별 비정형 텍스트 데이터(팁, 규제) 관리.

### 6. 기대 효과

- 감에 의존한 창업을 방지하여 자영업자 폐업률 감소에 기여.
- 공공 데이터를 시각화함으로써 정보의 비대칭성 해소.

# 백엔드 패키지 구조 (Package Structure)

```bash
src/main/java/com/BACK
├── global                  # 프로젝트 전반에 공통으로 쓰이는 설정 및 유틸리티
│   ├── config              # 설정 클래스 (Security, CORS, Swagger, QueryDSL 등)
│   ├── auth                # JWT, 로그인 관련 로직 (Security Filter, UserDetail 등)
│   ├── error               # Global Exception Handling (GlobalExceptionHandler, ErrorCode)
│   └── util                # 정적 유틸리티 클래스 (날짜 계산, 점수 산출 공식 등)
│
├── domain                  # [Entity] 데이터베이스 테이블과 매핑되는 핵심 클래스 (현재 구현됨)
│   ├── common              # BaseTimeEntity 등 공통 엔티티
│   ├── member              # 회원 (User/Member)
│   ├── region              # Region (지역)
│   ├── market              # MarketStats (상권 통계)
│   ├── franchise           # Franchise (프랜차이즈)
│   └── guide               # StartupGuide (창업 가이드)
│
├── dto                     # [Data Transfer Object] 계층 간 데이터 교환 객체 (Entity 직접 노출 X)
│   ├── request             # API 요청 데이터 (예: SignupRequest, AnalysisRequest)
│   └── response            # API 응답 데이터 (예: RankResponse, MarketDetailResponse)
│
├── repository              # [Repository] DB 접근 계층 (JPA Repository)
│
├── service                 # [Service] 핵심 비즈니스 로직 (트랜잭션 관리)
│   ├── auth                # 로그인, 회원가입 서비스
│   ├── analysis            # ★핵심: 점수 계산, 상권 등급 판별 로직
│   └── market              # 기본 CRUD 및 데이터 조회 서비스
│
└── controller              # [Controller] 웹 요청 처리 및 응답 (API Endpoints)
```

# 프론트엔드 패키지 구조 (Package Structure)

```bash
FRONT
├── public/                  # 정적 파일 (favicon, robots.txt 등)
├── src/
│   ├── assets/              # 이미지, 로고, 아이콘 등
│   │   └── images/
│   │
│   ├── api/                 # API 호출 관련 로직 (나중에 axios 설정 등)
│   │   ├── axiosClient.js   # (추후) Axios 인스턴스 설정
│   │   └── endpoints.js     # API 주소 관리
│   │
│   ├── mocks/               # ★ 가짜 데이터 (백엔드 연동 전까지 사용)
│   │   ├── rankingData.json # 창업 순위 데이터
│   │   ├── marketData.json  # 상권 분석 데이터
│   │   └── guideData.json   # 창업 가이드 데이터
│   │
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/          # 레이아웃 관련
│   │   │   ├── Header.jsx   # 네비게이션 바
│   │   │   └── Footer.jsx
│   │   ├── common/          # 공통 UI (버튼, 인풋, 카드 등)
│   │   │   ├── Button.jsx
│   │   │   └── Card.jsx
│   │   ├── map/             # ★ 지도 관련 (카카오맵)
│   │   │   ├── KakaoMap.jsx # 지도 컨테이너
│   │   │   └── Marker.jsx   # 마커 컴포넌트
│   │   └── chart/           # ★ 차트 관련 (Chart.js 래퍼)
│   │       ├── BarChart.jsx # 프랜차이즈 비교용 막대 차트
│   │       └── PieChart.jsx
│   │
│   ├── pages/               # 라우팅되는 실제 페이지들
│   │   ├── Home.jsx         # 메인 페이지 (대시보드 요약)
│   │   ├── Analysis.jsx     # 상권 상세 분석 (신호등/지도 화면)
│   │   ├── Ranking.jsx      # 창업 순위 추천 (알고리즘 랭킹)
│   │   ├── Franchise.jsx    # 프랜차이즈 vs 개인 비교
│   │   ├── Guide.jsx        # 창업 가이드 게시판
│   │   └── NotFound.jsx     # 404 에러 페이지
│   │
│   ├── hooks/               # 커스텀 훅 (로직 분리)
│   │   ├── useMap.js        # 카카오맵 제어 로직
│   │   └── useFetch.js      # 데이터 가져오기 로직
│   │
│   ├── styles/              # 전역 스타일 (CSS, Styled-components 테마)
│   │   └── GlobalStyle.js
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── format.js        # 금액 콤마 찍기, 날짜 변환 등
│   │   └── constants.js     # 상수 관리 (업종 카테고리 ID 등)
│   │
│   ├── App.jsx              # 라우팅 설정 (Routes 정의)
│   └── main.jsx             # 진입점 (Provider 설정 등)
│
├── index.html               # HTML 진입점
├── vite.config.js           # Vite 설정
└── package.json
```

# 추후 예정

1.  **Swagger 활용:** Spring Boot를 사용 중이시므로 `springdoc-openapi-starter-webmvc-ui` 의존성을 추가하여 이 명세서를 자동으로 시각화한 화면을 캡처
