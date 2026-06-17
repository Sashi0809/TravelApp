import pandas as pd
import re
import time
import random
from geopy.geocoders import Nominatim

# Initialize Geocoder
geolocator = Nominatim(user_agent="travel_app_agent_1234")

df = pd.read_csv('travel_recommendations_1200.csv')

def get_base_name(name):
    # Remove trailing digits and common directional/area suffixes
    base = re.sub(r' \d+$| East$| West$| South$| North$| Central$', '', name).strip()
    return base

df['base_name'] = df['name'].apply(get_base_name)
unique_bases = df['base_name'].unique()

print(f"Found {len(unique_bases)} unique base locations to geocode. This may take about {len(unique_bases) * 1.5} seconds...")

base_coords = {}

# Geocode unique base names
for base in unique_bases:
    try:
        # Simplify names if needed for better geocoding
        search_name = base
        if "Canada Wilderness" in search_name:
            search_name = "Banff, Canada"
        elif "Sri Lanka Rainforest" in search_name:
            search_name = "Sinharaja Forest Reserve, Sri Lanka"
        elif "Ooty Hills" in search_name:
            search_name = "Ooty, India"
            
        location = geolocator.geocode(search_name, timeout=10)
        if location:
            base_coords[base] = (location.latitude, location.longitude)
            print(f"Geocoded: {base} -> {location.latitude}, {location.longitude}")
        else:
            base_coords[base] = (0.0, 0.0)
            print(f"Failed to geocode: {base}. Defaulting to 0.0, 0.0")
    except Exception as e:
        print(f"Error geocoding {base}: {e}")
        base_coords[base] = (0.0, 0.0)
    
    # Sleep to respect Nominatim usage policy (1 request per second absolute max)
    time.sleep(1.2)

# Apply coordinates with slight random jitter for variation
def get_lat(row):
    base = row['base_name']
    lat, lon = base_coords.get(base, (0.0, 0.0))
    if lat != 0.0:
        return round(lat + random.uniform(-0.05, 0.05), 4)
    return lat

def get_lon(row):
    base = row['base_name']
    lat, lon = base_coords.get(base, (0.0, 0.0))
    if lon != 0.0:
        return round(lon + random.uniform(-0.05, 0.05), 4)
    return lon

df['latitude'] = df.apply(get_lat, axis=1)
df['longitude'] = df.apply(get_lon, axis=1)

# Drop helper column
df.drop(columns=['base_name'], inplace=True)

# Save the updated CSV
df.to_csv('travel_recommendations_1200.csv', index=False)
print("Successfully added latitude and longitude to travel_recommendations_1200.csv")
