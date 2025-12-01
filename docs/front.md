# front 구조

### 📂 Open Insight 프론트엔드 디렉터리 구조

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

-----

### 💡 핵심 포인트 설명

1.  **`src/mocks/`**:

      * 현재 백엔드 서버가 없으므로, API 명세서(`api_spec.md`)에 있는 JSON 응답 예시들을 여기에 `.json` 파일로 저장해두고 불러와서 화면을 만드세요. 나중에 실제 API가 나오면 경로만 바꿔주면 됩니다.

2.  **`src/components/map/` & `src/components/chart/`**:

      * 이 프로젝트의 핵심인 **지도**와 **차트**는 복잡해질 가능성이 큽니다. 일반 `common` 컴포넌트와 섞지 말고, 별도 폴더로 분리하여 관리하는 것이 좋습니다.

3.  **`src/pages/`**:

      * 기획서의 핵심 기능 4가지(분석, 순위, 비교, 가이드)에 맞춰 1:1로 페이지 파일을 만드세요.

### 🚀 지금 바로 할 일

VS Code에서 `src` 폴더 안에 위 구조대로 폴더들을 쭉 생성해 주세요.
그 다음 `npm install react-router-dom`

-----

### 1\. UI 컴포넌트 라이브러리 (Tailwind 짝꿍)

Tailwind만 쓰면 버튼 하나 만들 때도 클래스가 너무 길어집니다. 미리 만들어진 컴포넌트를 가져다 쓰는 것이 효율적입니다.

  * **추천 1순위: shadcn/ui** (요즘 가장 핫함)
      * **이유:** npm 설치 방식이 아니라 코드를 복사해서 내 프로젝트에 붙여넣는 방식입니다. 디자인 커스터마이징이 자유롭고, 포트폴리오에 "Headless UI와 Tailwind를 활용한 모던 UI 구축" 경험을 적기 좋습니다.
      * **용도:** 버튼, 카드, 모달, 아코디언, 드롭다운 등 기본 UI.
  * **추천 2순위: daisyUI** (가장 쉬움)
      * **이유:** Tailwind 플러그인 형태입니다. `btn btn-primary` 같은 단순한 클래스명만 추가하면 예쁜 디자인이 나옵니다. 빠르게 개발하기엔 최고입니다.

### 2\. 차트 (Data Visualization)

프로젝트 핵심인 '폐업률', '매출 추이' 등을 보여주려면 차트가 필수입니다.

  * **추천: react-chartjs-2** (with Chart.js)
      * **이유:** README 기술 스택에 `Chart.js`를 적어두셨으니 이걸 쓰시는 게 기획과 일치합니다. 문서가 방대하고 예제 코드가 많아서 막혔을 때 구글링하기 편합니다.
      * **대안:** **Recharts** (React 친화적, 컴포넌트 구조가 깔끔함)

### 3\. 지도 (Map)

  * **추천: react-kakao-maps-sdk**
      * **이유:** 카카오맵 JavaScript API를 리액트 컴포넌트 형태로 감싸둔 라이브러리입니다.
      * `new kakao.maps.Map()` 같은 바닐라 JS 코드를 직접 쓰는 것보다, `<Map />`, `<MapMarker />` 처럼 리액트스럽게 쓸 수 있어서 코드가 훨씬 깔끔해집니다.

### 4\. 아이콘 (Icons)

  * **추천: lucide-react** 또는 **react-icons**
      * **lucide-react:** 선(Line) 스타일의 깔끔한 아이콘으로, shadcn/ui와 찰떡궁합입니다. 요즘 디자인 트렌드에 잘 맞습니다.
      * **react-icons:** FontAwesome 등 세상의 모든 아이콘을 다 모아둔 패키지입니다.

### 5\. 유틸리티 (필수\!)

Tailwind를 쓴다면 이 두 가지는 거의 필수입니다.

  * **clsx** 또는 **classnames**: 조건부 스타일링 (예: 활성화된 버튼만 색상 변경) 할 때 편합니다.
  * **tailwind-merge**: Tailwind 클래스 충돌을 해결해줍니다. (나중에 컴포넌트 재사용할 때 필수)

### 6\. 상태 관리 & 데이터 패칭

  * **Axios**: API 통신 기본.
  * **Zustand**: (선택) Redux보다 훨씬 쉽고 가벼운 전역 상태 관리 라이브러리입니다. "로그인 유저 정보"나 "선택한 필터 옵션" 관리하기에 딱 좋습니다.

-----

### 💡 요약: 최종 설치 명령어

```bash
# 1. 필수 라이브러리 (라우터, 아이콘, 유틸, 차트, 지도)
npm install react-router-dom lucide-react clsx tailwind-merge chart.js react-chartjs-2 react-kakao-maps-sdk axios

# 2. (선택) UI 라이브러리로 daisyUI를 쓴다면
npm install -D daisyui@latest
```

**최종 선택:**
일단 **daisyUI**로 빠르게 UI 껍데기를 잡고, **Chart.js**와 **카카오맵 SDK** 연동에 집중. 디자인은 나중에 수정.
