# front 구조

### 📂 Open Insight 프론트엔드 디렉터리 구조

```bash
FRONT
├── public/                  # 정적 파일 (favicon, robots.txt 등)
├── src/
│   ├── assets/              # 이미지, 로고, 아이콘 등
│   │   └── images/
│   │
│   ├── api/                 # API 호출 관련 로직 (axiosClient)
│   │   ├── axiosClient.js   # Axios 인스턴스 설정 (Interceptors 등)
│   │   └── endpoints.js     # API 주소 관리
│   │
│   ├── mocks/               # ★ 가짜 데이터 (백엔드 연동 전까지 사용)
│   │   ├── rankingData.json # 창업 순위 데이터 (수익성/안전성 뱃지 포함)
│   │   └── marketData.json  # 상권 상세 분석 및 지도 데이터
│   │
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── layout/          # 레이아웃 관련
│   │   │   ├── Header.jsx   # 네비게이션 바
│   │   │   └── Footer.jsx
│   │   ├── common/          # 공통 UI (버튼, 인풋, 카드, 로딩 스피너 등)
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Badge.jsx    # 순위 뱃지 (수익성 BEST 등)
│   │   ├── map/             # ★ 지도 관련 (카카오맵)
│   │   │   ├── KakaoMap.jsx # 지도 컨테이너
│   │   │   └── Polygon.jsx  # 행정구역 폴리곤 (상권 등급 색상 표시)
│   │   └── chart/           # ★ 차트 관련 (Chart.js 래퍼)
│   │       ├── SalesChart.jsx # 매출 추이 그래프
│   │       └── GrowthChart.jsx # 성장률/폐업률 비교 그래프
│   │
│   ├── pages/               # 라우팅되는 실제 페이지들
│   │   ├── Home.jsx         # 메인 페이지 (대시보드 요약)
│   │   ├── Analysis.jsx     # 상권 상세 분석 (지도로 구역 선택 -> 상세 리포트)
│   │   ├── Ranking.jsx      # 맞춤형 창업 순위 (가중치 조절 기능 포함)
│   │   └── NotFound.jsx     # 404 에러 페이지
│   │
│   ├── hooks/               # 커스텀 훅 (로직 분리)
│   │   ├── useMap.js        # 카카오맵 제어 로직 (줌 레벨, 클릭 이벤트)
│   │   └── useFetch.js      # 데이터 가져오기 로직
│   │
│   ├── styles/              # 전역 스타일 (CSS, Styled-components 테마)
│   │   └── GlobalStyle.js
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── format.js        # 금액 콤마, 날짜 포맷팅
│   │   └── constants.js     # 상수 관리 (업종 카테고리 ID, 등급 컬러코드 등)
│   │
│   ├── App.jsx              # 라우팅 설정 (Routes 정의)
│   └── main.jsx             # 진입점 (Provider 설정 등)
│
├── index.html               # HTML 진입점
├── vite.config.js           # Vite 설정
└── package.json
````

-----

### 💡 핵심 포인트 설명

1.  **`src/mocks/`**:

      * 현재 백엔드 서버가 없거나 개발 중일 때, `api_spec.md`의 **2.1 상권 상세 분석** 및 **2.2 창업 순위 추천** 응답 예시를 JSON 파일로 저장해두고 활용합니다.

2.  **`src/components/map/` (핵심 시각화)**:

      * **폴리곤 시각화**: `GET /api/market/map-info`에서 받아온 등급(RED, YELLOW, GREEN)에 따라 행정동 구역의 색상을 다르게 표시해야 합니다.
      * 단순 마커보다 구역(Polygon) 단위의 시각화가 중요하므로 `Polygon.jsx` 컴포넌트를 별도로 관리하는 것이 좋습니다.

3.  **`src/pages/`**:

      * **Analysis.jsx**: 지도에서 지역을 선택하면 `GET /api/market/analysis`를 호출하여 매출, 유동인구, 성장률 등을 차트와 신호등 UI로 보여줍니다.
      * **Ranking.jsx**: 사용자가 수익성/안전성 가중치를 조절하면 `POST /api/market/recommend`를 호출하여 리스트를 갱신합니다.

### 🚀 라이브러리 설치

`npm install react-router-dom axios react-chartjs-2 chart.js react-kakao-maps-sdk clsx tailwind-merge`

-----

### 1\. UI 컴포넌트 라이브러리 (Tailwind 짝꿍)

  * **daisyUI** (사용 중):
      * **용도:** `Ranking.jsx`의 가중치 조절을 위한 **Range Slider**, 순위 표시를 위한 **Table**, 등급 표시를 위한 **Badge** 컴포넌트 활용에 최적화되어 있습니다.

### 2\. 차트 (Data Visualization)

  * **react-chartjs-2**:
      * **용도:** `Analysis.jsx`에서 매출 추이와 성장률 비교 그래프를 그릴 때 사용합니다. 백엔드의 `MarketDetailResponse` 데이터를 바인딩합니다.

### 3\. 지도 (Map)

  * **react-kakao-maps-sdk**:
      * **용도:** `Analysis.jsx`의 메인 화면. 행정동별 등급(`marketGrade`)을 시각적으로 보여주고, 클릭 이벤트를 통해 상세 분석으로 연결합니다.

### 4\. 상태 관리 & 데이터 패칭

  * **Axios**:
      * `src/api/axiosClient.js`에 `Base URL`과 `Interceptor`를 설정하여 토큰 관리 및 공통 에러 처리를 수행합니다.

