// ============================================================
//  auth.js  —  Green Force PWA
//  Changed to signInWithPopup to avoid 404 handler errors
// ============================================================

import { auth, db } from './firebase-config.js';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
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

        // Define Admins list (consistent with updateUI)
        const admins = ['greenforceiebb@gmail.com', 'lfalzatel@gmail.com'];
        const role = admins.includes(user.email) ? 'admin' : 'miembro';

        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            role: role, // Persist role for Firestore Rules
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('No se pudo guardar en Firestore:', e.message);
    }
}

// -----------------------------------------------------------
//  LOGIN CON GOOGLE (POPUP)
// -----------------------------------------------------------
export const loginWithGoogle = async () => {
    console.log("Starting loginWithGoogle process with POPUP...");
    try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, provider);
        console.log("Popup Login Success:", result.user.displayName);

        await saveUserToFirestore(result.user);

        // onAuthStateChanged in login.html will handle the redirect, 
        // but we can force it here too for snappy feel.
        if (window.location.pathname.includes('login') || window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
        return result.user;

    } catch (error) {
        console.error("Google Login Popup failed:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            console.warn("Popup closed by user");
        } else {
            alert("Error al iniciar sesión: " + error.message);
        }
        throw error;
    }
};

// -----------------------------------------------------------
//  HANDLERS (No-op for Redirect compatibility)
// -----------------------------------------------------------
// Deprecated: No needed for Popup flow, kept to avoid breaking imports in login.html
export const handleRedirectAuth = async () => {
    console.log("handleRedirectAuth called (noop for popup mode)");
    return null;
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
        // Clear UI or redirect if necessary
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

// -----------------------------------------------------------
//  TEMA (Modo Oscuro / Claro / Sistema)
// -----------------------------------------------------------
window.setTheme = (theme) => {
    const body = document.body;
    body.classList.remove('dark-mode');

    if (theme === 'dark') {
        body.classList.add('dark-mode');
    } else if (theme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-mode');
        }
    }
    localStorage.setItem('green-force-theme', theme);
    // Compatibility with old key just in case
    localStorage.setItem('selected-theme', theme);

    updateThemeSelector(theme);
};

const updateThemeSelector = (theme) => {
    // 1. Update Radio buttons (if exist)
    const input = document.getElementById(`theme-${theme}`);
    if (input) input.checked = true;

    // 2. Update Premium buttons (.theme-btn)
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        // Check if the onclick attribute or the button itself is related to this theme
        if (btn.getAttribute('onclick')?.includes(`'${theme}'`)) {
            btn.classList.add('active');
        }
    });
};

// Inicializar tema al cargar
const savedTheme = localStorage.getItem('green-force-theme') || 'system';
window.setTheme(savedTheme);

// Escuchar cambios de sistema si está en modo auto
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('green-force-theme') === 'system') {
        window.setTheme('system');
    }
});

// -----------------------------------------------------------
//  MANEJAR EL RESULTADO DEL REDIRECT DE GOOGLE
//  (Lógica centralizada en handleRedirectAuth exportada)
// -----------------------------------------------------------
// handleRedirectResult eliminado para evitar llamadas duplicadas.
// Usar handleRedirectAuth() explícitamente donde sea necesario.

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
    // 1. Botón móvil inferior - Removido el acceso a perfil para evitar redundancia
    // El menú inferior ahora solo muestra opciones de navegación principales

    // 2. Header avatar y pill info
    const avatar = getEl(uiIds.headerProfileAvatar);
    const headerName = getEl('headerUserName');
    const headerRole = getEl('headerUserRole');
    const menuName = getEl(uiIds.menuProfileName);
    const menuEmail = getEl(uiIds.menuProfileEmail);
    const menuBtn = getEl(uiIds.menuLoginBtn);

    if (user) {
        if (avatar) avatar.src = user.photoURL || 'assets/icons/icon-192.png';
        if (headerName) headerName.textContent = (user.displayName || 'Usuario').split(' ')[0];

        // Define Admins
        const admins = ['greenforceiebb@gmail.com', 'lfalzatel@gmail.com'];
        const uniqueRole = admins.includes(user.email) ? 'admin' : 'miembro';
        window.currentUserRole = uniqueRole; // Set global for gallery.js

        // Display Role
        const roleDisplay = uniqueRole === 'admin' ? 'Admin' : 'Miembro';
        if (headerRole) headerRole.textContent = roleDisplay;

        if (menuName) menuName.textContent = user.displayName || 'Usuario';
        if (menuEmail) menuEmail.textContent = user.email || '';

        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>';
            menuBtn.classList.remove('btn-login');
            menuBtn.classList.add('btn-logout');
        }
    } else {
        window.currentUserRole = 'visitor';
        if (avatar) avatar.src = 'assets/icons/icon-192.png';
        if (headerName) headerName.textContent = 'Invitado';
        if (headerRole) headerRole.textContent = 'Visitante';

        if (menuName) menuName.textContent = 'Invitado';
        if (menuEmail) menuEmail.textContent = 'Inicia sesión para acceder';

        if (menuBtn) {
            menuBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
            menuBtn.classList.remove('btn-logout');
            menuBtn.classList.add('btn-login');
        }
    }

    // 3. Overlays de contenido protegido - MODIFICADO: Galería pública
    ['videoOverlay', 'docsOverlay'].forEach(id => { // galleryOverlay removed
        const el = getEl(id);
        if (el) {
            el.style.display = user ? 'none' : 'flex';
        }
    });

    // Explicitly hide gallery overlay if it exists (cleanup)
    const galOverlay = getEl('galleryOverlay');
    if (galOverlay) galOverlay.style.display = 'none';

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