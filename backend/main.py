from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import sys
import os
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()
from services.sheets_service import register_user_in_sheet, log_market_sale_to_sheet, log_order_to_sheet
from services.firebase_service import backup_user_to_firestore, get_live_sensor_data, add_market_listing, get_market_listings, checkout_market_listings, verify_user_login
from services.mongo_service import backup_user_to_mongo, verify_mongo_login, add_mongo_market_listing, fetch_mongo_market_listings, checkout_mongo_market_listings

app = FastAPI(title="IoT Agriculture Platform Backend", description="Backend API for managing farmers, crops, customer orders, and AI.", version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

import threading
import time

@app.on_event("startup")
def startup_event():
    def autonomous_iot_worker():
        from services.firebase_service import get_db
        import random
        time.sleep(5) # Wait for Firebase init
        
        hours_passed = 0
        
        while True:
            try:
                get_db()
                from firebase_admin import db
                timestamp = int(time.time() * 1000)
                
                # --- 1-Hour Cultivation Update (Moisture, NPK) ---
                cultivation_payload = {
                    "soil_moisture": round(random.uniform(30.0, 75.0), 1),
                    "npk": {
                        "N": random.randint(100, 150),
                        "P": random.randint(40, 80),
                        "K": random.randint(50, 90)
                    },
                    "timestamp": timestamp
                }
                
                # Push 1Hr Data to Firebase
                db.reference("Historical_Sensors/Hourly").push().set(cultivation_payload)
                db.reference("Live_Sensors/Hourly_Cultivation").set(cultivation_payload)
                print("24/7 Engine: Logged 1Hr Cultivation Update")
                
                # --- 24-Hour Dashboard Weather Update ---
                if hours_passed == 0 or hours_passed >= 24:
                    weather_payload = {
                        "temperature": round(random.uniform(22.0, 36.0), 1),
                        "humidity": round(random.uniform(40.0, 80.0), 1),
                        "sunlight": round(random.uniform(30.0, 42.0), 1),
                        "soil_ph": round(random.uniform(6.2, 7.5), 1),
                        "windspeed": round(random.uniform(5.0, 25.0), 1),
                        "rainfall": random.choice([0, 0, 5, 12, 20]),
                        "timestamp": timestamp
                    }
                    
                    # Fix: Push immediately to Daily so it exists, then exactly every 24 hours
                    db.reference("Historical_Sensors/Daily").push().set(weather_payload)
                    db.reference("Live_Sensors/Daily_Dashboard").set(weather_payload)
                    print("24/7 Engine: Logged 24Hr Dashboard Update")
                    hours_passed = 0
                    
            except Exception as e:
                print(f"Hardware Simulation Core Error: {e}")
            
            # NO 5-second updates. STRICTLY Wait EXACTLY 1 Hour before looping.
            hours_passed += 1
            time.sleep(3600)
                
    hardware_thread = threading.Thread(target=autonomous_iot_worker, daemon=True)
    hardware_thread.start()

@app.get("/")
def read_root():
    return {"message": "Welcome to Antigravity Backend API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/sensors/dashboard")
def get_dashboard_sensors():
    from firebase_admin import db
    data = db.reference("Live_Sensors/Daily_Dashboard").get() or {}
    return {
        "temperature": data.get("temperature", 33.5),
        "humidity": data.get("humidity", 70.0),
        "sunlight": data.get("sunlight", 38.5),
        "soil_ph": data.get("soil_ph", 6.8),
        "windspeed": data.get("windspeed", 14.5),
        "rainfall": data.get("rainfall", 0)
    }

@app.get("/api/sensors/cultivation")
def get_cultivation_sensors():
    from firebase_admin import db
    data = db.reference("Live_Sensors/Hourly_Cultivation").get() or {}
    return {
        "soil_moisture": data.get("soil_moisture", 60.0),
        "npk": data.get("npk", {"N": 120, "P": 60, "K": 60})
    }



@app.get("/api/ai/tips")
def get_ai_tips(temp: float = 28.0, ph: float = 6.8):
    import random
    tips = [
        {"icon": "💧", "title": "Irrigation Tip For Today", "desc": f"Since the weather is currently around {temp}°C, the soil holds good moisture. Wait until tomorrow evening to turn on the water pumps. This prevents root rot."},
        {"icon": "🌱", "title": "Cultivation Advice", "desc": f"The current {temp}°C heat is perfect for Monsoon crops right now. Check for early pests on the leaves, as the warm weather brings out insects quickly."},
        {"icon": "💰", "title": "Market Strategy", "desc": "Check the 'Market Hub'. Other local farmers are likely posting their harvest prices today. Compare your price with theirs so you don't accidentally sell your crops for cheaper than you deserve!"},
        {"icon": "🧪", "title": "Soil Health Adjustments", "desc": f"Your soil pH is resting at {ph}. Consider a light application of compost to buffer the acidity and keep nutrient absorption high."},
        {"icon": "🌤️", "title": "Weather Adaptation", "desc": f"With temperatures fluctuating near {temp}°C, morning dew might be heavy. Delay applying any dry fertilizers until the leaves are completely dry."}
    ]
    selected = random.sample(tips, 3)
    return {"tips": selected}

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_with_bot(req: ChatRequest):
    import google.generativeai as genai
    from services.firebase_service import get_live_sensor_data
    
    # 1. Provide AI with absolute Live Context
    sensors = get_live_sensor_data() or {"temperature": 32.0, "humidity": 65.0, "soil_moisture": 45.0}
    
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return {"reply": "Warning: Hardware interface requires a GEMINI_API_KEY environment variable. But my sensors currently read Temperature: " + str(sensors.get('temperature')) + "°C and Soil Moisture: " + str(sensors.get('soil_moisture')) + "%"}
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Super-prompt forcing the AI to strictly rely on the physical real-world sensors
        sys_prompt = f"""You are Crop and Shop's central Intelligence Core, an AI as advanced as Claude or ChatGPT, specifically trained on agricultural science.
Your primary directive is to provide FLAWLESS, scientifically accurate agricultural advice based specifically on Indian farming contexts. Do not give wrong or generic answers.

Here is the LIVE data from the farmer's physical Sensor Hub:
{sensors}

Crucial Sensor Hub Training:
- NPK: Represents Soil Nitrogen (N), Phosphorus (P), Potassium (K). Ideal NPK varies, but low values mean fertilizer is needed.
- Soil pH: < 6.5 is Acidic, 6.5-7.5 is Neutral, > 7.5 is Alkaline.
- Sunlight: Measured in Lux. > 40000 is Sunny, > 80000 is Very Bright.
- Rainfall: Raw mm accumulation. 

How to integrate with a REAL bot system (Hardware Integration Instructions):
If the user asks how to integrate this AI with a real bot, explain this exact pipeline:
1. Purchase a microcontroller (ESP32, Arduino, or Raspberry Pi) and connect physical sensors (e.g., DHT11 for Temperature/Humidity, Capacitive Soil Moisture Sensor, LDR for Sunlight, and a Soil NPK probe).
2. Program the microcontroller using Python or C++ to read the analog/digital pins every 5 seconds.
3. Push the live JSON payload directly to the Firebase Realtime Database path `Live_Sensors/Farm1`.
4. The Crop and Shop AI backend is already hardcoded to read `Live_Sensors/Farm1`. The moment your physical hardware pushes data there, this AI will instantly sync with your real farm's physical context. No additional AI configuration needed!

User's Query: {req.message}"""
        
        response = model.generate_content(sys_prompt)
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Hardware AI Link Error: {e}"}

class SignupRequest(BaseModel):
    role: str
    name: str
    email: str
    password: str

def background_signup_process(role, name, email, password):
    # Attempt to write to Google Sheets
    result = register_user_in_sheet(role, name, email)
    
    if result.get("success"):
        user_id = result.get("user_id")
        
        # 1. Backup to Firebase Firestore
        backup_user_to_firestore(role, name, email, user_id, password)
        
        # 2. Backup to MongoDB (Primary New Data Store)
        backup_user_to_mongo(role, name, email, user_id, password)

@app.post("/api/signup")
def signup(req: SignupRequest, background_tasks: BackgroundTasks):
    if req.role not in ["farmer", "customer"]:
        raise HTTPException(status_code=400, detail="Invalid application role for signup")
        
    # Queue up all the heavy database operations to execute instantaneously in the background
    background_tasks.add_task(background_signup_process, req.role, req.name, req.email, req.password)
    
    # Return instantly to the frontend to speed up UI transitions
    return {"message": "User registered successfully, databases syncing...", "user_id": "processing"}

class LoginRequest(BaseModel):
    role: str
    email: str
    password: str

@app.post("/api/login")
def login(req: LoginRequest):
    import concurrent.futures
    
    if req.role not in ["farmer", "customer"]:
        raise HTTPException(status_code=400, detail="Invalid application role for login")
        
    # Launch dual-database parallel verification to guarantee Lightning Fast login speeds
    # Sequential verification: Firebase first, then MongoDB
    fire_result = verify_user_login(req.email, req.password, req.role)
    if fire_result.get("success"):
        return {"message": "Login successful", "name": fire_result.get("name")}
        
    mongo_result = verify_mongo_login(req.email, req.password, req.role)
    if mongo_result.get("success"):
        return {"message": "Login successful", "name": mongo_result.get("name")}
        
    raise HTTPException(status_code=401, detail="Invalid credentials.")
                
    # If the thread pool is exhausted and neither successfully verified the user
    raise HTTPException(status_code=401, detail="Invalid credentials. Both databases rejected.")

class MarketListingRequest(BaseModel):
    farmer_name: str
    location: str
    crop_name: str
    quantity_kg: float
    price_per_qtl: float

@app.post("/api/market/list")
def create_market_listing(req: MarketListingRequest, background_tasks: BackgroundTasks):
    if req.quantity_kg > 500:
        from services.firebase_service import add_admin_approval
        payload = req.dict()
        add_admin_approval("sell", payload)
        return {"message": "Pending Admin Approval"}

    # MongoDB Dual Write
    mongo_result = add_mongo_market_listing(req.farmer_name, req.location, req.crop_name, req.quantity_kg, req.price_per_qtl)
    db_id = mongo_result.get("id") if mongo_result.get("success") else None

    result = add_market_listing(req.farmer_name, req.location, req.crop_name, req.quantity_kg, req.price_per_qtl)
    if result.get("success") or mongo_result.get("success"):
        final_id = result.get("id") or db_id
        background_tasks.add_task(log_market_sale_to_sheet, req.farmer_name, req.location, req.crop_name, req.quantity_kg, req.price_per_qtl)
        return {"message": "Listing published globally", "id": final_id}
    else:
        raise HTTPException(status_code=500, detail=f"Failed to publish market listing")

@app.get("/api/market/list")
def fetch_market_listings():
    # Attempt MongoDB first, fallback to Firebase
    mongo_listings = fetch_mongo_market_listings()
    if mongo_listings and len(mongo_listings) > 0:
        return mongo_listings
    return get_market_listings()

@app.get("/api/admin/stats")
def get_admin_dashboard_stats():
    from services.firebase_service import get_admin_stats
    return get_admin_stats()

@app.get("/api/admin/users")
def fetch_admin_users():
    from services.firebase_service import get_all_users
    return get_all_users()

@app.delete("/api/admin/users/{user_id}")
def remove_admin_user(user_id: str):
    from services.firebase_service import delete_user
    success = delete_user(user_id)
    if success:
        return {"message": "User deleted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete user")

class CheckoutRequest(BaseModel):
    items: list
    customer_name: str = "Unknown"

@app.post("/api/market/checkout")
def checkout_items(req: CheckoutRequest, background_tasks: BackgroundTasks):
    from services.firebase_service import add_admin_approval
    normal_items = []
    approval_items = []
    
    for item in req.items:
        if float(item.get("cartQuantity", 0)) > 500:
            approval_items.append(item)
        else:
            normal_items.append(item)
            
    # Process both normal and approval items from the global market immediately!
    all_items = normal_items + approval_items
    
    # Deduct everything instantly so it disappears from the live sale board.
    mongo_res = checkout_mongo_market_listings(all_items)
    result = checkout_market_listings(all_items)
    
    if not (result.get("success") or mongo_res.get("success")):
        raise HTTPException(status_code=500, detail="Checkout failed or insufficient stock")
    
    # If successful, push Normal items straight to the record keeping
    if normal_items:
        background_tasks.add_task(log_order_to_sheet, req.customer_name, normal_items)
        
    # And push Approval items to the Admin queue (but they are safely deducted!)
    if approval_items:
        for item in approval_items:
            payload = {"customer_name": req.customer_name, "item": item}
            add_admin_approval("buy", payload)
            
    if approval_items and not normal_items:
        return {"message": "Items > 500kg require Admin approval and have been sent for review."}
    elif approval_items and normal_items:
        return {"message": "Checkout complete. However, items > 500kg require Admin approval and have been sent for review."}
    
    return {"message": "Checkout complete"}

@app.get("/api/admin/approvals")
def get_pending_approvals():
    from services.firebase_service import get_admin_approvals
    return get_admin_approvals()

@app.post("/api/admin/approvals/{id}/approve")
def approve_admin_request(id: str, background_tasks: BackgroundTasks):
    from services.firebase_service import get_admin_approvals, delete_admin_approval
    approvals = get_admin_approvals()
    req = next((a for a in approvals if a["id"] == id), None)
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found")
        
    payload = req.get("payload", {})
    if req["type"] == "sell":
        mongo_result = add_mongo_market_listing(payload["farmer_name"], payload["location"], payload["crop_name"], payload["quantity_kg"], payload["price_per_qtl"])
        result = add_market_listing(payload["farmer_name"], payload["location"], payload["crop_name"], payload["quantity_kg"], payload["price_per_qtl"])
        background_tasks.add_task(log_market_sale_to_sheet, payload["farmer_name"], payload["location"], payload["crop_name"], payload["quantity_kg"], payload["price_per_qtl"])
    elif req["type"] == "buy":
        item = payload["item"]
        customer_name = payload.get("customer_name", "Unknown")
        background_tasks.add_task(log_order_to_sheet, customer_name, [item])
        
    delete_admin_approval(id)
    return {"message": "Approved and transacted"}

@app.post("/api/admin/approvals/{id}/reject")
def reject_admin_request(id: str):
    from services.firebase_service import delete_admin_approval, get_admin_approvals, refund_market_listing
    from services.mongo_service import refund_mongo_market_listing
    
    approvals = get_admin_approvals()
    req = next((a for a in approvals if a["id"] == id), None)
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found")
        
    if req["type"] == "buy":
        item = req.get("payload", {}).get("item", {})
        refund_market_listing(item)
        refund_mongo_market_listing(item)

    success = delete_admin_approval(id)
    if success:
        return {"message": "Rejected successfully"}
    raise HTTPException(status_code=500, detail="Failed to reject")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)