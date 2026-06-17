import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MapPage from "./pages/MapPage";
import BucketList from "./pages/BucketList";
import Recommendations from "./pages/Recommendations";
import PublicBucketList from "./pages/PublicBucketList";
import ExpenseTracker from "./pages/ExpenseTracker";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/bucket-list"
          element={
            <ProtectedRoute>
              <BucketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute>
              <ExpenseTracker />
            </ProtectedRoute>
          }
        />
        <Route path="/public-bucketlist/:userId" element={<PublicBucketList />} />
      </Routes>
    </>
  );
}

export default App;