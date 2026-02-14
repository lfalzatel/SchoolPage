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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// UI Element IDs
const uiIds = {
    mobileAuthBtn: 'mobileAuthBtn',
    headerProfileAvatar: 'headerProfileAvatar',
    menuProfileName: 'menuProfileName',
    menuProfileEmail: 'menuProfileEmail',
    menuLoginBtn: 'menuLoginBtn',
    // Legacy/Desktop
    loginBtn: 'loginBtn',
    logoutBtn: 'logoutBtn',
    userProfile: 'userProfile',
    userAvatar: 'userAvatar',
    userName: 'userName',
    // Overlays
    galleryOverlay: 'galleryOverlay',
    videoOverlay: 'videoOverlay',
    docsOverlay: 'docsOverlay'
};

const getEl = (id) => document.getElementById(id);

// Login Function
const login = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });
        console.log("User logged in:", user.displayName);
    } catch (error) {
        console.error("Login failed:", error);
        alert("Error al iniciar sesión: " + error.message);
    }
};

// Logout Function
const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
        // Close profile menu if open
        const menu = getEl('profileDropdown');
        if (menu) menu.classList.remove('active');
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

// Global Auth Action Handler (for Dropdown)
window.handleAuthAction = () => {
    if (auth.currentUser) {
        logout();
    } else {
        login();
    }
};

// Update UI based on User State
const updateUI = (user) => {
    // 1. Mobile Bottom Nav
    const mobBtn = getEl(uiIds.mobileAuthBtn);
    if (mobBtn) {
        // Remove existing listeners to avoid duplicates if called multiple times (though replace element is better, strict update is fine)
        if (user) {
            mobBtn.innerHTML = '<i class="fas fa-user-circle"></i><span>Perfil</span>';
            // If user clicks Profile in bottom nav, toggle the top menu
            mobBtn.onclick = (e) => {
                e.preventDefault();
                if (window.toggleProfileMenu) window.toggleProfileMenu();
            };
        } else {
            mobBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Login</span>';
            mobBtn.onclick = (e) => {
                e.preventDefault();
                login();
            };
        }
    }

    // 2. Header & Profile Dropdown
    const avatar = getEl(uiIds.headerProfileAvatar);
    const menuName = getEl(uiIds.menuProfileName);
    const menuEmail = getEl(uiIds.menuProfileEmail);
    const menuBtn = getEl(uiIds.menuLoginBtn);

    if (user) {
        if (avatar) avatar.src = user.photoURL;
        if (menuName) menuName.textContent = user.displayName;
        if (menuEmail) menuEmail.textContent = user.email;
        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>';
            // onclick is handled by handleAuthAction global
        }
    } else {
        if (avatar) avatar.src = 'assets/icons/icon-192.png'; // Default
        if (menuName) menuName.textContent = 'Invitado';
        if (menuEmail) menuEmail.textContent = 'Inicia sesión para acceder';
        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
        }
    }

    // 3. Overlays (Protected Content)
    const overlays = [getEl(uiIds.galleryOverlay), getEl(uiIds.videoOverlay), getEl(uiIds.docsOverlay)];
    overlays.forEach(el => {
        if (el) el.style.display = user ? 'none' : 'flex';
    });

    // 4. Legacy/Desktop Nav
    const lBtn = getEl(uiIds.loginBtn);
    const loBtn = getEl(uiIds.logoutBtn);
    const uProf = getEl(uiIds.userProfile);
    const uName = getEl(uiIds.userName);
    const uAvatar = getEl(uiIds.userAvatar);

    if (user) {
        if (lBtn) lBtn.style.display = 'none';
        if (uProf) uProf.style.display = 'flex';
        if (uName) uName.textContent = user.displayName.split(' ')[0];
        if (uAvatar) uAvatar.src = user.photoURL;
    } else {
        if (lBtn) lBtn.style.display = 'block';
        if (uProf) uProf.style.display = 'none';
    }
};

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Event Listeners for Overlays
document.querySelectorAll('.overlay-login-btn').forEach(btn => {
    btn.addEventListener('click', login);
});

// Legacy Listeners
const lgBtn = getEl(uiIds.loginBtn);
if (lgBtn) lgBtn.addEventListener('click', login);

const lgOutBtn = getEl(uiIds.logoutBtn);
if (lgOutBtn) lgOutBtn.addEventListener('click', logout);

console.log("Auth module loaded");
