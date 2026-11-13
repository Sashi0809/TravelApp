import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from geopy.distance import geodesic
import joblib
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "recommender.pkl")
CSV_PATH = os.path.join(BASE_DIR, "travel_recommendations_1200.csv")

def get_model():
    """Load the model bundle, or auto-train it if missing."""
    global preprocessor, knn, df
    if os.path.exists(MODEL_PATH):
        try:
            model_bundle = joblib.load(MODEL_PATH)
            preprocessor = model_bundle["preprocessor"]
            knn = model_bundle["knn"]
            df = model_bundle["data"]
            print("Model loaded successfully from pkl.")
            return
        except Exception as e:
            print("Error loading cached model, regenerating...", e)

    print("Training model from CSV...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = pd.read_csv(CSV_PATH)
    features = df[["budget", "placeType", "travelers", "duration", "latitude", "longitude"]]
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', MinMaxScaler(), ['budget', 'duration', 'latitude', 'longitude']),
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['placeType', 'travelers'])
        ])
    X = preprocessor.fit_transform(features)
    knn = NearestNeighbors(n_neighbors=3)
    knn.fit(X)
    bundle = {"preprocessor": preprocessor, "knn": knn, "data": df}
    try:
        joblib.dump(bundle, MODEL_PATH)
    except Exception as e:
        print("Warning: Could not save model to disk:", e)
    print("Model initialized and ready.")

# Initialize model
get_model()

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "TravelAI ML Service",
        "model_loaded": preprocessor is not None and knn is not None
    }), 200

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
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)