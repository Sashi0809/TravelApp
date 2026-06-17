import pymongo
import random

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["TravelApp"]
destinations_col = db["destinations"]

# Clear existing destinations to avoid duplicates on re-run
destinations_col.delete_many({})

base_destinations = [
    {"name": "Paris", "base_budget": 200, "placeType": "City", "latitude": 48.8566, "longitude": 2.3522},
    {"name": "Maldives", "base_budget": 500, "placeType": "Beach", "latitude": 3.2028, "longitude": 73.2207},
    {"name": "Swiss Alps", "base_budget": 300, "placeType": "Mountains", "latitude": 46.8182, "longitude": 8.2275},
    {"name": "Rome", "base_budget": 150, "placeType": "Historical", "latitude": 41.9028, "longitude": 12.4964},
    {"name": "Costa Rica", "base_budget": 120, "placeType": "Nature", "latitude": 9.7489, "longitude": -83.7534},
    {"name": "Tokyo", "base_budget": 250, "placeType": "City", "latitude": 35.6762, "longitude": 139.6503},
    {"name": "Bali", "base_budget": 100, "placeType": "Beach", "latitude": -8.4095, "longitude": 115.1889},
    {"name": "New York City", "base_budget": 300, "placeType": "City", "latitude": 40.7128, "longitude": -74.0060},
    {"name": "Machu Picchu", "base_budget": 80, "placeType": "Historical", "latitude": -13.1631, "longitude": -72.5450},
    {"name": "Banff National Park", "base_budget": 180, "placeType": "Nature", "latitude": 51.1784, "longitude": -115.5708},
    {"name": "Santorini", "base_budget": 350, "placeType": "Beach", "latitude": 36.3932, "longitude": 25.4615},
    {"name": "Kyoto", "base_budget": 200, "placeType": "Historical", "latitude": 35.0116, "longitude": 135.7681},
    {"name": "Yellowstone", "base_budget": 150, "placeType": "Nature", "latitude": 44.4280, "longitude": -110.5885},
    {"name": "Dubai", "base_budget": 400, "placeType": "City", "latitude": 25.2048, "longitude": 55.2708},
    {"name": "Phuket", "base_budget": 90, "placeType": "Beach", "latitude": 7.9519, "longitude": 98.3381},
    {"name": "Cairo", "base_budget": 70, "placeType": "Historical", "latitude": 30.0444, "longitude": 31.2357},
    {"name": "Patagonia", "base_budget": 200, "placeType": "Mountains", "latitude": -50.9423, "longitude": -73.4068},
    {"name": "Sydney", "base_budget": 250, "placeType": "City", "latitude": -33.8688, "longitude": 151.2093},
    {"name": "Amalfi Coast", "base_budget": 300, "placeType": "Beach", "latitude": 40.6333, "longitude": 14.6029},
    {"name": "Great Barrier Reef", "base_budget": 280, "placeType": "Nature", "latitude": -18.2871, "longitude": 147.6992}
]

travelers_options = ["Solo", "Couple", "Family", "Friends"]
descriptions_pool = [
    "A wonderful place to relax and enjoy the scenery.",
    "Experience the vibrant culture and amazing food.",
    "Perfect for adventure seekers and nature lovers.",
    "A mix of history, art, and incredible architecture.",
    "Beautiful landscapes and a serene environment.",
    "An unforgettable journey full of memories.",
    "The ultimate destination for your next getaway."
]

destinations = []

for i in range(1000):
    base = random.choice(base_destinations)
    
    budget_variation = random.randint(-50, 100)
    duration = random.randint(3, 14)
    traveler = random.choice(travelers_options)
    description = random.choice(descriptions_pool)
    
    lat_variation = random.uniform(-0.5, 0.5)
    lon_variation = random.uniform(-0.5, 0.5)

    destinations.append({
        "name": f"{base['name']} - Area {i+1}",
        "base_budget": max(50, base['base_budget'] + budget_variation),
        "placeType": base['placeType'],
        "travelers": traveler,
        "duration": duration,
        "description": description,
        "latitude": round(base['latitude'] + lat_variation, 4),
        "longitude": round(base['longitude'] + lon_variation, 4)
    })

# Insert into MongoDB
x = destinations_col.insert_many(destinations)
print(f"Successfully inserted {len(x.inserted_ids)} destinations into MongoDB.")
