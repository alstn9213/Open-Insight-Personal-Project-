# 1. 공공데이터 API 관련 상수
# 업종별 코드 매핑 (공공데이터포털 분류 기준)
CATEGORY_CODES = {
    "카페": "I21201",
    "치킨": "I21006",
    "편의점": "G20405",
    "미용실": "S20701"
}

# 2. 상권 지표 계산용 상수 (Calculator)
# 매출 관련
BASE_SALES = 40_000_000         # 기준 월 매출 (4천만원)
HIGH_SALES_THRESHOLD = 40_000_000 # 고매출 기준점 (폐업률 가중치 적용 기준)
SALES_VARIATION_MIN = 0.7       # 매출 변동 최소폭
SALES_VARIATION_MAX = 1.8       # 매출 변동 최대폭

# 성장률 관련 (%)
GROWTH_RATE_MIN = -5.0
GROWTH_RATE_MAX = 15.0

# 폐업률 관련 (%)
CLOSING_RATE_MIN = 0.5
CLOSING_RATE_MAX = 5.0
HIGH_RISK_FACTOR = 2.5          # 매출이 낮을 때 적용할 폐업 위험 가중치

# 등급 산정 기준 (순성장률), THRESHOLD: 방지턱
GRADE_GREEN_THRESHOLD = 3.0     # 이 이상이면 GREEN
GRADE_RED_THRESHOLD = -1.0      # 이 이하면 RED