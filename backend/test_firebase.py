import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.firebase_service import get_live_sensor_data

data = get_live_sensor_data()
with open('test_output.json', 'w', encoding='utf-8') as f:
    json.dump(data, f)
