# 📘 Open Insight API 설계 명세서

## 1. 개요 (Overview)

  * **프로젝트명:** Open Insight (공공데이터 기반 상권 분석 및 업종 추천 플랫폼)
  * **Base URL:** `http://localhost:8080/api`
  * **Content-Type:** `application/json; charset=UTF-8`
  * **목표:** 예비 창업자에게 객관적인 데이터(매출, 폐업률, 순성장률)를 제공하여 레드오션을 피하고 블루오션을 찾도록 돕는다.

## 2. API 상세 명세

### 2.1. 상권 상세 분석 (Market Analysis)

사용자가 선택한 특정 **지역(행정동)**과 **업종**에 대한 정밀 분석 데이터를 조회합니다.

  * **Endpoint:** `GET /api/market/analysis`
  * **설명:** 선택한 지역/업종의 점포 수, 매출, 폐업률, 그리고 **순성장률 기반의 상권 등급**을 반환합니다.
  * **Request Parameters:**

| 파라미터명 | 타입 | 필수 | 설명 | 예시 |
| :--- | :--- | :--- | :--- | :--- |
| `admCode` | String | Y | 행정동/법정동 코드 | `"1168051000"` |
| `categoryId` | Long | Y | 업종 ID | `1` |

  * **Response (Success: 200 OK):** `MarketDetailResponse`

```json
{
  "statsId": 101,
  "regionName": "서울특별시 강남구",
  "categoryName": "카페",
  "averageSales": 45000000,
  "storeCount": 120,
  "growthRate": 5.2,
  "closingRate": 2.1,
  "netGrowthRate": 3.1,   // 순성장률 (성장률 - 폐업률)
  "marketGrade": "GREEN", // 지도 마커/폴리곤 색상 결정 (RED/YELLOW/GREEN)
  "description": "추천 상권",
  "label": "안전"
}
````

-----

### 2.2. 맞춤형 창업 순위 추천 (Startup Ranking)

사용자가 설정한 가중치(수익성 vs 안정성)에 따라 **유망한 창업 지역과 업종 순위**를 산출합니다.

  * **Endpoint:** `POST /api/market/recommend`
  * **설명:** 사용자의 가중치 옵션을 받아 자체 알고리즘으로 스코어링 후 상위 10개 랭킹을 반환합니다.
  * **Request Body:** `MarketAnalysisRequest`


```json
{
  "admCode": "1168051000", // 특정 지역 내에서 비교할 때 사용. 전체 지역 대상이면 null
  "categoryId": null,      // 특정 업종만 비교할 때 사용. 전체 업종 대상이면 null
  "weightOption": {
    "salesWeight": 0.5,    // 매출 비중 (수익성)
    "stabilityWeight": 0.3, // 폐업률 비중 (안정성)
    "growthWeight": 0.2 // 성장률 비중
  }
}
```

  * **Response (Success: 200 OK):** `List<StartupRankingResponse>`


```json
[
  {
    "rank": 1,
    "regionName": "서울특별시 마포구",
    "categoryName": "베이커리",
    "totalScore": 89.5,
    "badge": "수익성 BEST"
  },
  {
    "rank": 2,
    "regionName": "부산광역시 해운대구",
    "categoryName": "한식",
    "totalScore": 81.0,
    "badge": "뜨는 상권"
  }
]
```

-----

### 2.3. 지도 시각화용 데이터 (Map Overlay)

지도상에 여러 지역의 **밀집도 및 성장성**을 한눈에 보여주기 위한 다건 조회 API입니다. (히트맵 구현용)

  * **Endpoint:** `GET /api/market/map-info`
  * **설명:** 특정 시/도(Province) 내의 **모든 구(District)**에 대한 해당 업종의 등급 정보를 반환합니다. 프론트엔드 카카오맵에서 구역별 색상을 칠할 때 사용합니다.
  * **Request Parameters:**

| 파라미터명 | 타입 | 필수 | 설명 | 예시 |
| :--- | :--- | :--- | :--- | :--- |
| `province` | String | Y | 시/도 이름 | `"서울특별시"` |
| `categoryId` | Long | Y | 업종 ID | `2` |

  * **Response (Success: 200 OK):** `List<MarketMapResponse>`


```json
[
  {
    "admCode": "1168051000",
    "district": "강남구",
    "storeCount": 500,       // 밀집도 시각화용
    "marketGrade": "RED",    // 폴리곤 색상용 (RED: 위험/쇠퇴)
    "netGrowthRate": -2.5    // 순성장률
  },
  {
    "admCode": "1144000000",
    "district": "마포구",
    "storeCount": 200,
    "marketGrade": "GREEN",  // 폴리곤 색상용 (GREEN: 안전/성장)
    "netGrowthRate": 4.1
  }
]
```

-----

## 3. 데이터 모델 요약 (ERD Concept)

1.  **Region (지역):**

      * `region_id` (PK)
      * `province` (시/도)
      * `district` (구/군)
      * `admCode` (행정동 코드 - 지도 매핑용)

2.  **Category (업종):**

      * `category_id` (PK)
      * `name` (업종명: 한식, 카페 등)

3.  **MarketStats (상권 통계):**

      * `stats_id` (PK)
      * `region_id` (FK)
      * `category_id` (FK)
      * `storeCount` (점포 수)
      * `averageSales` (평균 매출)
      * `closingRate` (폐업률)
      * `growthRate` (성장률)
      * `netGrowthRate` (순성장률)
      * `marketGrade` (상권 등급: RED, YELLOW, GREEN)

## 4. 응답 코드 (Status Codes)

  * `200 OK`: 요청 성공
  * `400 Bad Request`: 필수 파라미터 누락
  * `404 Not Found`: 분석 데이터 없음 (해당 지역/업종 데이터 미수집 등)
  * `500 Internal Server Error`: 서버 오류
