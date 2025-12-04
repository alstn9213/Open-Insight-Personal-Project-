# [Troubleshooting] 공공데이터 API 연동 실패 및 NO_DATA_ERROR 해결 과정

## 1. 개요 (Overview)

  - 프로젝트: Open Insight (개인 프로젝트)
  - 작업 내용: Python ETL 스크립트를 통해 '소상공인시장진흥공단 상가(상권)정보' API를 호출하여 지역별/업종별 점포 수 데이터를 수집 및 적재.
  - 발생 문제: API 호출 시 `Timeout` 발생, 올바르지 않은 엔드포인트(404), 정상 응답(200)임에도 데이터가 없는 `NO_DATA_ERROR` 등 다단계 이슈 발생.

## 2. 문제 상황 및 분석 (Problem & Analysis)

### 2.1. 초기 연결 실패 (Timeout & Authentication)

  - 증상: `requests.get()` 호출 시 연결 실패 로그 발생.
  - 원인 1: 공공데이터포털 서버 응답 지연으로 인한 타임아웃 발생 (기존 설정: 3초).
  - 원인 2: API Key 인코딩/디코딩 이슈 가능성 점검.

### 2.2. 잘못된 API 엔드포인트 (404 Not Found)

  - 증상: API 호출 시 404 에러 발생 또는 HTML 에러 페이지 리턴.
  - 원인: 구(District) 단위 조회 API(`storeListInDistrict`)가 최신 버전(v2)에서 지원 중단되거나 경로가 변경됨.

### 2.3. NODATA_ERROR (데이터 없음)

  - 증상: HTTP Status Code는 `200 OK`로 정상이나, 응답 바디의 결과 코드가 에러를 반환.
    ```json
    "resultCode": "03",
    "resultMsg": "NO_DATA_ERROR"
    ```
  - 분석:
      - 업종 코드(`indsSclsCd`) 매핑 확인: CSV 파일 기준 정상(`I21201` 등) 확인됨.
      - 요청 파라미터 확인: 행정동 코드(`key`)가 문제일 가능성 제기.
      - Root Cause: 기존에 사용하던 행정동 코드는 10자리(예: 1168064000)였으나, 해당 API는 8자리(예: 11680640) 포맷을 요구함.

## 3. 해결 과정 (Solution)

### Step 1. 연결 안정성 확보

타임아웃 시간을 늘리고, 인증키 로드 방식을 재확인하여 기본 연결을 확보했습니다.

```python
# 변경 전
response = requests.get(API_URL, params=params, timeout=3)

# 변경 후 (10초로 연장)
response = requests.get(API_URL, params=params, timeout=10)
```

### Step 2. API 엔드포인트 변경 (구 단위 → 동 단위)

구 단위 조회가 불가능함에 따라 행정동 단위 조회(`storeListInDong`)로 전략을 수정했습니다.

  - URL 변경: `.../storeListInDistrict` → `.../storeListInDong`
  - 파라미터 변경: `divId="signguCd"` → `divId="adongCd"`

### Step 3. 행정동 코드 포맷 수정 (10자리 → 8자리) [핵심 해결]

행정동 코드 뒤의 `'00'`을 제거하여 API가 요구하는 8자리 포맷으로 DB 데이터를 마이그레이션했습니다.

**[수정 코드: `src/etl/init_data.py`]**

```python
# 기존 (10자리)
# 'adm_code': ['1168064000', '1144066000', ...]

# 수정 (8자리) - 뒤의 00 제거
regions = pd.DataFrame({
    # ...
    'adm_code': [
        '11680640',  # 강남구 역삼1동
        '11440660',  # 마포구 서교동
        '11710710',  # 송파구 잠실6동
        '26350510',  # 해운대구 우1동
        '41135550'   # 성남시 분당구 정자1동
    ]
})
```

**[수정 코드: `src/etl/market_collect.py`]**

```python
params = {
    # ...
    "divId": "adongCd",       # 구(signgu)에서 동(adong)으로 변경
    "key": region['adm_code'], # 8자리 코드가 전달됨
    # ...
}
```

## 4. 최종 결과 (Result)

  - API 응답: `NO_DATA_ERROR`가 사라지고 `totalCount`가 정상적으로 반환됨.
  - 데이터 적재: 실제 공공데이터 기반의 상권 분석 데이터(점포 수 등)가 DB에 성공적으로 적재됨.

## 5. 배운 점 (Lessons Learned)

1.  공공데이터 명세 확인의 중요성: API마다 요구하는 지역 코드 포맷(법정동 vs 행정동, 10자리 vs 8자리)이 다를 수 있음을 인지해야 한다.
2.  단계적 디버깅: 연결(Timeout) → 주소(404) → 데이터(NODATA) 순으로 문제를 좁혀가는 과정이 유효했다.
3.  로그 분석: 단순히 '실패'가 아니라, 200 OK 응답 내부의 `resultCode`를 확인해야 정확한 원인을 파악할 수 있다.


