import random
import logging
from src.config.constants import (
  BASE_SALES, HIGH_SALES_THRESHOLD, SALES_VARIATION_MIN, SALES_VARIATION_MAX,
  GROWTH_RATE_MIN, GROWTH_RATE_MAX, CLOSING_RATE_MIN, CLOSING_RATE_MAX,
  HIGH_RISK_FACTOR, GRADE_GREEN_THRESHOLD, GRADE_RED_THRESHOLD
)

logger = logging.getLogger(__name__)

class MarketMetricsCalculator:
  """
  상권 데이터의 파생 지표(매출, 성장률, 등급 등)를 계산하는 클래스입니다.
  순수 비즈니스 로직만 포함하며, DB나 외부 API에 의존하지 않습니다.
  """
  def calculate(self, store_count: int) -> dict:
    """
    점포 수를 기반으로 각종 상권 지표를 계산하여 반환합니다.
    
    :param store_count: API에서 조회한 실제 점포 수
    :return: 계산된 지표들이 담긴 딕셔너리
    """
    
    final_store_count = store_count
    is_simulated = False
    
    if final_store_count <= 0:
      final_store_count = random.randint(50, 500)
      is_simulated = True
      logger.debug(f"데이터 없음. 시뮬레이션 값 사용: {final_store_count}")
    
    # 점포 수가 많을수록 경쟁으로 인해 평균 매출이 감소하는 경향을 반영
    competition_factor = final_store_count / 1000.0
    random_variation = random.uniform(self.SALES_VARIATION_MIN, self.SALES_VARIATION_MAX)
    
    average_sales = int(
      (self.BASE_SALES * random_variation) - (competition_factor * 5_000_000)
    )
    
    growth_rate = int(
      (self.BASE_SALES * random_variation) - (competition_factor * 5_000_000)
    )
    
    # 폐업률 (Closing Rate) 생성
    # 매출이 기준(4천만원)보다 낮으면 폐업 위험도를 높게(가중치) 설정
    risk_factor = 1.0
    if average_sales <= self.HIGH_SALES_THRESHOLD:
      risk_factor = self.HIGH_RISK_FACTOR
      
    closing_rate = round(
      round.uniform(self.CLOSING_RATE_MIN, self.CLOSING_RATE_MAX) * risk_factor, 2
    )
    
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
    
  def _determine_grade(self, net_growth_rate: float) -> str: # 내부 메서드는 메서드명 앞에 _을 붙인다.
    """
    순성장률에 따라 상권의 등급을 결정합니다. (내부 메서드)
    """
    if net_growth_rate >= 3.0:
        return "GREEN"   # 성장/추천
    elif net_growth_rate <= -1.0:
        return "RED"     # 쇠퇴/위험
    else:
        return "YELLOW"  # 정체/주의