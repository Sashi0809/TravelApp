import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PlaceDetailsModal from "../components/PlaceDetailsModal";

const PublicBucketList = () => {
  const { userId } = useParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPublicList = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/bucketlist/public/${userId}`);
        setPlaces(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load public bucket list");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicList();
  }, [userId]);

  if (loading) return (
    <div className="dashboard-layout" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="dashboard-layout animate-in">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1000px", margin: "0 auto 2rem auto" }}>
        <div>
          <h2 className="dashboard-title">Traveler's Bucket List</h2>
          <p className="dashboard-subtitle">Places they plan to visit (or have already visited!)</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Create Your Own
        </button>
      </div>

      {error ? (
        <div className="error-alert" style={{ maxWidth: "1000px", margin: "0 auto" }}>{error}</div>
      ) : places.length === 0 ? (
        <div className="card glass-panel" style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", padding: "4rem 2rem" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>This bucket list is empty.</h3>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {places.map((place) => (
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
                  <span>{place.visited ? "✅ Visited" : "📍 Planned"}</span>
                </div>
              </div>
            </div>
          ))}
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

export default PublicBucketList;
