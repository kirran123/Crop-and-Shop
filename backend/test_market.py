import requests
payload = {
    "farmer_name": "Test",
    "location": "TestCity",
    "crop_name": "Tomato",
    "quantity_kg": 100,
    "price_per_qtl": 2000
}
try:
    res = requests.post("http://localhost:8000/api/market/list", json=payload)
    print("STATUS:", res.status_code)
    print("BODY:", res.text)
except Exception as e:
    print("ERROR:", e)
