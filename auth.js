import { auth, db } from './firebase-config.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    doc,
    setDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// UI Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userProfile = document.getElementById('userProfile');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');

// Overlay Elements
const galleryOverlay = document.getElementById('galleryOverlay');
const videoOverlay = document.getElementById('videoOverlay');
const docsOverlay = document.getElementById('docsOverlay');
const overlayLoginBtns = document.querySelectorAll('.overlay-login-btn');

// Login Function
const login = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User logged in:", user.displayName);

        await saveUserToFirestore(user);
        await logVisit(user);

    } catch (error) {
        console.error("Login failed:", error.message);
        alert("Error al iniciar sesión: " + error.message);
    }
};

// Logout Function
const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
        alert("Has cerrado sesión correctamente.");
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
};

// Save User to Firestore
const saveUserToFirestore = async (user) => {
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error("Error saving user profile:", e);
    }
};

// Log Visit
const logVisit = async (user) => {
    try {
        await addDoc(collection(db, "visits"), {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (e) {
        console.error("Error logging visit:", e);
    }
};

// Update UI based on Auth State
const updateUI = (user) => {
    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            if (userAvatar) userAvatar.src = user.photoURL;
            if (userName) userName.textContent = user.displayName.split(' ')[0]; // First name only
        }

        // Hide overlays -> Reveal content
        if (galleryOverlay) galleryOverlay.style.display = 'none';
        if (videoOverlay) videoOverlay.style.display = 'none';
        if (docsOverlay) docsOverlay.style.display = 'none';

    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';

        // Show overlays -> Hide content
        if (galleryOverlay) galleryOverlay.style.display = 'flex';
        if (videoOverlay) videoOverlay.style.display = 'flex';
        if (docsOverlay) docsOverlay.style.display = 'flex';
    }
};

// Event Listeners
if (loginBtn) loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);

overlayLoginBtns.forEach(btn => {
    btn.addEventListener('click', login);
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});
