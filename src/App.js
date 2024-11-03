// App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Login from "./components/login/Login";
import AdminDashboard from "./components/Admin/AdminDashboard";
import EmployeeDashboard from "./components/Employe/EmployeeDashboard";
import ProtectedRoute from "./ProtectedRoute";

const AUTO_LOGOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auto-logout based on 24-hour limit
    const checkAutoLogout = () => {
      const loginTimestamp = localStorage.getItem("loginTimestamp");
      if (loginTimestamp && Date.now() - loginTimestamp > AUTO_LOGOUT_DURATION) {
        signOut(auth)
          .then(() => {
            setIsAuthenticated(false);
            localStorage.clear();
          })
          .catch((error) => console.error("Auto-logout error:", error));
      }
    };

    // Set Firebase persistence and track authentication state
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setIsAuthenticated(true);
            checkAutoLogout();
          } else {
            setIsAuthenticated(false);
          }
          setLoading(false); // Set loading to false after auth state is determined
        });
        return unsubscribe;
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin-dashboard/*"
          element={<ProtectedRoute element={AdminDashboard} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/employee-dashboard"
          element={<ProtectedRoute element={EmployeeDashboard} isAuthenticated={isAuthenticated} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
