import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/register", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrapper animate-in">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Create An Account</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-alert">
              ⚠️ {error}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              onChange={handleChange}
              value={form.name}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@company.com"
              onChange={handleChange}
              value={form.email}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              value={form.password}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Create account
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;