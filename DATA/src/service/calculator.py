import random
import logging
from src.config.constants import (GRADE_GREEN_THRESHOLD, GRADE_RED_THRESHOLD)

logger = logging.getLogger(__name__)

class MarketMetricsCalculator:
 
  def calculate(self, store_count: int, floating_pop: int, category_name: str) -> dict:
  
    # 점포 수 보정 (0이면 최소값 부여)
    final_store_count = store_count if store_count > 0 else random.randint(10, 50)
    is_simulated = False
    
    # 점포수 데이터가 없으면 시뮬레이션값 사용
    if store_count <= 0:
      is_simulated = True
      logger.debug(f"점포 데이터 없음. 시뮬레이션 값 사용: {final_store_count}")
    
    # 업종별 유동인구 의존도 (가중치) 설정
    if category_name in ["카페", "편의점"]:
       pop_weight = 0.8 # 유동인구 수에 민감한 업종
    else:
       pop_weight = 0.5 # 덜 민감한 업종

    # 유효 수요 = 유동인구 * 업종 가중치
    potential_customers = floating_pop * pop_weight 
    # 점포당 파이(손님 수) = 전체 수요 / 경쟁 점포 수
    customers_per_store = potential_customers / max(final_store_count, 1)

    # 예상 매출
    # 객단가 15,000원 가정 * 일일 손님 수 * 30일
    base_sales = customers_per_store * 15000 * 30
    # 변동성(0.8 ~ 1.2배)으로 수치 분산
    random_variation = random.uniform(0.8, 1.2)  
    # 매출 최소 100만원 보장
    average_sales = int(
      max((base_sales * random_variation), 1_000_000)
    )

    if average_sales > 50_000_000:
      growth_rate = round(random.uniform(3.0, 10.0), 2)
      closing_rate = round(random.uniform(0.0, 1.5), 2)
    elif average_sales > 20_000_000:
      growth_rate = round(random.uniform(-1.0, 5.0), 2)
      closing_rate = round(random.uniform(1.0, 3.0), 2)
    else: # 매출 저조 (위험)
      growth_rate = round(random.uniform(-5.0, 1.0), 2)
      closing_rate = round(random.uniform(3.0, 8.0), 2)

    net_growth_rate = round(growth_rate - closing_rate, 2)
    market_grade = self._determine_grade(net_growth_rate)
    
    return {
      "store_count": final_store_count,
      "average_sales": average_sales,
      "growth_rate": growth_rate,
      "closing_rate": closing_rate,
      "net_growth_rate": net_growth_rate,
      "market_grade": market_grade,
      "is_simulated": is_simulated
    }
  
  # 내부 메서드는 메서드명 앞에 _을 붙인다
  def _determine_grade(self, net_growth_rate: float) -> str: 
    if net_growth_rate >= GRADE_GREEN_THRESHOLD:
        return "GREEN"   # 성장/추천
    elif net_growth_rate <= GRADE_RED_THRESHOLD:
        return "RED"     # 쇠퇴/위험
    else:
        return "YELLOW"  # 정체/주의