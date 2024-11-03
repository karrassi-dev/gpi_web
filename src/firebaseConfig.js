// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_rOzqYGaWI9B6nz_OBMS48MSp78IfyS4",
  authDomain: "flutter-gpi.firebaseapp.com",
  projectId: "flutter-gpi",
  storageBucket: "flutter-gpi.firebasestorage.app",
  messagingSenderId: "677040760800",
  appId: "1:677040760800:web:5780b937ad672b388cad85",
  measurementId: "G-8DJVEWSPHJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
