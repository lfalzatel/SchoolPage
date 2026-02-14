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
const mobileAuthBtn = document.getElementById('mobileAuthBtn');

// ... (previous code)

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

        // Mobile Nav Update
        if (mobileAuthBtn) {
            mobileAuthBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i><span>Salir</span>';
            mobileAuthBtn.onclick = logout;
        }

        // Hide overlays -> Reveal content
        if (galleryOverlay) galleryOverlay.style.display = 'none';
        if (videoOverlay) videoOverlay.style.display = 'none';
        if (docsOverlay) docsOverlay.style.display = 'none';

    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';

        // Mobile Nav Update
        if (mobileAuthBtn) {
            mobileAuthBtn.innerHTML = '<i class="fas fa-user"></i><span>Login</span>';
            mobileAuthBtn.onclick = login;
        }

        // Show overlays -> Hide content
        if (galleryOverlay) galleryOverlay.style.display = 'flex';
        if (videoOverlay) videoOverlay.style.display = 'flex';
        if (docsOverlay) docsOverlay.style.display = 'flex';
    }
};

// ... (rest of code)
