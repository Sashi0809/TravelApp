import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    try {
      const { data } = await api.post("/api/auth/login", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper animate-in">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">Welcome Back</h2>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-alert">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Sign In
          </button>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;