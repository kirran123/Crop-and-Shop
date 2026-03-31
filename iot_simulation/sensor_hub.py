"""
=============================================================
  SMART FARM SENSOR HUB  —  Firebase Integrated Version
=============================================================
"""

import sys
import os
import time
import json
from datetime import datetime
import random, math

# 🔥 Firebase imports
import firebase_admin
from firebase_admin import credentials, db


# ---------------------------------------------------------------------------
# 🔥 FIREBASE INITIALIZATION (EDIT THIS PATH + URL)
# ---------------------------------------------------------------------------
cred = credentials.Certificate("../backend/firebase-adminsdk.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://antigravity-farm-default-rtdb.asia-southeast1.firebasedatabase.app/'
})


# ── 1. Soil Moisture ──────────────────────────────────────────────────────
class SoilMoistureSensor:
    def __init__(self): self._v = random.uniform(30, 70)
    def read(self):
        self._v = max(0, min(100, self._v + random.gauss(0, 1)))
        return round(self._v, 2)
    def status(self):
        if self._v < 25: return "DRY"
        if self._v < 45: return "LOW"
        if self._v < 70: return "OPTIMAL"
        if self._v < 85: return "MOIST"
        return "WET"


# ── 2. Temperature ────────────────────────────────────────────────────────
class TemperatureSensor:
    def read(self):
        return round(25 + random.gauss(0, 2), 2)


# ── 3. Rainfall ───────────────────────────────────────────────────────────
class RainfallSensor:
    def __init__(self):
        self._cumul = 0
    def read(self):
        rain = random.choice([0, 0, 0, 2, 5])
        self._cumul += rain
        return rain
    def cumulative(self): return self._cumul
    def classify(self):
        if self._cumul == 0: return "NO_RAIN"
        if self._cumul < 5: return "LIGHT"
        return "HEAVY"


# ── 4. Soil pH ────────────────────────────────────────────────────────────
class SoilPHSensor:
    def __init__(self): self._ph = random.uniform(6, 7)
    def read(self): return round(self._ph + random.gauss(0, 0.1), 2)
    def classify(self):
        if self._ph < 6.5: return "ACIDIC"
        if self._ph < 7: return "NEUTRAL"
        return "ALKALINE"


# ── 5. Humidity ───────────────────────────────────────────────────────────
class HumiditySensor:
    def read(self): return round(random.uniform(40, 80), 2)
    def classify(self):
        return "GOOD"


# ── 6. Sunlight ───────────────────────────────────────────────────────────
class SunlightSensor:
    def read(self): return random.randint(1000, 100000)
    def classify(self, lux):
        if lux > 80000: return "BRIGHT"
        if lux > 40000: return "SUNNY"
        return "LOW"


# ── 7. Wind Speed ─────────────────────────────────────────────────────────
class WindSpeedSensor:
    def read(self): return round(random.uniform(0, 30), 2)
    def direction(self): return random.choice(["N","S","E","W"])
    def beaufort(self): return "Moderate"


# ── 8. NPK Sensor ─────────────────────────────────────────────────────────
class NPKSensor:
    def read(self):
        return random.randint(100,200), random.randint(40,100), random.randint(100,200)


# ===========================================================================
# SENSOR HUB
# ===========================================================================

class SensorHub:

    def __init__(self):
        self.sensors = {
            "soil_moisture": SoilMoistureSensor(),
            "temperature":   TemperatureSensor(),
            "rainfall":      RainfallSensor(),
            "soil_ph":       SoilPHSensor(),
            "humidity":      HumiditySensor(),
            "sunlight":      SunlightSensor(),
            "wind_speed":    WindSpeedSensor(),
            "npk":           NPKSensor(),
        }

    def read_all(self):
        sm = self.sensors["soil_moisture"]
        rf = self.sensors["rainfall"]
        ph = self.sensors["soil_ph"]
        hum = self.sensors["humidity"]
        sl = self.sensors["sunlight"]
        wnd = self.sensors["wind_speed"]
        npk = self.sensors["npk"]

        lux = sl.read()
        N, P, K = npk.read()

        return {
            "timestamp": datetime.now().isoformat(),
            "soil_moisture": sm.read(),
            "soil_status": sm.status(),
            "temperature": self.sensors["temperature"].read(),
            "rainfall": rf.read(),
            "rain_type": rf.classify(),
            "humidity": hum.read(),
            "sunlight": lux,
            "sunlight_type": sl.classify(lux),
            "wind_speed": wnd.read(),
            "wind_dir": wnd.direction(),
            "soil_ph": ph.read(),
            "ph_type": ph.classify(),
            "npk": {"N": N, "P": P, "K": K}
        }

    # 🔥 STREAM + FIREBASE PUSH
    def stream(self, interval=5):
        ref = db.reference("Live_Sensors/Farm1")

        while True:
            data = self.read_all()

            # 🔥 Send to Firebase
            try:
                ref.set(data)
                print("✅ Data sent to Firebase")
            except Exception as e:
                print("❌ Firebase Error:", e)

            # Print locally
            print(json.dumps(data, indent=2))

            time.sleep(interval)


# ===========================================================================
# MAIN
# ===========================================================================

if __name__ == "__main__":
    hub = SensorHub()

    print("\n🚀 Starting Smart Farm Sensor Hub...\n")

    try:
        hub.stream()
    except KeyboardInterrupt:
        print("\nStopped by user")