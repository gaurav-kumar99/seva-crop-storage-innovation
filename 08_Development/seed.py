"""Sample data daalne ke liye: python seed.py

NOTE: ye sirf demo/testing ka SAMPLE data hai, asli storage facilities ka data nahi.
Asli data research ke baad operator account se POST /storages (ya /docs) se daalo.
Script dobara chalane par duplicate nahi banta.
"""
from database import Base, engine, SessionLocal
import models
import auth

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if not db.query(models.User).filter(models.User.phone == "9000000000").first():
    db.add(
        models.User(
            name="Demo Operator",
            phone="9000000000",
            role="operator",
            district="Purba Medinipur",
            state="West Bengal",
            password_hash=auth.hash_password("operator123"),
        )
    )

# Frontend quintals mein dikhata hai: 1 quintal = 100 kg, isliye capacity x100 aur
# price (per quintal/month) /100 karke per kg/month rakha hai.
Q = 100
# (name, village, district, distance_km, crops, capacity_q, available_q, price_per_q,
#  min_t, max_t, hours, contact, facilities, type, description)
SAMPLES = [
    ("Haldia Cold Storage", "Haldia", "Purba Medinipur", 5, ["Potato", "Onion", "Tomato"],
     10000, 3500, 25, 2, 8, "9 AM - 6 PM", "9000000001",
     ["Cold Storage", "24-hour Security", "Loading Area"], "cold_storage",
     "A sample cold storage facility in Haldia."),
    ("Tamluk Farmers Storage", "Tamluk", "Purba Medinipur", 18, ["Potato", "Onion", "Chilli"],
     8000, 2500, 22, 3, 9, "8 AM - 5 PM", "9000000002",
     ["Cold Storage", "Loading Area", "Security"], "cold_storage",
     "A sample storage facility for local farmers."),
    ("Contai Agricultural Storage", "Contai", "Purba Medinipur", 35, ["Potato", "Tomato", "Mango"],
     12000, 5000, 28, 2, 8, "9 AM - 6 PM", "9000000003",
     ["Cold Storage", "Transport Support", "Security"], "cold_storage",
     "A sample facility for agricultural products."),
    ("Panskura Cold Storage", "Panskura", "Purba Medinipur", 28, ["Potato", "Onion", "Leafy vegetables"],
     9000, 0, 24, 2, 7, "9 AM - 5 PM", "9000000004",
     ["Cold Storage", "Security"], "cold_storage",
     "A sample facility that is currently full."),
    ("Kharagpur Crop Storage", "Kharagpur", "Paschim Medinipur", 42, ["Potato", "Rice", "Wheat"],
     15000, 6000, 20, 4, 10, "8 AM - 6 PM", "9000000005",
     ["Warehouse", "Loading Area", "Security"], "warehouse",
     "A sample warehouse for selected crops."),
    ("Kolkata Fresh Storage", "Joka", "Kolkata", 65, ["Tomato", "Chilli", "Mango", "Banana"],
     7000, 2200, 30, 2, 8, "10 AM - 6 PM", "9000000006",
     ["Cold Storage", "Quality Checking", "Security"], "cold_storage",
     "A sample facility for fresh agricultural produce."),
    ("Howrah Farmers Warehouse", "Uluberia", "Howrah", 55, ["Rice", "Wheat", "Pulses"],
     11000, 4000, 18, 5, 12, "9 AM - 5 PM", "9000000007",
     ["Warehouse", "Loading Area", "Security"], "warehouse",
     "A sample warehouse for grains and pulses."),
    ("Burdwan Agricultural Storage", "Burdwan", "Purba Bardhaman", 75, ["Potato", "Rice", "Wheat", "Onion"],
     14000, 5500, 23, 3, 9, "9 AM - 6 PM", "9000000008",
     ["Cold Storage", "Warehouse", "Security"], "cold_storage",
     "A sample storage facility for multiple crops."),
]

existing = {n for (n,) in db.query(models.Storage.name).all()}
for (name, village, district, dist, crops, cap, avail, price, tmin, tmax,
     hours, phone, facilities, kind, desc) in SAMPLES:
    if name in existing:
        continue
    db.add(models.Storage(
        name=name, type=kind, village=village, district=district, state="West Bengal",
        distance_km=dist, crops=crops, facilities=facilities,
        capacity_kg=cap * Q, available_kg=avail * Q, min_quantity_kg=Q,
        price_per_kg_month=price / Q, other_charges="None (sample)",
        contact_phone=phone, min_temp_c=tmin, max_temp_c=tmax,
        open_hours=hours, description=desc,
    ))

db.commit()
db.close()
print("Seed done. Operator login: phone 9000000000, password operator123")
