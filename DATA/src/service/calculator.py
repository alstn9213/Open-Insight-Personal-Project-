import logging
from src.config.constants import (
  OPPORTUNITY_THRESHOLD ,
  OVERCROWDED_THRESHOLD
)

logger = logging.getLogger(__name__)

class MarketMetricsCalculator:
 
  def calculate(self, store_count: int, floating_pop: int) -> dict:
  
    # 0으로 나누는 걸 방지하는 임시 점포 수
    temp_store_count = max(store_count, 1) 
    pop_per_store = round(floating_pop / temp_store_count, 2)
    market_grade = self._determine_grade(pop_per_store)

    return {
       "store_count": store_count,
       "floating_population": floating_pop,
       "population_per_store": pop_per_store,
       "market_grade": market_grade
    }
  
  # 내부 메서드는 메서드명 앞에 _을 붙인다
  def _determine_grade(self, pop_per_store: float) -> str: 
    if pop_per_store >= OPPORTUNITY_THRESHOLD:
        return "GREEN"  
    elif pop_per_store <= OVERCROWDED_THRESHOLD:
        return "RED"    
    else:
        return "YELLOW" 