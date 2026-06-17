import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ExpenseTracker = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tripName: "",
    amount: "",
    category: "Food",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/api/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tripName || !form.amount) return;
    setSubmitting(true);
    try {
      const res = await api.post("/api/expenses", form);
      setExpenses([res.data, ...expenses]);
      setForm({ ...form, amount: "", description: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete expense");
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="dashboard-layout animate-in">
      <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1000px", margin: "0 auto 2rem auto" }}>
        <div>
          <h2 className="dashboard-title">Trip Expenses</h2>
          <p className="dashboard-subtitle">Track your travel spending easily.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Summary Card */}
        <div className="card glass-panel" style={{ padding: "2rem", textAlign: "center", background: "var(--bg-card)" }}>
          <h3 style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: "500" }}>Total Spent</h3>
          <h1 style={{ color: "var(--text-primary)", fontSize: "3rem", margin: 0 }}>${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
          
          {/* Add Expense Form */}
          <div className="card glass-panel" style={{ height: "fit-content" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Add Expense</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ color: "var(--text-primary)", marginBottom: "0.5rem", display: "block" }}>Trip / Destination</label>
                <input 
                  type="text" 
                  value={form.tripName}
                  onChange={(e) => setForm({...form, tripName: e.target.value})}
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-main)", color: "var(--text-main)" }}
                  placeholder="e.g. Paris Trip"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "var(--text-primary)", marginBottom: "0.5rem", display: "block" }}>Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-main)", color: "var(--text-main)" }}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "var(--text-primary)", marginBottom: "0.5rem", display: "block" }}>Category</label>
                <select 
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-main)", color: "var(--text-main)" }}
                >
                  <option value="Food" style={{ color: "#000" }}>Food & Dining</option>
                  <option value="Transport" style={{ color: "#000" }}>Transportation</option>
                  <option value="Accommodation" style={{ color: "#000" }}>Accommodation</option>
                  <option value="Activities" style={{ color: "#000" }}>Activities & Tours</option>
                  <option value="Other" style={{ color: "#000" }}>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: "var(--text-primary)", marginBottom: "0.5rem", display: "block" }}>Description</label>
                <input 
                  type="text" 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="form-input"
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border-strong)", background: "var(--bg-main)", color: "var(--text-main)" }}
                  placeholder="e.g. Lunch at Cafe"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: "0.8rem", marginTop: "0.5rem" }}>
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>

          {/* Expenses List */}
          <div className="card glass-panel">
            <h3 style={{ marginBottom: "1.5rem" }}>Recent Expenses</h3>
            {loading ? (
              <p>Loading...</p>
            ) : expenses.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No expenses recorded yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {expenses.map((expense) => (
                  <div key={expense._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--bg-main)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.3rem 0", color: "var(--text-primary)" }}>{expense.tripName}</h4>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        {expense.category} {expense.description && `- ${expense.description}`}
                      </p>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--primary)" }}>
                        ${expense.amount.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => deleteExpense(expense._id)}
                        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1rem" }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
