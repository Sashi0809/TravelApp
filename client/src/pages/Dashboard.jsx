import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bucketList, setBucketList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bucketRes, expensesRes] = await Promise.all([
          api.get("/api/bucketlist"),
          api.get("/api/expenses")
        ]);
        setBucketList(bucketRes.data);
        setExpenses(expensesRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Stats
  const totalSaved = bucketList.length;
  const totalVisited = bucketList.filter(item => item.visited).length;
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Recent Activity
  const recentBucketList = [...bucketList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div className="dashboard-layout animate-in">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <p className="dashboard-subtitle">
          Welcome back, {user?.name || "Traveler"}! Here is your travel overview.
        </p>
      </div>

      {loading ? (
        <p>Loading your data...</p>
      ) : (
        <>
          {/* Quick Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            <div className="card glass-panel" style={{ padding: "1.5rem", textAlign: "center", borderTop: "4px solid var(--color-primary)" }}>
              <h4 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Total Spent</h4>
              <h2 style={{ fontSize: "2rem", margin: 0, color: "var(--text-main)" }}>${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <div className="card glass-panel" style={{ padding: "1.5rem", textAlign: "center", borderTop: "4px solid #10b981" }}>
              <h4 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Places Visited</h4>
              <h2 style={{ fontSize: "2rem", margin: 0, color: "var(--text-main)" }}>{totalVisited}</h2>
            </div>
            <div className="card glass-panel" style={{ padding: "1.5rem", textAlign: "center", borderTop: "4px solid #f59e0b" }}>
              <h4 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>Bucket List Items</h4>
              <h2 style={{ fontSize: "2rem", margin: 0, color: "var(--text-main)" }}>{totalSaved}</h2>
            </div>
          </div>

          {/* Activity Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
            
            {/* Recent Expenses */}
            <div className="card glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Recent Expenses
                <button className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => navigate("/expenses")}>View All</button>
              </h3>
              {recentExpenses.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No expenses yet.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {recentExpenses.map(exp => (
                    <li key={exp._id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
                      <div>
                        <span style={{ display: "block", fontWeight: "600", color: "var(--text-main)" }}>{exp.tripName}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{exp.category}</span>
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--text-main)" }}>${exp.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Bucket List */}
            <div className="card glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Recent Bucket List
                <button className="btn btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }} onClick={() => navigate("/bucket-list")}>View All</button>
              </h3>
              {recentBucketList.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Bucket list is empty.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  {recentBucketList.map(item => (
                    <li key={item._id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem", alignItems: "center" }}>
                      <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{item.name}</span>
                      {item.visited ? (
                        <span style={{ fontSize: "0.8rem", background: "#d1fae5", color: "#065f46", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>Visited</span>
                      ) : (
                        <span style={{ fontSize: "0.8rem", background: "#fef3c7", color: "#92400e", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>Planned</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* Navigation Cards */}
          <h3 style={{ marginBottom: "1.5rem", color: "var(--text-main)" }}>Quick Actions</h3>
          <div className="dashboard-grid">
            <div className="card glass-panel dashboard-card">
              <h3 className="profile-card-title">Recommendations</h3>
              <p className="profile-text" style={{ marginBottom: "1rem" }}>
                Get personalized travel recommendations based on your style.
              </p>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate("/recommendations")}
              >
                Start Planning ✨
              </button>
            </div>

            <div className="card glass-panel dashboard-card">
              <h3 className="profile-card-title">Explore Map</h3>
              <p className="profile-text" style={{ marginBottom: "1rem" }}>
                Browse the interactive map to discover amazing places.
              </p>
              <button
                className="btn btn-primary btn-full"
                onClick={() => navigate("/map")}
              >
                Open Map 🌍
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;