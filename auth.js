import { auth, db } from './firebase-config.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    doc,
    getDoc,
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

// --- Auth Functions ---

const saveUserToDB = async (user) => {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photo: user.photoURL || 'assets/icons/icon-192.png',
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user to DB:", error);
    }
};

// 1. Google Login
const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        await saveUserToDB(result.user);
        console.log("User logged in via Google:", result.user.displayName);
        return result.user;
    } catch (error) {
        console.error("Google Login failed:", error);
        throw error;
    }
};

// 2. Email Login
const loginWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToDB(result.user);
        console.log("User logged in via Email:", result.user.email);
        return result.user;
    } catch (error) {
        console.error("Email Login failed:", error);
        throw error;
    }
};

// 3. Register with Email (for Test User / Future use)
const registerWithEmail = async (email, password, name) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Update Profile
        await updateProfile(user, {
            displayName: name,
            photoURL: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=059669&color=fff"
        });

        await saveUserToDB(user);
        console.log("User registered:", user.email);
        return user;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

// Legacy Login Wrapper (Default to Redirect or Popup)
const login = async () => {
    // Redirect to login page instead of popup for main action
    window.location.href = 'login.html';
};

// Logout Function
const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
        // Close profile menu if open
        const menu = getEl('profileDropdown');
        if (menu) menu.classList.remove('active');
        // Optional: Redirect to home
        // window.location.href = 'index.html'; 
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

// Role Management
window.checkUserRole = async (uid) => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists() && docSnap.data().role) {
            return docSnap.data().role;
        } else {
            return 'member';
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
        return 'member'; // Default to member on error
    }
};

// Global Auth Action Handler (for Dropdown)
window.handleAuthAction = () => {
    if (auth.currentUser) {
        logout();
    } else {
        login(); // Redirects to login.html
    }
};

// Update UI based on User State
const updateUI = async (user) => {
    // 1. Mobile Bottom Nav
    const mobBtn = getEl(uiIds.mobileAuthBtn);
    if (mobBtn) {
        if (user) {
            mobBtn.innerHTML = '<i class="fas fa-user-circle"></i><span>Perfil</span>';
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
        if (avatar) avatar.src = user.photoURL || 'assets/icons/icon-192.png';
        if (menuName) menuName.textContent = user.displayName || 'Usuario';
        if (menuEmail) menuEmail.textContent = user.email;
        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>';
        }

        // Determine Role
        const role = await window.checkUserRole(user.uid);
        window.currentUserRole = role;

        // Trigger Admin UI Update
        if (typeof window.updateAdminUI === 'function') {
            window.updateAdminUI();
        }

    } else {
        if (avatar) avatar.src = 'assets/icons/icon-192.png'; // Default
        if (menuName) menuName.textContent = 'Invitado';
        if (menuEmail) menuEmail.textContent = 'Inicia sesión para más';
        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
        }
        window.currentUserRole = 'guest';
        // Trigger Admin UI Update (Hide controls)
        if (typeof window.updateAdminUI === 'function') {
            window.updateAdminUI();
        }
    }

    // 3. Overlays (Protected Content)
    const overlays = [getEl(uiIds.galleryOverlay), getEl(uiIds.videoOverlay), getEl(uiIds.docsOverlay)];
    overlays.forEach(el => {
        if (el) el.style.display = user ? 'none' : 'flex';
    });

    // 4. Secure Data Loading Integration
    if (user) {
        if (typeof window.loadSecureContent === 'function') {
            window.loadSecureContent();
        }
    }

    // 5. Legacy/Desktop Nav
    const lBtn = getEl(uiIds.loginBtn);
    const uProf = getEl(uiIds.userProfile);
    const uName = getEl(uiIds.userName);
    const uAvatar = getEl(uiIds.userAvatar);

    if (user) {
        if (lBtn) lBtn.style.display = 'none';
        if (uProf) uProf.style.display = 'flex';
        if (uName) uName.textContent = (user.displayName || 'User').split(' ')[0];
        if (uAvatar) uAvatar.src = user.photoURL || 'assets/icons/icon-192.png';
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

// Export auth functions
export {
    auth,
    login,
    logout,
    updateUI,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail
};
