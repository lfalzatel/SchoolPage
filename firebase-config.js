// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0QFzN6ZZQGXhH1fcYdfx0-dcQ2XdYJ6g",
    authDomain: "green-force-pwa-2025.firebaseapp.com",
    projectId: "green-force-pwa-2025",
    storageBucket: "green-force-pwa-2025.firebasestorage.app",
    messagingSenderId: "385628439914",
    appId: "1:385628439914:web:520a75554db345afe91113"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
