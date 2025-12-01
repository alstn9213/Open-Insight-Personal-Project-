import os
import sys
import time
import requests
import pandas as pd
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from config.database import get_connection

def fetch_store_data():
  conn = get_connection()