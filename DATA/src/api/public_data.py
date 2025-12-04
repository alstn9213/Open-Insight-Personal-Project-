import requests
import logging

logger = logging.getLogger(__name__)

"""
공공데이터포털(Data.go.kr) API와 통신을 담당하는 클래스
"""
class PublicDataClient:
  def __init__(self, api_key: str, api_url: str):
    self.api_key = api_key
    self.api_url = api_url
    
    if not self.api_key or not self.api_url:
      logger.warning("API Key 또는 URL이 설정되지 않았습니다. API 호출이 실패할 수 있습니다.")
      
  def fetch_store_count(self, adm_code: str) -> int:
    
    params = {
            "serviceKey": self.api_key,
            "pageNo": 1,
            "numOfRows": 1,        # 개수만 확인하면 되므로 1건만 요청
            "divId": "adongCd",    # 행정동 단위 조회
            "key": adm_code,       # 행정동 코드
            "type": "json"
        }
    
    try:
      response = requests.get(self.api_url, params=params, timeout=10)
      if response.status_code != 200:
        logger.warning(f"API 호출 실패 (Status: {response.status_code}) - AdmCode: {adm_code}")
        return 0
      try:
        data = response.json()
        if "header" in data and data["header"]["resultCode"] != "00":
          error_msg = data['header'].get('resultMsg', 'Unknown Error')
          logger.warning(f"API 결과 에러: {error_msg} (Code: {adm_code})")
          return 0
        if "body" in data and "totalCount" in data["body"]:
          total_count = int(data["body"]["totalCount"])
          logger.info(f"API 조회 성공: {total_count}개 (Code: {adm_code})")
          return total_count
        else:
          logger.debug(f"예상치 못한 응답 구조: {data.keys()}")
          return 0
        
      except ValueError:
        logger.error(f"JSON 파싱 실패. 응답 내용 일부: {response.text[:100]}")
        return 0
    except requests.exceptions.Timeout:
      logger.error(f"API 요청 시간 초과(Timeout) - AdmCode: {adm_code}")
      return 0
    except requests.exceptions.RequestException as e:
      logger.error(f"API 연결 중 치명적 오류 발생: {e}")
      return 0