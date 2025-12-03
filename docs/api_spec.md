# 📘 Open Insight API 설계 명세서

## 1. 개요 (Overview)

  * **프로젝트명:** Open Insight (데이터 기반 상권 분석 및 컨설팅 플랫폼)
  * **Base URL:** `http://localhost:8080/api`
  * **Content-Type:** `application/json; charset=UTF-8`
  * **인증 방식:** Bearer Token (JWT)

## 2. API 상세 명세

### 2.1. 상권 상세 분석 (Market Analysis)

사용자가 선택한 지역(행정동)과 업종에 대한 상세 분석 데이터를 조회합니다.

  * **Endpoint:** `GET /api/market/analysis`
  * **설명:** 특정 지역/업종의 점포 수, 매출, 폐업률, 상권 등급(신호등)을 반환합니다.
  * **Request Parameters:**

| 파라미터명 | 타입 | 필수 | 설명 | 예시 |
| :--- | :--- | :--- | :--- | :--- |
| `admCode` | String | Y | 행정동/법정동 코드 | `"1168051000"` |
| `categoryId` | Long | Y | 업종 ID | `1` |

  * **Response (Success: 200 OK):** `MarketDetailResponse` 기반

```json
{
  "statsId": 101,
  "regionName": "서울특별시 강남구",
  "categoryName": "카페",
  "averageSales": 45000000,
  "storeCount": 120,
  "growthRate": 5.2,
  "closingRate": 2.1,
  "marketGrade": "GREEN",
  "description": "추천 상권",
  "label": "안전"
}
````

-----

### 2.2. 맞춤형 창업 순위 추천 (Startup Ranking)

사용자가 설정한 가중치(수익성 vs 안정성)에 따라 추천 업종/지역 순위를 산출합니다.

  * **Endpoint:** `POST /api/market/recommend`

  * **설명:** 사용자의 가중치 옵션을 받아 자체 알고리즘으로 스코어링 후 상위 랭킹을 반환합니다.

  * **알고리즘 공식:**
    $$Score = (평균 매출 \times W_{sales}) - (폐업률 \times W_{stability} \times 100) + (성장률 \times 10)$$

  * **Request Body:** `MarketAnalysisRequest` 기반

```json
{
  "admCode": "1168051000",
  "categoryId": null,
  "weightOption": {
    "salesWeight": 0.5,    // 매출 비중 (수익성)
    "stabilityWeight": 0.3, // 폐업률 비중 (안정성)
    "growthWeight": 0.2 // 성장률 비중
  }
}
```

  * **Response (Success: 200 OK):** `List<StartupRankingResponse>` 기반


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
    "regionName": "서울특별시 송파구",
    "categoryName": "편의점",
    "totalScore": 85.2,
    "badge": "안전성 BEST"
  },
  {
    "rank": 3,
    "regionName": "부산광역시 해운대구",
    "categoryName": "한식",
    "totalScore": 81.0,
    "badge": "뜨는 상권"
  }
]
```

  * **Badge 기준:**
      * **수익성 BEST:** 월 평균 매출 5,000만 원 이상
      * **안전성 BEST:** 폐업률 2.0% 이하
      * **뜨는 상권:** 점포 성장률 5.0% 이상

-----

### 2.3. 프랜차이즈 vs 개인 창업 비교 (Franchise Comparison)

특정 프랜차이즈 브랜드와 해당 지역 개인 창업 평균 데이터를 비교합니다.

  * **Endpoint:** `GET /api/franchise/compare`
  * **설명:** 선택한 프랜차이즈의 데이터와 지역 평균 통계를 비교하여 리스크, 비용, 존속 기간 분석 결과를 반환합니다.
  * **Request Parameters:**

| 파라미터명 | 타입 | 필수 | 설명 |
| :--- | :--- | :--- | :--- |
| `franchiseId` | Long | Y | 프랜차이즈 ID |
| `admCode` | String | Y | 비교할 지역 코드 |

  * **Response (Success: 200 OK):** `FranchiseVsLocalResponse` 기반


```json
{
  "brandName": "메가커피",
  "lifespan": {
    "franchiseValue": 48.0,
    "localAverage": 36.0,
    "diffMessage": "평균 대비 오래 생존"
  },
  "initialCost": {
    "franchiseValue": 7000,
    "localAverage": 5000,
    "diffMessage": "초기 비용 높음"
  },
  "risk": {
    "franchiseValue": 15.0,
    "localAverage": 22.5,
    "diffMessage": "폐업률 낮음"
  }
}
```

-----

## 3. 데이터 모델 요약 (ERD Concept)

1.  **Region (지역):** `region_id`, `province`, `district`, `admCode`
2.  **Category (업종):** `category_id`, `name`
3.  **MarketStats (상권 통계):** `stats_id`, `region_id`(FK), `category_id`(FK), `grade`(Enum), `saturationIndex` 등
4.  **Franchise (프랜차이즈):** `franchise_id`, `category_id`(FK), `brandName`, `cost`
5.  **StartupGuide (가이드):** `guide_id`, `category_id`(FK), `content`

-----

## 4. 응답 코드 및 에러 처리 (Common Status Codes)

  * `200 OK`: 요청 성공 및 데이터 반환
  * `400 Bad Request`: 필수 파라미터 누락 (`@NotNull` 검증 실패 등)
  * `404 Not Found`: 해당 지역 코드나 업종 ID에 해당하는 데이터가 없음
  * `500 Internal Server Error`: 서버 로직 오류

