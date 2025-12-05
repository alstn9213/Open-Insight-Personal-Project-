# Front-End 설계 및 명세서

### 1. 개요 (Overview)
* **Tech Stack:** React (v19), TypeScript, Vite
* **Styling:** Tailwind CSS, daisyUI
* **Visualization:** Chart.js (react-chartjs-2), Kakao Map (react-kakao-maps-sdk)
* **HTTP Client:** Axios
* **Routing:** React Router DOM (v7)

---

### 2. 📂 프론트엔드 디렉터리 구조 (Directory Structure)
```bash
FRONT
├── public/                  # 정적 파일 (favicon, robots.txt, mock geojson 등)
│   └── assets/
│       └── geojson/         # 행정동 경계 데이터 (.geojson)
│
├── src/
│   ├── api/                 # API 호출 관련 로직
│   │   ├── axiosClient.ts   # Axios 인스턴스 (Base URL, Interceptors 설정)
│   │   └── marketApi.ts     # 상권 분석 관련 API 함수 분리
│   │
│   ├── components/          # UI 컴포넌트
│   │   ├── layout/          # 레이아웃 관련 (Header, Footer)
│   │   │   └── Header.tsx
│   │   ├── common/          # 재사용 가능한 공통 UI (버튼, 로딩, 배지 등)
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── GradeBadge.tsx # 상권 등급 표시 배지
│   │   ├── map/             # 지도 관련 컴포넌트
│   │   │   └── AnalysisMap.tsx # 카카오맵 및 폴리곤 렌더링
│   │   └── chart/           # 차트 관련 컴포넌트
│   │       ├── AnalysisChart.tsx # 차트 컨테이너
│   │       ├── SalesChart.tsx    # 매출 분석 차트
│   │       ├── GrowthChart.tsx   # 성장률/폐업률 차트
│   │       └── ScoreChart.tsx    # 종합 점수 시각화
│   │
│   ├── pages/               # 라우팅되는 실제 페이지
│   │   ├── Home.tsx         # 메인 페이지
│   │   ├── Analysis.tsx     # 상권 상세 분석 (지도 + 차트 대시보드)
│   │   └── Ranking.tsx      # 맞춤형 창업 순위
│   │
│   ├── types/               # TypeScript 타입 정의 (*.d.ts 또는 interface)
│   │   ├── market.ts        # MarketStats, MarketDetailResponse 등 도메인 타입
│   │   ├── map.ts           # GeoJSON, Polygon 관련 타입
│   │   └── auth.ts          # User, LoginRequest 등 인증 관련 타입
│   │
│   ├── hooks/               # 커스텀 훅
│   │   └── useMap.ts        # 지도 로직 분리 시 사용
│   │
│   ├── utils/               # 유틸리티 함수 및 설정
│   │   ├── chartSetup.ts    # Chart.js 레지스트리 등록
│   │   └── format.ts        # 금액/날짜 포맷팅 함수
│   │
│   ├── mocks/               # Mock Data (백엔드 연동 전 테스트용)
│   │   └── rankingData.json
│   │
│   ├── App.tsx              # 라우팅 설정
│   ├── main.tsx             # 진입점
│   └── index.css            # Tailwind 지시어 포함 전역 스타일
│
├── index.html               # HTML 진입점
├── vite.config.ts           # Vite 설정 (Proxy 등)
├── tailwind.config.js       # Tailwind & daisyUI 설정
└── package.json
```

-----

### 3\. 💡 핵심 구현 포인트

#### 3.1. 타입 시스템 (TypeScript)

  * **`src/types/`**: `MarketDetailResponse`, `MarketGrade` 등 백엔드 DTO와 싱크를 맞춘 인터페이스를 정의하여, 컴포넌트 간 데이터 전달 시 타입 안정성을 보장합니다.
      * `market.ts`: 상권 분석 데이터 모델
      * `map.ts`: 지도 폴리곤 및 GeoJSON 타입

#### 3.2. 지도 시각화 (`src/components/map/`)

  * **AnalysisMap.tsx**:
      * `react-kakao-maps-sdk`를 사용하여 카카오맵을 렌더링합니다.
      * `GeoJSON` 데이터를 로드하여 행정동 경계를 `Polygon`으로 그립니다.
      * 백엔드에서 받은 `marketGrade`(RED, YELLOW, GREEN)에 따라 폴리곤의 색상(`fillColor`)을 동적으로 변경합니다.

#### 3.3. 데이터 시각화 (`src/components/chart/`)

  * **AnalysisChart.tsx**: 상세 분석 페이지의 핵심 컴포넌트로, 데이터를 받아 하위 차트들에게 분배합니다.
  * **SalesChart.tsx / GrowthChart.tsx**: `react-chartjs-2`를 사용하여 매출 추이와 성장률/폐업률을 Bar Chart 등으로 표현합니다.
  * **`src/utils/chartSetup.ts`**: Chart.js 사용을 위한 필수 요소(Scale, Legend, Tooltip 등)를 전역적으로 등록합니다.

#### 3.4. 상태 관리 및 비동기 처리

  * **Axios**: `src/api/axiosClient.ts`에 Base URL(`/api`) 및 Request Interceptor(JWT 토큰 자동 삽입)가 설정되어 있습니다.
  * **Loading State**: 데이터를 불러오는 동안 `daisyUI`의 `loading-spinner`를 활용해 사용자 경험을 개선합니다.

-----

### 4\. 🚀 라이브러리 (Dependencies)

**설치 명령어:**

```bash
npm install react-router-dom axios react-chartjs-2 chart.js react-kakao-maps-sdk clsx tailwind-merge lucide-react
npm install -D tailwindcss postcss autoprefixer daisyui
```

| 구분 | 패키지명 | 용도 |
| :--- | :--- | :--- |
| **Framework** | `react`, `react-dom` | UI 라이브러리 (v19) |
| **Language** | `typescript` | 정적 타입 지원 |
| **Build Tool** | `vite` | 빠른 빌드 및 개발 서버 |
| **Routing** | `react-router-dom` | SPA 라우팅 (v7) |
| **Styling** | `tailwindcss`, `daisyui` | 유틸리티 퍼스트 CSS 및 UI 컴포넌트 |
| **Chart** | `chart.js`, `react-chartjs-2` | 데이터 그래프 시각화 |
| **Map** | `react-kakao-maps-sdk` | 카카오맵 React 래퍼 |
| **HTTP** | `axios` | REST API 통신 |

```

### 👨‍💻 예정

 **`components/common` vs `components/chart` 분리**:
    * `Badge`나 `Loading` 같은 범용 UI는 `common`으로, 도메인 특화된 차트는 `chart`로 명확히 구분하여 컴포넌트 탐색 시간을 줄였다. `ScoreChart` 내부의 `GradeBadge` 같은 경우, 여러 곳에서 쓰인다면 `common/GradeBadge.tsx`로 추출.
```