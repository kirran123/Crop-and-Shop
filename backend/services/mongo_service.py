import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# The URI likely needs URL encoding for special characters like `@` or formatting `<` `>`
raw_uri = os.getenv("MONGO_URI", "")

# Clean up common user formatting mistakes in connection strings
if "<" in raw_uri and ">" in raw_uri:
    raw_uri = raw_uri.replace("<", "").replace(">", "")
if "kirran@123" in raw_uri:
    # URL encode the @ symbol in the password segment before the cluster `@`
    # mongodb+srv://kirran:kirran@123@farm... -> mongodb+srv://kirran:kirran%40123@farm...
    parts = raw_uri.split("@")
    if len(parts) >= 3:
        # e.g., ['mongodb+srv://kirran:kirran', '123', 'farm...']
        # Reconstruct safely
        raw_uri = raw_uri.replace("kirran@123", "kirran%40123")

client = None
db = None

def get_mongo_db():
    global client, db
    if client is None and raw_uri:
        try:
            client = MongoClient(raw_uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=2000)
            db = client["farm_hub"]
            print("Successfully connected to MongoDB Atlas")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return None
    return db

def backup_user_to_mongo(role, name, email, user_id, password=""):
    db = get_mongo_db()
    if db is None: return False
    
    try:
        users_col = db["Users"]
        users_col.update_one(
            {"email": email},
            {"$set": {
                "user_id": user_id,
                "name": name,
                "email": email,
                "role": role,
                "status": "Active",
                "password": password
            }},
            upsert=True
        )
        return True
    except Exception as e:
        print(f"MongoDB Backup Error (Users): {e}")
        return False

def verify_mongo_login(email, password, role):
    db = get_mongo_db()
    if db is None: return {"success": False, "error": "Database not initialized"}
    
    try:
        users_col = db["Users"]
        user = users_col.find_one({"email": email, "role": role})
        if not user:
            return {"success": False, "error": "Account not found for this email and role."}
            
        stored_password = user.get("password")
        if stored_password and stored_password != password:
            return {"success": False, "error": "Invalid password."}
            
        return {"success": True, "name": user.get("name", "User")}
    except Exception as e:
        print(f"MongoDB Login Error: {e}")
        return {"success": False, "error": "Server error during login."}

def add_mongo_market_listing(farmer_name, location, crop_name, kg, price_per_qtl):
    db = get_mongo_db()
    if db is None: return {"success": False, "error": "Database not initialized"}
    
    try:
        import time
        listings_col = db["Market_Sales"]
        doc = {
            "farmer_name": farmer_name,
            "location": location,
            "crop_name": crop_name,
            "quantity_kg": kg,
            "price_per_qtl": price_per_qtl,
            "timestamp": int(time.time() * 1000)
        }
        result = listings_col.insert_one(doc)
        return {"success": True, "id": str(result.inserted_id)}
    except Exception as e:
        print(f"MongoDB Add Listing Error: {e}")
        return {"success": False, "error": str(e)}

def fetch_mongo_market_listings():
    db = get_mongo_db()
    if db is None: return []
    
    try:
        listings_col = db["Market_Sales"]
        results = []
        for doc in listings_col.find().sort("timestamp", -1):
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            results.append(doc)
        return results
    except Exception as e:
        print(f"MongoDB Fetch Listings Error: {e}")
        return []

def checkout_mongo_market_listings(cart_items):
    db = get_mongo_db()
    if db is None: return {"success": False, "error": "Database not initialized"}
    
    try:
        from bson.objectid import ObjectId
        listings_col = db["Market_Sales"]
        
        for item in cart_items:
            item_id = item.get("id")
            purchased_qty = float(item.get("cartQuantity", 0))
            if not item_id or purchased_qty <= 0:
                continue
                
            try:
                obj_id = ObjectId(item_id)
            except:
                continue # Skip invalid IDs
                
            current_doc = listings_col.find_one({"_id": obj_id})
            if current_doc and "quantity_kg" in current_doc:
                current_qty = float(current_doc["quantity_kg"])
                new_qty = max(0.0, current_qty - purchased_qty)
                if new_qty > 0:
                    listings_col.update_one({"_id": obj_id}, {"$set": {"quantity_kg": new_qty}})
                else:
                    listings_col.delete_one({"_id": obj_id})
                    
        return {"success": True}
    except Exception as e:
        print(f"MongoDB Checkout Error: {e}")
        return {"success": False, "error": str(e)}

def refund_mongo_market_listing(item):
    db = get_mongo_db()
    if db is None: return False
    
    try:
        from bson.objectid import ObjectId
        listings_col = db["Market_Sales"]
        item_id = item.get("id")
        refund_qty = float(item.get("cartQuantity", 0))
        if not item_id or refund_qty <= 0: return False
        
        try:
            obj_id = ObjectId(item_id)
        except:
            return False
            
        current_doc = listings_col.find_one({"_id": obj_id})
        if current_doc and "quantity_kg" in current_doc:
            current_qty = float(current_doc["quantity_kg"])
            listings_col.update_one({"_id": obj_id}, {"$set": {"quantity_kg": current_qty + refund_qty}})
        else:
            restored_item = item.copy()
            restored_item["quantity_kg"] = refund_qty
            if "cartQuantity" in restored_item: del restored_item["cartQuantity"]
            if "id" in restored_item: del restored_item["id"]
            restored_item["_id"] = obj_id
            listings_col.insert_one(restored_item)
            
        return True
        
    except Exception as e:
        print(f"MongoDB Refund Error: {e}")
        return False
