import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../utils/api";

const PlaceDetailsModal = ({ isOpen, onClose, place }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [error, setError] = useState("");

  // Reviews state
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Weather state
  const [weather, setWeather] = useState(null);

  const fetchReviews = async (placeName) => {
    try {
      const res = await api.get(`/api/reviews/${encodeURIComponent(placeName)}`);
      setReviewsData({
        reviews: res.data.reviews,
        averageRating: res.data.averageRating,
      });
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    if (!isOpen || !place) return;

    const fetchPlaceDetails = async () => {
      setLoading(true);
      setError("");
      setDetails(null);
      setNearby([]);

      try {
        const placeName = place.name || place.City;
        if (!placeName) {
          throw new Error("Invalid place data");
        }

        // Fetch reviews asynchronously
        fetchReviews(placeName);

        // 1. Fetch summary, image, and coordinates using Wikipedia search
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
          placeName
        )}&gsrlimit=1&prop=extracts|pageimages|coordinates&exintro&explaintext&pithumbsize=600&format=json&origin=*`;

        const response = await axios.get(wikiUrl);
        const pages = response.data.query?.pages;
        if (!pages || Object.keys(pages)[0] === "-1") {
          throw new Error("Place not found on Wikipedia.");
        }

        const pageId = Object.keys(pages)[0];
        const pageData = pages[pageId];

        const fetchedDetails = {
          title: pageData.title,
          summary: pageData.extract || "No description available.",
          imageUrl: pageData.thumbnail ? pageData.thumbnail.source : null,
          lat: pageData.coordinates ? pageData.coordinates[0].lat : null,
          lon: pageData.coordinates ? pageData.coordinates[0].lon : null,
        };

        setDetails(fetchedDetails);

        // Determine coordinates to use (prefer passed in props, fallback to wiki coords)
        const lat = place.lat || place.latitude || fetchedDetails.lat;
        const lon = place.lon || place.longitude || fetchedDetails.lon;

        // Fetch Weather if we have coordinates
        if (lat && lon) {
          try {
            const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            setWeather(weatherRes.data.current_weather);
          } catch (weatherErr) {
            console.error("Failed to fetch weather", weatherErr);
          }
        }

        // 2. Fetch nearby places if we have coordinates
        if (lat && lon) {
          const nearbyUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=6&format=json&origin=*`;
          const nearbyRes = await axios.get(nearbyUrl);
          const nearbyPlaces = nearbyRes.data.query?.geosearch || [];
          
          // Filter out the place itself if it appears in the results
          const filteredNearby = nearbyPlaces.filter(
            (p) => p.title.toLowerCase() !== fetchedDetails.title.toLowerCase()
          );
          
          setNearby(filteredNearby.slice(0, 5)); // Keep up to 5
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch place details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceDetails();
  }, [isOpen, place]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    setReviewLoading(true);
    try {
      const placeName = place.name || place.City;
      await api.post("/api/reviews", {
        placeName,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      // Refresh reviews
      await fetchReviews(placeName);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel animate-in" 
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Gathering information... 🌍</p>
          </div>
        ) : error ? (
          <div className="modal-error">
            <h3>Oops!</h3>
            <p>{error}</p>
          </div>
        ) : details ? (
          <div className="modal-body">
            {details.imageUrl && (
              <div className="modal-image-container">
                <img src={details.imageUrl} alt={details.title} className="modal-image" />
              </div>
            )}
            
            <div className="modal-info">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h2 className="modal-title" style={{ marginBottom: 0 }}>{details.title}</h2>
                {reviewsData.reviews.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,215,0,0.1)", padding: "0.5rem 1rem", borderRadius: "20px" }}>
                    <span style={{ fontSize: "1.2rem", color: "#FFD700" }}>★</span>
                    <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{reviewsData.averageRating}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>({reviewsData.reviews.length} reviews)</span>
                  </div>
                )}
              </div>
              <div className="modal-summary">
                <p>{details.summary}</p>
              </div>

              {/* Weather & Quick Links Section */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem", alignItems: "center" }}>
                {weather && (
                  <div style={{ background: "var(--bg-main)", padding: "0.5rem 1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>🌤️</span>
                    <span style={{ fontWeight: "600" }}>{weather.temperature}°C</span>
                  </div>
                )}
                
                <a 
                  href={`https://www.skyscanner.com/transport/flights/anywhere/${encodeURIComponent(details.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  ✈️ Find Flights
                </a>

                <a 
                  href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(details.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  🏨 Find Hotels
                </a>
              </div>

              {nearby.length > 0 && (
                <div className="modal-nearby">
                  <h3 className="modal-nearby-title">Places to Visit Nearby</h3>
                  <ul className="modal-nearby-list">
                    {nearby.map((n) => (
                      <li key={n.pageid} className="modal-nearby-item">
                        <a 
                          href={`https://en.wikipedia.org/?curid=${n.pageid}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          📍 {n.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviews Section */}
              <div className="modal-reviews" style={{ marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
                <h3 className="modal-nearby-title">Community Reviews</h3>
                
                {/* Add Review Form */}
                <form onSubmit={submitReview} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem", background: "var(--bg-main)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Leave a Review</h4>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <label style={{ color: "var(--text-secondary)" }}>Rating:</label>
                    <select 
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                      style={{ padding: "0.5rem", borderRadius: "8px", background: "var(--bg-main)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                    >
                      {[5,4,3,2,1].map(num => (
                        <option key={num} value={num}>{num} Stars</option>
                      ))}
                    </select>
                  </div>
                  <textarea 
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                    rows="3"
                    style={{ padding: "0.8rem", borderRadius: "8px", background: "var(--bg-main)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", resize: "vertical" }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={reviewLoading} style={{ alignSelf: "flex-start", padding: "0.6rem 1.5rem" }}>
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>

                {/* Existing Reviews */}
                {reviewsData.reviews.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No reviews yet. Be the first to review!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {reviewsData.reviews.map((review) => (
                      <div key={review._id} style={{ padding: "1rem", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: "600", color: "var(--color-primary)" }}>{review.userName}</span>
                          <span style={{ color: "#FFD700" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>{review.comment}</p>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
                          {new Date(review.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PlaceDetailsModal;
