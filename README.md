# TravelApp

A full-stack travel recommendation application featuring an AI-driven machine learning backend, a Node.js/Express server, and a React frontend.

## Features
- **AI Recommendations:** K-Nearest Neighbors (KNN) model trained on 1200 destinations, recommending places based on budget, travel style, duration, and geographic proximity.
- **Bucket List & Journals:** Save places you want to visit, mark them as visited, and write travel journals.
- **Expense Tracking:** Log and manage trip expenses.
- **Currency Converter & Weather:** View real-time weather and convert currencies directly in the app.

## Project Structure
This repository contains three main services:
- `/client`: React (Vite) frontend application.
- `/server`: Node.js / Express backend with MongoDB.
- `/ml-service`: Python Flask API handling the machine learning model.

## Setup Instructions

### 1. Database & Environment Variables
Create a `.env` file in the `/server` directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key (optional, for AI itineraries)
```

### 2. Run the Server
```bash
cd server
npm install
npm start
```

### 3. Run the Client
```bash
cd client
npm install
npm run dev
```

### 4. Run the ML Service
Ensure you have Python installed.
```bash
cd ml-service
pip install -r requirements.txt

# (Optional) Generate the dummy model if not already present
python train_dummy_model.py

# Start the Flask API
python app.py
```

The application will be running with the frontend at `http://localhost:5173`, the main backend at `http://localhost:5000`, and the ML service at `http://localhost:5001`.
