// Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save login timestamp, user ID, and role in localStorage
      localStorage.setItem("loginTimestamp", Date.now());
      localStorage.setItem("userId", user.uid);
      localStorage.removeItem("userRole");


      // Get user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // Store the user's role in localStorage for role-based routing
        localStorage.setItem("userRole", role);

        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          email,
        });

        await setDoc(doc(db, "loginRecords", user.uid), {
          userId: user.uid,
          email,
          loginTimestamp: serverTimestamp(),
        });

        // Navigate based on role
        if (role === "Admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      } else {
        setError("User does not exist in Firestore.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Welcome</h1>
      <p>Enter your credentials to log in</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {/* <p className="signup-link">
        Don't have an account? <a href="/signup">Sign Up</a>
      </p> */}
    </div>
  );
};

export default Login;
