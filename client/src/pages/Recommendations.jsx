import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PlaceDetailsModal from "../components/PlaceDetailsModal";
import api from "../utils/api";

const Recommendations = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    budget: "1000",
    placeType: "Beach",
    travelers: "Solo",
    duration: "3",
  });
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null });
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Currency Converter State
  const [currencyData, setCurrencyData] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("EUR");
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          console.warn("Location access denied or unavailable. Defaulting to New York.", err);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Fetch currency rates
    const fetchRates = async () => {
      try {
        const res = await axios.get(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        setCurrencyData(res.data.rates);
      } catch (err) {
        console.error("Failed to fetch rates", err);
      }
    };
    fetchRates();
  }, [baseCurrency]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations(null);

    try {
      // Call the Flask ML Service running on port 5001
      const ML_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:5001";
      const response = await axios.post(`${ML_URL}/recommend`, {
        budget: Number(form.budget),
        placeType: form.placeType,
        travelers: form.travelers,
        duration: Number(form.duration),
        userLat: userLocation.lat,
        userLon: userLocation.lon
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recommendations from ML service. Make sure the Flask server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  const addToBucketList = async (e, rec) => {
    e.stopPropagation(); // Prevent opening the modal
    try {
      await api.post("/api/bucketlist", {
        name: rec.name || rec.City,
        latitude: rec.latitude || 0, // Fallback if ML doesn't provide
        longitude: rec.longitude || 0, // Fallback if ML doesn't provide
      });
      alert(`Added ${rec.name || rec.City} to Bucket List!`);
    } catch (err) {
      console.error(err);
      alert("Failed to add place to Bucket List.");
    }
  };

  return (
    <div className="dashboard-layout animate-in">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1000px", margin: "0 auto 2rem auto" }}>
        <div>
          <h2 className="dashboard-title">Get Recommendations</h2>
          <p className="dashboard-subtitle">Tell us what you're looking for and let ML find the perfect spots.</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </div>

      {/* Currency Converter Widget */}
      <div className="card glass-panel" style={{ maxWidth: "1000px", margin: "0 auto 2rem auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>💱</span>
          <h4 style={{ margin: 0, color: "var(--text-primary)" }}>Currency Converter</h4>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-main)", color: "var(--text-main)", width: "100px" }}
          />
          <select 
            value={baseCurrency} 
            onChange={(e) => setBaseCurrency(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-card)", color: "var(--text-primary)" }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="INR">INR</option>
            <option value="AUD">AUD</option>
            <option value="CAD">CAD</option>
          </select>
          <span style={{ color: "var(--text-secondary)" }}>to</span>
          <select 
            value={targetCurrency} 
            onChange={(e) => setTargetCurrency(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-card)", color: "var(--text-primary)" }}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="INR">INR</option>
            <option value="AUD">AUD</option>
            <option value="CAD">CAD</option>
          </select>
        </div>

        {currencyData && (
          <div style={{ marginLeft: "auto", background: "var(--primary)", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "700" }}>
            {amount} {baseCurrency} = {(amount * currencyData[targetCurrency]).toFixed(2)} {targetCurrency}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Form Section */}
        <div className="card glass-panel" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block", color: "var(--text-primary)" }}>
                  Total Budget (Including Travel) ($)
                </label>
                <input 
                  type="number" 
                  name="budget" 
                  min="0"
                  value={form.budget} 
                  onChange={handleChange} 
                  className="form-input"
                  placeholder="e.g. 3000"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block", color: "var(--text-primary)" }}>
                  Type of Place
                </label>
                <select 
                  name="placeType" 
                  value={form.placeType} 
                  onChange={handleChange} 
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-primary)" }}
                >
                  <option value="Beach" style={{ color: "#000" }}>Beach & Coastal</option>
                  <option value="Mountains" style={{ color: "#000" }}>Mountains & Hiking</option>
                  <option value="City" style={{ color: "#000" }}>City Exploration</option>
                  <option value="Historical" style={{ color: "#000" }}>Historical & Cultural</option>
                  <option value="Nature" style={{ color: "#000" }}>Nature & Wildlife</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block", color: "var(--text-primary)" }}>
                  Travelers
                </label>
                <select 
                  name="travelers" 
                  value={form.travelers} 
                  onChange={handleChange} 
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-primary)" }}
                >
                  <option value="Solo" style={{ color: "#000" }}>Solo</option>
                  <option value="Couple" style={{ color: "#000" }}>Couple</option>
                  <option value="Family" style={{ color: "#000" }}>Family</option>
                  <option value="Friends" style={{ color: "#000" }}>Group of Friends</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block", color: "var(--text-primary)" }}>
                  Duration (Days)
                </label>
                <input 
                  type="number" 
                  name="duration" 
                  min="1"
                  value={form.duration} 
                  onChange={handleChange} 
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.2)", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: "1rem", fontSize: "1.1rem", fontWeight: "600", marginTop: "1rem", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Searching for perfect spots... 🔎" : "Find Destinations ✨"}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {error && (
          <div className="error-alert" style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(255, 59, 48, 0.1)", color: "#ff3b30", border: "1px solid rgba(255, 59, 48, 0.2)" }}>
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {recommendations && (
          <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
              Top Recommendations for You
            </h3>
            
            <div className="dashboard-grid">
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className="card glass-panel" 
                  style={{ display: "flex", flexDirection: "column", gap: "1rem", cursor: "pointer", transition: "transform 0.2s" }}
                  onClick={() => {
                    setSelectedPlace({ name: rec.name || rec.City });
                    setIsModalOpen(true);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                      {rec.name || rec.City || `Destination ${index + 1}`}
                    </h4>
                    <span style={{ background: "var(--border-subtle)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem" }}>
                      Top Match
                    </span>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5" }}>
                      {rec.description || "A highly recommended destination based on your preferences."}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {Object.entries(rec).map(([key, value]) => {
                      // Skip standard fields or unreadable fields
                      if (["name", "City", "description"].includes(key) || typeof value === "object") return null;
                      return (
                        <span key={key} style={{ background: "rgba(0, 122, 255, 0.1)", color: "var(--primary)", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", textTransform: "capitalize" }}>
                          {key}: {value}
                        </span>
                      );
                    })}
                  </div>

                  <button 
                    className="btn btn-primary"
                    onClick={(e) => addToBucketList(e, rec)}
                    style={{ marginTop: "1rem", padding: "0.5rem", fontSize: "0.9rem", alignSelf: "flex-end" }}
                  >
                    Add to Bucket List 📍
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PlaceDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        place={selectedPlace} 
      />
    </div>
  );
};

export default Recommendations;
