import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from services.firebase_service import get_all_users, get_market_listings
from services.mongo_service import backup_user_to_mongo, add_mongo_market_listing

def sync_data():
    print("Starting MongoDB Sync...")
    users = get_all_users()
    synced_users = 0
    for u in users:
        role = u.get("role", "customer")
        name = u.get("name", "Unknown")
        email = u.get("email", "")
        uid = u.get("id", "")
        pwd = u.get("password", "")
        if backup_user_to_mongo(role, name, email, uid, pwd):
            synced_users += 1
            
    print(f"Synced {synced_users} users to MongoDB.")
    
    listings = get_market_listings()
    synced_listings = 0
    for l in listings:
        farmer = l.get("farmer_name", "Unknown")
        loc = l.get("location", "Unknown")
        crop = l.get("crop_name", "Unknown")
        kg = l.get("quantity_kg", 0)
        price = l.get("price_per_qtl", 0)
        # We don't preserve the exact old timestamp but it will be close enough for legacy data
        if add_mongo_market_listing(farmer, loc, crop, kg, price).get("success"):
            synced_listings += 1
            
    print(f"Synced {synced_listings} market listings to MongoDB.")
    print("Sync complete!")

if __name__ == "__main__":
    sync_data()
