import joblib
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
import os

# Load dataset from CSV
df = pd.read_csv("travel_recommendations_1200.csv")

# Features we expect from user
features = df[["budget", "placeType", "travelers", "duration", "latitude", "longitude"]]

# Preprocessor to handle categorical and numerical columns
preprocessor = ColumnTransformer(
    transformers=[
        ('num', MinMaxScaler(), ['budget', 'duration', 'latitude', 'longitude']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['placeType', 'travelers'])
    ])

# Fit preprocessor
X = preprocessor.fit_transform(features)

# Train KNN
knn = NearestNeighbors(n_neighbors=3)
knn.fit(X)

# Save bundle
os.makedirs("model", exist_ok=True)
joblib.dump({"preprocessor": preprocessor, "knn": knn, "data": df}, "model/recommender.pkl")
print("Dummy model generated successfully.")
