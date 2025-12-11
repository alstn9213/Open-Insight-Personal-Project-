import pandas as pd
import os

def load_category_map():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.abspath(os.path.join(current_dir, "../../resources/category_code.csv"))

    if not os.path.exists(csv_path):
        print(f"파일을 찾을 수 없습니다: {csv_path}")
        return {}
    
    try:
        try:
            df = pd.read_csv(csv_path, encoding="cp949")
        except UnicodeDecodeError:
            df = pd.read_csv(csv_path, encoding="utf-8")
        return dict(zip(df["소분류명"], df["소분류코드"]))
    
    except Exception as e:
        print(f"업종 코드 파일 로드 실패: {e}")
        return {}