import sys
import os
sys.path.append(r"c:\Users\kishore ST\Desktop\farmer\backend")
from services.firebase_service import get_live_sensor_data

print("Fetching data from Firebase RTDB...")
data = get_live_sensor_data()
print("Data:", data)
