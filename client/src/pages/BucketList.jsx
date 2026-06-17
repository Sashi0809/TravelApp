import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import PlaceDetailsModal from "../components/PlaceDetailsModal";

const BucketList = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Fetch user ID for sharing
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/users/me");
        setUserId(res.data._id);
      } catch (err) {
        console.error("Could not fetch user info");
      }
    };
    fetchUser();
  }, []);

  const fetchBucketList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/bucketlist");
      setPlaces(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bucket list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deletePlace = async (id) => {
    try {
      await api.delete(`/api/bucketlist/${id}`);
      setPlaces(places.filter((place) => place._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete place.");
    }
  };

  const updateBucketItem = async (id, updates) => {
    try {
      const res = await api.put(`/api/bucketlist/${id}`, updates);
      setPlaces(places.map(place => place._id === id ? res.data : place));
    } catch (err) {
      console.error(err);
      alert("Failed to update place.");
    }
  };

  useEffect(() => {
    fetchBucketList();
  }, []);

  return (
    <div className="dashboard-layout animate-in">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1000px", margin: "0 auto 2rem auto" }}>
        <div>
          <h2 className="dashboard-title">My Bucket List</h2>
          <p className="dashboard-subtitle">Places you plan to explore soon</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/map")}
          >
            Explore Map 📍
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="text-gradient" style={{ fontSize: "1.2rem", fontWeight: "600" }}>Loading your places...</div>
        </div>
      ) : error ? (
        <div className="error-alert" style={{ maxWidth: "600px", margin: "2rem auto" }}>
          {error}
        </div>
      ) : places.length === 0 ? (
        <div className="card glass-panel" style={{ maxWidth: "600px", margin: "2rem auto", padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Your Bucket List is Empty</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Explore the map, click on any location, and add it to your bucket list to start planning your next trip!
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/map")}
            style={{ padding: "0.8rem 2rem" }}
          >
            Go to Map
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
            {userId && (
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  const url = `${window.location.origin}/public-bucketlist/${userId}`;
                  navigator.clipboard.writeText(url);
                  alert("Public bucket list link copied to clipboard!");
                }}
                style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                🔗 Share Public Bucket List
              </button>
            )}
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "0.5rem", borderRadius: "8px", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }}
              >
                <option value="recent">Recently Added</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {[...places].sort((a, b) => {
              if (sortBy === "alphabetical") return a.name.localeCompare(b.name);
              return new Date(b.createdAt) - new Date(a.createdAt);
            }).map((place) => (
              <div 
                key={place._id} 
                className="card glass-panel"  
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", cursor: "pointer", transition: "transform 0.2s" }}
                onClick={() => {
                  setSelectedPlace({ name: place.name, lat: place.latitude, lon: place.longitude });
                  setIsModalOpen(true);
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.8rem", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {place.name}
                  </h4>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <span><strong>Latitude:</strong> {place.latitude.toFixed(6)}</span>
                    <span><strong>Longitude:</strong> {place.longitude.toFixed(6)}</span>
                    <span style={{ fontSize: "0.8rem", opacity: "0.7", marginTop: "0.5rem" }}>
                      Added: {new Date(place.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Visited & Journal Section */}
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }} onClick={e => e.stopPropagation()}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: place.visited ? "0.5rem" : "0" }}>
                      <input 
                        type="checkbox" 
                        checked={place.visited} 
                        onChange={(e) => updateBucketItem(place._id, { visited: e.target.checked })}
                      />
                      <span style={{ fontWeight: place.visited ? "700" : "400", color: place.visited ? "var(--primary)" : "var(--text-secondary)" }}>
                        {place.visited ? "✅ Visited" : "Mark as Visited"}
                      </span>
                    </label>
                    
                    {place.visited && (
                      <textarea
                        value={place.journal || ""}
                        placeholder="Write your travel memories..."
                        onChange={(e) => {
                          // Optimistic update locally
                          setPlaces(places.map(p => p._id === place._id ? { ...p, journal: e.target.value } : p));
                        }}
                        onBlur={(e) => updateBucketItem(place._id, { journal: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", background: "var(--bg-main)", border: "1px solid var(--border-strong)", color: "var(--text-main)", resize: "vertical", marginTop: "0.5rem" }}
                        rows="2"
                      />
                    )}
                  </div>
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlace(place._id);
                  }}
                  style={{ marginTop: "1.5rem", alignSelf: "flex-end", padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                >
                  Delete 🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <PlaceDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        place={selectedPlace} 
      />
    </div>
  );
};

export default BucketList;