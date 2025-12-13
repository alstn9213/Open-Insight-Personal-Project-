# 📝 [Troubleshooting] 대량의 공공데이터 수집 시 속도 저하 문제 해결 (Sync vs Async)

## 1. 개요 (Overview)

  * **작업 내용:** Python ETL 스크립트를 통해 서울시 전역(약 425개 행정동)의 업종별 점포 수 데이터를 공공데이터 포털 API로 수집.
  * **발생 문제:** 수집 대상 지역과 업종을 전체로 확장하자, API 호출 횟수가 급증(약 2,000회 이상)하여 데이터 수집에 비현실적인 시간(약 20분 이상)이 소요됨.

## 2. 문제 상황 및 분석 (Problem & Analysis)

### 2.1. 속도 저하 현상

  * 기존에는 테스트를 위해 강남구 등 일부 지역만 수집했으나, 서울시 전체로 범위를 넓히면서 실행 속도가 선형적으로 증가함.
  * 로그 확인 결과, 한 번의 API 요청 후 응답을 받을 때까지 프로그램이 멈춰 있는(Blocking) 시간이 대부분을 차지함.

### 2.2. 원인 분석 (Synchronous I/O)

  * **직렬 처리 방식:** 기존 코드는 `requests` 라이브러리를 사용하여 **"요청 -> 대기 -> 응답 -> 다음 요청"** 순서로 처리함.
  * **Network Bound:** CPU 연산 속도보다 네트워크 응답 속도가 훨씬 느리기 때문에, CPU는 대부분의 시간을 대기(Idle) 상태로 보냄.
  * **예상 소요 시간 산출:**
      * 호출 횟수: 425개 동 $\times$ 5개 업종 $\approx$ 2,125회
      * 회당 평균 응답 속도: 0.5초 가정
      * 총 시간: $2,125 \times 0.5 = 1,062$초 (약 17분) $\rightarrow$ 배치 작업으로 부적합.

## 3. 해결 과정 (Solution)

### Step 1. 비동기(Asynchronous) 라이브러리 도입

Blocking I/O 문제를 해결하기 위해 **Non-blocking I/O**를 지원하는 라이브러리로 교체했습니다.

  * **`requests` $\rightarrow$ `aiohttp`**: 비동기 HTTP 클라이언트 세션을 사용하여 요청을 보내고, 응답을 기다리는 동안 다른 작업을 수행할 수 있게 함.
  * **`asyncio`**: 파이썬의 비동기 프로그래밍을 위한 표준 라이브러리 활용.

### Step 2. 동시성 제어 (Semaphore) 적용 [핵심]

단순히 모든 요청을 동시에 보내면(`asyncio.gather`), 수천 개의 요청이 한꺼번에 몰려 **공공데이터 포털 서버에서 차단(Connection Refused)하거나 429 Error(Too Many Requests)**가 발생할 위험이 있습니다.
이를 방지하기 위해 **`asyncio.Semaphore`**를 사용하여 동시 실행 가능한 작업 수를 제한했습니다.

**[수정 코드 예시: `src/etl/market_collect.py`]**

```python
# 세마포어를 통해 동시에 실행되는 요청 수를 5개로 제한
semaphore = asyncio.Semaphore(5)

async def process_single_category(session, semaphore, ...):
    async with semaphore: # 슬롯 획득 (꽉 차면 대기)
        # API 호출 (비동기)
        response = await session.get(url, params=params)
        # ... 데이터 처리 ...
```

### Step 3. 전체 로직의 비동기화

  * `fetch_store_count` 함수에 `async/await` 키워드를 적용.
  * 메인 실행부에서 `asyncio.run()`을 통해 이벤트 루프 실행.

## 4. 최종 결과 (Result)

  * **성능 향상:** 기존 직렬 처리 대비 속도가 **약 10배 이상 향상**됨.
      * 변경 전 (예상): 약 17분 ~ 20분
      * 변경 후 (실측): **약 1분 내외**
  * **안정성:** 세마포어를 통해 요청 부하를 조절함으로써 API 호출 실패율을 최소화함.

## 5. 배운 점 (Lessons Learned)

1.  **I/O Bound 작업의 최적화:** 네트워크 통신이나 DB 조회처럼 대기 시간이 긴 작업은 멀티스레딩이나 비동기 처리가 필수적임을 체감함.
2.  **Rate Limiting의 중요성:** 무조건 빠르다고 좋은 것이 아니며, 외부 API를 사용할 때는 상대 서버의 부하를 고려하여 **Throttling(유량 제어)**을 구현해야 함을 배움.
3.  **복잡성 증가:** 비동기 코드는 흐름을 파악하기 어렵고 디버깅이 까다롭지만, 대량의 데이터 처리에서는 그만큼의 가치가 있음.