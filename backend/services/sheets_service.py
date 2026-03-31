import gspread
from oauth2client.service_account import ServiceAccountCredentials
import uuid
from datetime import datetime
import os

# Define the scope
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# Path to credentials file (one level up from services/)
creds_path = os.path.join(os.path.dirname(__file__), "..", "credentials.json")

def get_client():
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(creds_path, scope)
        client = gspread.authorize(creds)
        return client
    except Exception as e:
        print(f"Error authenticating with Google Sheets: {e}")
        return None

def register_user_in_sheet(role, name, email):
    client = get_client()
    if not client:
        return {"success": False, "error": "Google Sheets client not initialized. Check credentials.json exists in backend folder."}
    
    try:
        # Target the sheet explicitly by the user's provided name
        sheet_file = client.open("Farm")
        
        tab_name = "Farmers" if role == "farmer" else "Customers"
        try:
            worksheet = sheet_file.worksheet(tab_name)
        except gspread.exceptions.WorksheetNotFound:
            return {"success": False, "error": f"Worksheet '{tab_name}' not found in 'Farm'."}
            
        join_date = datetime.now().strftime("%Y-%m-%d")
        
        if role == "farmer":
            user_id = f"F-{str(uuid.uuid4())[:6].upper()}"
            # User_ID, Full_Name, Email_Address, Farm_Name, Join_Date, Account_Status
            row = [user_id, name, email, "New Farm", join_date, "Active"]
        else: # customer
            user_id = f"C-{str(uuid.uuid4())[:6].upper()}"
            # User_ID, Full_Name, Email_Address, Total_Orders, Join_Date, Account_Status
            row = [user_id, name, email, "0", join_date, "Active"]
            
        worksheet.append_row(row)
        return {"success": True, "user_id": user_id}
        
    except gspread.exceptions.SpreadsheetNotFound:
        return {"success": False, "error": "Spreadsheet 'Farm' not found. Ensure it is named exactly 'Farm' and shared with the service account email."}
    except Exception as e:
        return {"success": False, "error": str(e)}

def log_market_sale_to_sheet(farmer_name, location, crop_name, kg, price_per_qtl):
    client = get_client()
    if not client:
        return {"success": False, "error": "Google Sheets client not initialized."}
    
    try:
        try:
            sheet_file = client.open("Market_Hub")
            worksheet = sheet_file.sheet1
        except gspread.exceptions.SpreadsheetNotFound:
            sheet_file = client.open("Farm")
            try:
                worksheet = sheet_file.worksheet("Market_Hub")
            except gspread.exceptions.WorksheetNotFound:
                return {"success": False, "error": "Worksheet 'Market_Hub' not found in 'Farm'."}
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        row = [timestamp, farmer_name, location, crop_name, f"{kg} Kg", f"₹{price_per_qtl}/Qtl"]
        worksheet.append_row(row)
        return {"success": True}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def log_order_to_sheet(customer_name, items):
    client = get_client()
    if not client:
        return {"success": False, "error": "Google Sheets client not initialized."}
    
    try:
        try:
            sheet_file = client.open("Orders")
            worksheet = sheet_file.sheet1
        except gspread.exceptions.SpreadsheetNotFound:
            sheet_file = client.open("Farm")
            try:
                worksheet = sheet_file.worksheet("Orders")
            except gspread.exceptions.WorksheetNotFound:
                return {"success": False, "error": "Worksheet 'Orders' not found in 'Farm'."}
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for item in items:
            crop = item.get("crop_name", "Unknown")
            farmer = item.get("farmer_name", "Unknown")
            qty = f"{item.get('cartQuantity', 0)} Kg"
            total = item.get("cartQuantity", 0) * (item.get("price_per_qtl", 0) / max(item.get("quantity_kg", 1), 1))
            row = [timestamp, customer_name, farmer, crop, qty, f"₹{total:.2f}"]
            worksheet.append_row(row)
            
        try:
            # Update Total_Orders for the customer in the 'Customers' worksheet
            farm_sheet = client.open("Farm")
            customers_ws = farm_sheet.worksheet("Customers")
            
            names = customers_ws.col_values(2) # Column B: Full_Name
            if customer_name in names:
                row_idx = names.index(customer_name) + 1
                current_orders_str = customers_ws.cell(row_idx, 4).value
                try:
                    current_orders = int(current_orders_str) if current_orders_str else 0
                except ValueError:
                    current_orders = 0
                
                customers_ws.update_cell(row_idx, 4, str(current_orders + 1))
        except Exception as update_err:
            print(f"Failed to update customer total orders: {update_err}")
            
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

def log_admin_activity_to_sheet(event_type, status, detail):
    client = get_client()
    if not client:
        return {"success": False, "error": "Google Sheets client not initialized."}
    
    try:
        try:
            sheet_file = client.open("Farm")
            worksheet = sheet_file.worksheet("Admin_Logs")
        except gspread.exceptions.SpreadsheetNotFound:
            return {"success": False, "error": "Spreadsheet 'Farm' not found."}
        except gspread.exceptions.WorksheetNotFound:
            return {"success": False, "error": "Worksheet 'Admin_Logs' not found in 'Farm'."}
            
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # Column A: Timestamp, B: Event_Type, C: Status, D: Detailed_Description
        row = [timestamp, event_type, status, detail]
        worksheet.append_row(row)
        
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
