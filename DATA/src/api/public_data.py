import aiohttp
import requests
import logging
import asyncio

logger = logging.getLogger(__name__)

class PublicDataClient:

  def __init__(self, public_api_key: str, public_api_url: str, seoul_api_key: str, seoul_api_url: str):
    self.public_api_key = public_api_key
    self.public_api_url = public_api_url
    self.seoul_api_key = seoul_api_key
    self.seoul_api_url = seoul_api_url

  async def fetch_store_count(self, session: aiohttp.ClientSession, adm_code: str, category_code: str = None) -> int:
    params = {
      "serviceKey": self.public_api_key,
      "pageNo": 1,
      "numOfRows": 1,
      "divId": "adongCd",
      "key": adm_code,
      "type": "json"
    }

    # 공공데이터 상권정보 API에서 소분류 코드를 사용하는 파라미터 키: indsSclsCd
    if category_code:
      params["indsSclsCd"] = category_code

    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
      try:
        async with session.get(self.public_api_url, params=params, timeout=10) as response:
          if response.status == 200:
            try:
              # content_type=None은 가끔 공공데이터가 text/html로 줄 때 에러 방지
              data = await response.json(content_type=None) # json()도 비동기 메서드
              if "body" in data and "totalCount" in data["body"]:
                return int(data["body"]["totalCount"])
              else:
                return 0 # 200 이지만 데이터 바디가 없는 경우
            except Exception:
              pass # JSON 파싱에러 등 무시
            return 0 # 성공했으나 데이터 파싱 실패 등
        logger.warning(f"업종 카테고리 API 호출 결과 데이터 없음 (Code: {response.status}, Adm: {adm_code})")
        return 0
      
      except Exception as e:
        logger.error(f"상가 정보 조회 실패: {e}")
        return 0

  # 서울시 인구 데이터는 한 번만 호출하므로 requests 써도 무방
  # 통일성때문에 async 권장하긴 함
  def fetch_seoul_population(self) -> dict:
    request_url = f"{self.seoul_api_url}/{self.seoul_api_key}/json/SPOP_LOCAL_RESD_DONG/1/1000/"
    pop_map = {}
    try:
      response = requests.get(request_url, timeout=10)
      data = response.json()

      if "SPOP_LOCAL_RESD_DONG" in data:
        rows = data["SPOP_LOCAL_RESD_DONG"]["row"]
        for row in rows:
          code = str(row["ADSTRD_CODE_SE"]) # ADSTRD_CODE_SE: 행정동코드
          total_pop = int(float(row["TOT_LVPOP_CO"]))
          male_pop = int(float(row["MALE_LVPOP_CO"]))
          female_pop = int(float(row["FEMALE_LVPOP_CO"]))
          age_map = {
            "10대": int(float(row.get("AGE_10_19_LVPOP_CO", 0))),
            "20대": int(float(row.get("AGE_20_29_LVPOP_CO", 0))),
            "30대": int(float(row.get("AGE_30_39_LVPOP_CO", 0))),
            "40대": int(float(row.get("AGE_40_49_LVPOP_CO", 0))),
            "50대": int(float(row.get("AGE_50_59_LVPOP_CO", 0))),
            "60대이상": int(float(row.get("AGE_60_69_LVPOP_CO", 0))) + int(float(row.get("AGE_70_ABOVE_LVPOP_CO", 0)))
          }
          main_age_group = max(age_map, key=age_map.get) # 인구수가 가장 많은 연령대
          pop_map[code] = {
              "total": total_pop,
              "male": male_pop,
              "female": female_pop,
              "main_age_group": main_age_group
          }
        logger.info(f"서울 생활 인구 데이터 {len(pop_map)}개 로드 완료")
      else:
        logger.warning("서울 생활인구 데이터 응답 형식이 올바르지 않습니다.")

    except Exception as e:
      logger.error(f"서울 생활 인구 API 호출 에러: {e}")

    return pop_map
        