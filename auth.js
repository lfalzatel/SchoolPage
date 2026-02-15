// ============================================================
//  auth.js  —  Green Force PWA
//  Usa signInWithRedirect en lugar de signInWithPopup para
//  evitar bloqueos de popup en Edge, Chrome móvil y Vercel.
// ============================================================

import { auth, db } from './firebase-config.js';
import {
    GoogleAuthProvider,
    signInWithRedirect,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

// -----------------------------------------------------------
//  GUARDAR USUARIO EN FIRESTORE
// -----------------------------------------------------------
async function saveUserToFirestore(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('No se pudo guardar en Firestore:', e.message);
    }
}

// -----------------------------------------------------------
//  LOGIN CON GOOGLE (Redirect — sin popup)
// -----------------------------------------------------------
export const loginWithGoogle = async () => {
    console.log("Starting loginWithGoogle process...");
    try {
        // Guarda la URL actual para volver después del redirect
        sessionStorage.setItem('authRedirectFrom', window.location.href);

        console.log("Calling signInWithRedirect with provider...");
        // Alert temporal para depuración visual
        // alert("Redirigiendo a Google... Por favor espera.");

        await signInWithRedirect(auth, provider);
        console.log("signInWithRedirect called successfully.");
    } catch (error) {
        console.error("Google Login failed (in auth.js):", error.code, error.message);
        alert("Fallo crítico al iniciar Google: " + error.message);
        throw error;
    }
};

// -----------------------------------------------------------
//  LOGIN CON EMAIL/CONTRASEÑA
// -----------------------------------------------------------
export const loginWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        console.error("Email Login failed:", error);
        throw error;
    }
};

// -----------------------------------------------------------
//  REGISTRO CON EMAIL/CONTRASEÑA
// -----------------------------------------------------------
export const registerWithEmail = async (email, password, name) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await saveUserToFirestore(result.user);
        return result.user;
    } catch (error) {
        console.error("Register failed:", error);
        throw error;
    }
};

// -----------------------------------------------------------
//  LOGOUT
// -----------------------------------------------------------
export const logout = async () => {
    try {
        await signOut(auth);
        const menu = document.getElementById('profileDropdown');
        if (menu) menu.classList.remove('active');
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

// -----------------------------------------------------------
//  MANEJAR EL RESULTADO DEL REDIRECT DE GOOGLE
//  Se ejecuta cuando el navegador vuelve de accounts.google.com
// -----------------------------------------------------------
async function handleRedirectResult() {
    console.log("Checking Google Redirect result...");
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            console.log("User logged in via Google:", result.user.displayName);
            await saveUserToFirestore(result.user);
            // Si estamos en login.html, redirigir a index
            if (window.location.pathname.includes('login') || window.location.pathname.endsWith('/')) {
                console.log("Redirect result found user, jumping to index.html");
                window.location.href = 'index.html';
            }
        } else {
            console.log("No redirect result found (normal page load).");
        }
    } catch (error) {
        console.error("Redirect result error:", error.code, error.message);
        // Mostrar alerta específica para el usuario
        if (error.code === 'auth/unauthorized-domain') {
            alert("Error: Este dominio no está autorizado en Firebase. Añade '" + window.location.hostname + "' en la consola de Firebase.");
        } else if (error.code !== 'auth/cancelled-popup-request') {
            alert("Error en el retorno de Google: " + error.message);
        }
    }
}

// Llamar al cargar la página
handleRedirectResult();

// -----------------------------------------------------------
//  ACCIÓN GLOBAL (Dropdown header)
// -----------------------------------------------------------
window.handleAuthAction = () => {
    if (auth.currentUser) {
        logout();
    } else {
        loginWithGoogle();
    }
};

// -----------------------------------------------------------
//  UI: Actualizar elementos según estado de sesión
// -----------------------------------------------------------
const uiIds = {
    mobileAuthBtn: 'mobileAuthBtn',
    headerProfileAvatar: 'headerProfileAvatar',
    menuProfileName: 'menuProfileName',
    menuProfileEmail: 'menuProfileEmail',
    menuLoginBtn: 'menuLoginBtn',
    loginBtn: 'loginBtn',
    logoutBtn: 'logoutBtn',
    userProfile: 'userProfile',
    userAvatar: 'userAvatar',
    userName: 'userName',
    galleryOverlay: 'galleryOverlay',
    videoOverlay: 'videoOverlay',
    docsOverlay: 'docsOverlay'
};

const getEl = (id) => document.getElementById(id);

const updateUI = (user) => {
    // 1. Botón móvil inferior
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
                loginWithGoogle();
            };
        }
    }

    // 2. Header avatar y dropdown
    const avatar = getEl(uiIds.headerProfileAvatar);
    const menuName = getEl(uiIds.menuProfileName);
    const menuEmail = getEl(uiIds.menuProfileEmail);
    const menuBtn = getEl(uiIds.menuLoginBtn);

    if (user) {
        if (avatar) avatar.src = user.photoURL || 'assets/icons/icon-192.png';
        if (menuName) menuName.textContent = user.displayName || 'Usuario';
        if (menuEmail) menuEmail.textContent = user.email || '';
        if (menuBtn) menuBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>';
    } else {
        if (avatar) avatar.src = 'assets/icons/icon-192.png';
        if (menuName) menuName.textContent = 'Invitado';
        if (menuEmail) menuEmail.textContent = 'Inicia sesión para acceder';
        if (menuBtn) menuBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
    }

    // 3. Overlays de contenido protegido
    ['galleryOverlay', 'videoOverlay', 'docsOverlay'].forEach(id => {
        const el = getEl(id);
        if (el) el.style.display = user ? 'none' : 'flex';
    });

    // 4. Nav de escritorio (legacy)
    const lBtn = getEl(uiIds.loginBtn);
    const uProf = getEl(uiIds.userProfile);
    const uName = getEl(uiIds.userName);
    const uAvatar = getEl(uiIds.userAvatar);

    if (user) {
        if (lBtn) lBtn.style.display = 'none';
        if (uProf) uProf.style.display = 'flex';
        if (uName) uName.textContent = (user.displayName || '').split(' ')[0];
        if (uAvatar) uAvatar.src = user.photoURL || '';
    } else {
        if (lBtn) lBtn.style.display = 'block';
        if (uProf) uProf.style.display = 'none';
    }

    // 5. Cargar contenido seguro tras login
    if (user && window.loadSecureContent) {
        window.loadSecureContent();
    }
};

// -----------------------------------------------------------
//  OBSERVADOR DE ESTADO
// -----------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Listeners para overlay buttons y nav legacy
document.querySelectorAll('.overlay-login-btn').forEach(btn => {
    btn.addEventListener('click', loginWithGoogle);
});

const lgBtn = getEl(uiIds.loginBtn);
if (lgBtn) lgBtn.addEventListener('click', loginWithGoogle);

const lgOutBtn = getEl(uiIds.logoutBtn);
if (lgOutBtn) lgOutBtn.addEventListener('click', logout);

export { auth };
console.log("Auth module loaded");