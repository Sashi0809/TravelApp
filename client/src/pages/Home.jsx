import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-in">

      {/* Hero Section */}
      <section className="hero container" style={{ minHeight: "70vh" }}>
        <span className="hero-badge glass-panel">
          ✨ Your Ultimate Travel Companion
        </span>

        <h1 className="hero-title">
          Smart Travel <span className="text-gradient">Planning</span>
        </h1>

        <p className="hero-subtitle">
          Explore the world, get personalized recommendations, build your dream bucket list, and manage your expenses all in one place.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          <button
            onClick={() => navigate("/register")}
            className="btn btn-primary btn-hero"
          >
            Get Started Free
          </button>
          <button
            onClick={() => navigate("/map")}
            className="btn btn-secondary btn-hero"
          >
            Explore the Map 🌍
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section container">

        {/* Explore Block */}
        <div className="feature-block">
          <div className="feature-image-container">
            <img src="/assets/images/feature_explore.png" alt="Interactive Map" className="feature-image" />
          </div>
          <div className="feature-content">
            <div className="feature-icon text-gradient">📍</div>
            <h3 className="feature-title">Explore Global Destinations</h3>
            <p className="feature-text">
              Browse our interactive map to discover amazing places across the globe. Click on any pin to view comprehensive details, read community reviews, and check real-time weather forecasts before you pack your bags.
            </p>
            <button className="btn btn-secondary feature-action" onClick={() => navigate("/map")}>Open Map →</button>
          </div>
        </div>

        {/* Recommendations Block (Reverse) */}
        <div className="feature-block reverse">
          <div className="feature-image-container">
            <img src="/assets/images/feature_recommendations.png" alt="AI Recommendations" className="feature-image" />
          </div>
          <div className="feature-content">
            <div className="feature-icon text-gradient">✨</div>
            <h3 className="feature-title">Personalized Recommendations</h3>
            <p className="feature-text">
              Unsure where to go next? Input your budget, preferred travel style, and the number of travelers. Our intelligent engine will match you with the top destinations perfectly suited for your upcoming adventure.
            </p>
            <button className="btn btn-secondary feature-action" onClick={() => navigate("/recommendations")}>Get Recommendations →</button>
          </div>
        </div>

        {/* Bucket List Block */}
        <div className="feature-block">
          <div className="feature-image-container">
            <img src="/assets/images/feature_bucket_list.png" alt="Bucket List" className="feature-image" />
          </div>
          <div className="feature-content">
            <div className="feature-icon text-gradient">📋</div>
            <h3 className="feature-title">Your Ultimate Bucket List</h3>
            <p className="feature-text">
              Save the places you've always dreamed of visiting. Mark them as completed when you return, write personal travel journals for each trip, and generate a public link to share your adventures with friends and family!
            </p>
            <button className="btn btn-secondary feature-action" onClick={() => navigate("/bucket-list")}>View Bucket List →</button>
          </div>
        </div>

        {/* Expense Tracker Block (Reverse) */}
        <div className="feature-block reverse">
          <div className="feature-image-container">
            <img src="/assets/images/feature_expenses.png" alt="Expense Tracker" className="feature-image" />
          </div>
          <div className="feature-content">
            <div className="feature-icon text-gradient">💰</div>
            <h3 className="feature-title">Integrated Expense Tracking</h3>
            <p className="feature-text">
              Keep your travel budget in check. Log every meal, flight, and tour. Categorize your expenses on the fly and monitor your total spending so you never return home with an empty wallet.
            </p>
            <button className="btn btn-secondary feature-action" onClick={() => navigate("/expenses")}>Track Expenses →</button>
          </div>
        </div>

      </section>

    </div>
  );
};

export default Home;