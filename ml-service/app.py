from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from geopy.distance import geodesic
import joblib

app = Flask(__name__)
CORS(app)

# Load model globally
try:
    model_bundle = joblib.load("model/recommender.pkl")
    preprocessor = model_bundle["preprocessor"]
    knn = model_bundle["knn"]
    df = model_bundle["data"]
except Exception as e:
    print("Warning: Could not load model. Ensure train_dummy_model.py has been run.", e)

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        user_input = request.json
        user_lat = float(user_input.get("userLat") or 40.7128)
        user_lon = float(user_input.get("userLon") or -74.0060)
        budget = float(user_input.get("budget", 1000))
        duration = int(user_input.get("duration", 1))
        place_type = user_input.get("placeType", "City")
        travelers = user_input.get("travelers", "Solo")

        # Create user dataframe matching training format
        user_df = pd.DataFrame([{
            "budget": budget,
            "placeType": place_type, 
            "travelers": travelers,
            "duration": duration,
            "latitude": user_lat,
            "longitude": user_lon
        }])
        
        # Transform using loaded preprocessor
        user_vector = preprocessor.transform(user_df)

        # Query KNN model
        distances, indices = knn.kneighbors(user_vector, n_neighbors=3)

        # Extract top recommendations
        top_recommendations = df.iloc[indices[0]].copy()

        # Calculate actual real-world distances and costs for the frontend
        def calc_distance(row):
            return geodesic((user_lat, user_lon), (row["latitude"], row["longitude"])).kilometers
            
        top_recommendations["distance_km"] = top_recommendations.apply(calc_distance, axis=1)
        top_recommendations["total_cost"] = top_recommendations["budget"] + (top_recommendations["distance_km"] * 0.15)

        # Format output
        top_recommendations["distance_km"] = top_recommendations["distance_km"].round(2)
        top_recommendations["total_cost"] = top_recommendations["total_cost"].round(2)
        
        return jsonify(top_recommendations.to_dict("records"))

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)