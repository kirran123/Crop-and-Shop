import firebase_admin
from firebase_admin import credentials, firestore, db
import os

creds_path = os.path.join(os.path.dirname(__file__), "..", "firebase-adminsdk.json")
DB_URL = "https://antigravity-farm-default-rtdb.asia-southeast1.firebasedatabase.app/"

# Try dynamic initialization instead of just on app load
def get_db():
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred, {'databaseURL': DB_URL})
        return firestore.client()
    except Exception as e:
        print(f"Warning: Failed to initialize Firebase: {e}")
        return None

def backup_user_to_firestore(role, name, email, user_id, password=""):
    """ Backs up the user from Google Sheets directly to Firestore """
    db = get_db()
    if not db:
        print("Skipping Firestore backup because Firebase client isn't initialized.")
        return False
        
    try:
        doc_ref = db.collection('Users').document(user_id)
        doc_ref.set({
            'name': name,
            'email': email,
            'role': role,
            'status': 'Active',
            'password': password
        })
        print(f"User {user_id} securely backed up to Firebase Firestore.")
        log_system_activity("New User Account", "Success", f"A new {role.lower()} joined the community: {name}")
        return True
    except Exception as e:
        print(f"Error backing up to Firestore: {e}")
        return False

def verify_user_login(email, password, role):
    """ Validates login credentials against Firestore """
    db_fs = get_db()
    if not db_fs: 
        return {"success": False, "error": "Database not initialized"}
        
    try:
        # Search for user by email and role
        users_ref = db_fs.collection("Users")
        query = users_ref.where("email", "==", email).where("role", "==", role).limit(1)
        results = query.stream()
        
        user_doc = None
        for doc in results:
            user_doc = doc.to_dict()
            user_doc['id'] = doc.id
            break
            
        if not user_doc:
            return {"success": False, "error": "Account not found for this email and role."}
            
        # Verify password (Fallback check if old accounts don't have password, though unlikely in a new rollout)
        stored_password = user_doc.get("password")
        if stored_password and stored_password != password:
            return {"success": False, "error": "Invalid password."}
        
        return {"success": True, "name": user_doc.get("name", "User")}
        
    except Exception as e:
        print(f"Error verifying login: {e}")
        return {"success": False, "error": "Server error during login."}

def log_system_activity(event_type, status, detail):
    get_db()
    try:
        ref = db.reference("Activity_Feed")
        import time
        ref.push().set({
            "type": event_type,
            "status": status,
            "detail": detail,
            "timestamp": int(time.time() * 1000)
        })
        
        # Fire off Google Sheets backup in a non-blocking background thread
        import threading
        from services.sheets_service import log_admin_activity_to_sheet
        threading.Thread(target=log_admin_activity_to_sheet, args=(event_type, status, detail), daemon=True).start()
        
    except Exception as e:
        print(f"Activity Sync Error: {e}")

def get_live_sensor_data():
    """ Fetch the latest frame from Firebase Realtime DB """
    get_db() # ensure initialized
    try:
        ref = db.reference("Live_Sensors/Farm1")
        data = ref.get()
        if data:
            return data
        
        return None
    except Exception as e:
        print(f"Firebase Error reading sensors: {e}")
        return None

def add_market_listing(farmer_name, location, crop_name, kg, price_per_qtl):
    get_db() # ensure initialized
    try:
        ref = db.reference("Market_Sales")
        new_listing_ref = ref.push()
        import time
        listing_data = {
            "farmer_name": farmer_name,
            "location": location,
            "crop_name": crop_name,
            "quantity_kg": kg,
            "price_per_qtl": price_per_qtl,
            "timestamp": int(time.time() * 1000)
        }
        new_listing_ref.set(listing_data)
        log_system_activity("Crop Listing", "Success", f"{farmer_name} posted {kg}Kg of {crop_name}")
        return {"success": True, "id": new_listing_ref.key}
    except Exception as e:
        print(f"Error adding market listing: {e}")
        return {"success": False, "error": str(e)}

def get_market_listings():
    get_db() # ensure initialized
    try:
        ref = db.reference("Market_Sales")
        listings = ref.get()
        result = []
        if listings:
            for key, val in listings.items():
                if isinstance(val, dict):
                    val['id'] = key
                    result.append(val)
        return sorted(result, key=lambda x: x.get('timestamp', 0), reverse=True)
    except Exception as e:
        print(f"Error fetching market listings: {e}")
        return []

def add_admin_approval(approval_type, payload):
    get_db()
    try:
        ref = db.reference("Admin_Approvals")
        new_ref = ref.push()
        import time
        doc = {
            "type": approval_type,            # "sell" or "buy"
            "status": "pending",
            "payload": payload,               # Contains item details, farmer_name, price, or cart items
            "timestamp": int(time.time() * 1000)
        }
        new_ref.set(doc)
        log_system_activity("Admin Approval Reqt", "Warning", f"A {approval_type.upper()} request > 500kg requires administrative override.")
        return {"success": True, "id": new_ref.key}
    except Exception as e:
        print(f"Error adding admin approval: {e}")
        return {"success": False, "error": str(e)}

def get_admin_approvals():
    get_db()
    try:
        ref = db.reference("Admin_Approvals")
        approvals = ref.get()
        result = []
        if approvals:
            for key, val in approvals.items():
                if isinstance(val, dict):
                    val['id'] = key
                    result.append(val)
        return sorted(result, key=lambda x: x.get('timestamp', 0), reverse=True)
    except Exception as e:
        print(f"Error fetching admin approvals: {e}")
        return []

def delete_admin_approval(approval_id):
    get_db()
    try:
        db.reference("Admin_Approvals").child(approval_id).delete()
        return True
    except Exception as e:
        print(f"Error deleting admin approval: {e}")
        return False


def checkout_market_listings(cart_items):
    get_db()
    try:
        ref = db.reference("Market_Sales")
        for item in cart_items:
            item_id = item.get("id")
            purchased_qty = float(item.get("cartQuantity", 0))
            if not item_id or purchased_qty <= 0:
                continue
            item_ref = ref.child(item_id)
            current_data = item_ref.get()
            if current_data and isinstance(current_data, dict) and "quantity_kg" in current_data:
                current_qty = float(current_data["quantity_kg"])
                new_qty = max(0.0, current_qty - purchased_qty)
                if new_qty > 0:
                    item_ref.update({"quantity_kg": new_qty})
                else:
                    item_ref.delete()
                    
            # Log purchase activity
            c_name = current_data.get('crop_name', 'Crops') if current_data else 'Crops'
            f_name = current_data.get('farmer_name', 'Farmer') if current_data else 'Farmer'
            log_system_activity("Market Purchase", "Success", f"A customer securely checked out {purchased_qty}Kg of {c_name} from {f_name}")
            
        return {"success": True}
    except Exception as e:
        print(f"Error processing checkout: {e}")
        return {"success": False, "error": str(e)}

def refund_market_listing(item):
    get_db()
    try:
        ref = db.reference("Market_Sales")
        item_id = item.get("id")
        refund_qty = float(item.get("cartQuantity", 0))
        if not item_id or refund_qty <= 0: return False
        
        item_ref = ref.child(item_id)
        current_data = item_ref.get()
        if current_data and isinstance(current_data, dict) and "quantity_kg" in current_data:
            current_qty = float(current_data["quantity_kg"])
            item_ref.update({"quantity_kg": current_qty + refund_qty})
        else:
            # It was entirely deleted previously, so we recreate it
            restored_item = item.copy()
            restored_item["quantity_kg"] = refund_qty
            if "cartQuantity" in restored_item: del restored_item["cartQuantity"]
            if "id" in restored_item: del restored_item["id"]
            item_ref.set(restored_item)
            
        log_system_activity("Market Refund", "Warning", f"Admin rejected a purchase. {refund_qty}Kg restored.")
        return True
    except Exception as e:
        print(f"Error restoring admin rejection: {e}")
        return False

def get_admin_stats():
    db_fs = get_db()
    if not db_fs: 
        return {"farmers": 0, "customers": 0, "marketValue": 0, "history": []}
    
    try:
        # Count Users dynamically
        users = db_fs.collection("Users").get()
        farmer_count = sum(1 for doc in users if doc.to_dict().get("role") == "farmer")
        customer_count = sum(1 for doc in users if doc.to_dict().get("role") == "customer")
        
        # Calculate Market Data & History
        market_value = 0
        history_logs = []
        
        ref = db.reference("Market_Sales")
        listings = ref.get()
        if listings:
            from datetime import datetime
            for key, val in listings.items():
                if isinstance(val, dict):
                    # purely sum market value
                    price = float(val.get("price_per_qtl", 0))
                    market_value += price
                    
        # History Logs from ActivityFeed
        act_ref = db.reference("Activity_Feed")
        activities = act_ref.get()
        if activities:
            from datetime import datetime
            for key, val in activities.items():
                if isinstance(val, dict):
                    ts = val.get("timestamp", 0) / 1000.0 if val.get("timestamp") else 0
                    time_str = datetime.fromtimestamp(ts).strftime("%H:%M %p") if ts else "Now"
                    history_logs.append({
                        "id": key,
                        "time": time_str,
                        "type": val.get("type", "System Activity"),
                        "status": val.get("status", "Success"),
                        "detail": val.get("detail", ""),
                        "timestamp": ts
                    })
                    
        # Sort history newest first, optionally cap at last 50
        history_logs = sorted(history_logs, key=lambda x: x["timestamp"], reverse=True)[:50]
        
        return {
            "farmers": farmer_count,
            "customers": customer_count,
            "marketValue": market_value,
            "history": history_logs
        }
        
    except Exception as e:
        print(f"Error fetching admin stats: {e}")
        return {"farmers": 0, "customers": 0, "marketValue": 0, "history": []}

def get_all_users():
    db_fs = get_db()
    if not db_fs: return []
    try:
        users = db_fs.collection("Users").get()
        result = []
        for doc in users:
            data = doc.to_dict()
            data['id'] = doc.id
            result.append(data)
        return result
    except Exception as e:
        print(f"Error fetching users list: {e}")
        return []

def delete_user(user_id):
    db_fs = get_db()
    if not db_fs: return False
    try:
        db_fs.collection("Users").document(user_id).delete()
        log_system_activity("User Removed", "Warning", f"Admin instantly revoked verified standing for account: {user_id}")
        return True
    except Exception as e:
        print(f"Error deleting user {user_id}: {e}")
        return False
