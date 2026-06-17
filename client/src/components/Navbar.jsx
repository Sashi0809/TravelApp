import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand text-gradient">
        TravelAI
      </Link>

      <div className="nav-links">
        <Link to="/map" className="nav-link">Explore</Link>
        {!user ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        ) : (
          <>
            <Link to="/recommendations" className="nav-link">Recommendations</Link>
            <Link to="/bucket-list" className="nav-link">Bucket List</Link>
            <Link to="/expenses" className="nav-link">Expenses</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={logout} className="btn btn-danger" style={{ marginLeft: "1rem" }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;