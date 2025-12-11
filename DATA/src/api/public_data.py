import requests
import logging

logger = logging.getLogger(__name__)

class PublicDataClient:
  def __init__(self, public_api_key: str, public_api_url: str, seoul_api_key: str, seoul_api_url: str):
    self.public_api_key = public_api_key
    self.public_api_url = public_api_url
        
    self.seoul_api_key = seoul_api_key
    self.seoul_api_url = seoul_api_url

  def fetch_store_count(self, adm_code: str) -> int:
    params = {
      "serviceKey": self.public_api_key,
      "pageNo": 1,
      "numOfRows": 1,
      "divId": "adongCd",
      "key": adm_code,
      "type": "json"
    }
    try:
      response = requests.get(self.public_api_url, params=params, timeout=10)
      if response.status_code == 200:
        data = response.json()
        if "body" in data and "totalCount" in data["body"]:
          return int(data["body"]["totalCount"])
        return 0
    except Exception as e:
      logger.error(f"상가 정보 조회 실패: {e}")
      return 0
    
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
          pop = float(row["TOT_LVPOP_CO"]) # TOT_LVPOP_CO: 총생활인구수
          pop_map[code] = int(pop)
        logger.info(f"서울 생활 인구 데이터 {len(pop_map)}개 로드 완료")
      else:
        logger.warning("서울 생활인구 데이터 응답 형식이 올바르지 않습니다.")

    except Exception as e:
      logger.error(f"서울 생활 인구 API 호출 에러: {e}")

    return pop_map
        