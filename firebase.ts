// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCGcOLdvploYepcVFrM7XGC-HUf7NUqWXo",
  authDomain: "timeline-app-2a89f.firebaseapp.com",
  projectId: "timeline-app-2a89f",
  storageBucket: "timeline-app-2a89f.firebasestorage.app",
  messagingSenderId: "620051680129",
  appId: "1:620051680129:web:6b3cb8c898ea61882cf680",
  measurementId: "G-V5M6W9B894"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);