// ============================================================
//  layout.js — Green Force PWA
//  Componente compartido de Header + Bottom Nav
//  Uso: import { initLayout } from './layout.js';
//       initLayout({ activeNav: 'asistencia' });
// ============================================================

import { auth } from './firebase-config.js';
import {
    doc, getDoc, query, collection, where, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ── Opciones por defecto ────────────────────────────────────────────────────
const DEFAULTS = {
    activeNav: null,       // 'inicio'|'cronograma'|'galeria'|'asistencia'|'chat'
    logoHref:  'index.html',
    basePath:  '',         // '' para raíz, '../' si está en subdirectorio
};

// ── Configuración del Bottom Nav (única fuente de verdad) ───────────────────
function getNavItems(basePath, activeNav) {
    const items = [
        { id: 'nav-inicio',     href: `${basePath}index.html#sobre`,       icon: 'fa-home',       label: 'Inicio',      key: 'inicio' },
        { id: 'nav-cronograma', href: `${basePath}index.html#cronograma`,  icon: 'fa-leaf',       label: 'Cronograma',  key: 'cronograma' },
        { id: 'nav-galeria',    href: `${basePath}index.html#galeria`,      icon: 'fa-images',     label: 'Galería',     key: 'galeria' },
        { id: 'nav-asistencia', href: `${basePath}formulario_asistencia_eventos.html`, icon: 'fa-poll', label: 'Asistencia', key: 'asistencia' },
        {
            id: 'nav-chat',
            href: 'https://chat.whatsapp.com/L0hrcQ9JWmUB5DQui9ZrXv',
            icon: 'fa-comments',
            label: 'Chat',
            key: 'chat',
            external: true
        },
    ];

    // Auto-detectar activo por URL si no se pasa explícitamente
    const currentKey = activeNav || detectActiveNav();

    return items.map(item => ({
        ...item,
        isActive: item.key === currentKey,
    }));
}

function detectActiveNav() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('formulario_asistencia')) return 'asistencia';
    if (path.includes('gallery'))               return 'galeria';
    if (path.includes('index') || path.endsWith('/')) return 'inicio';
    return null;
}

// ── HTML del Header ─────────────────────────────────────────────────────────
function buildHeaderHTML(basePath) {
    return `
  <header class="app-header" id="app-header-root">
    <div class="header-left">
      <img src="${basePath}assets/images/1. logo 3.jpg" alt="Logo Green Force" class="header-logo"
           onclick="window.location.href='${basePath}index.html'" style="cursor:pointer;">
      <div class="header-brand" onclick="window.location.href='${basePath}index.html'" style="cursor:pointer;">
        <span class="header-title">Green Force</span>
        <span class="header-subtitle">Sembrando Futuro</span>
      </div>
    </div>

    <div class="header-actions">
      <div class="notifications-wrapper">
        <div class="notification-bell-btn" id="notifBellBtn">
          <i class="fas fa-bell"></i>
          <span id="notificationBadge" class="notification-badge" style="display:none;">0</span>
        </div>
        <div id="notificationsDropdown" class="notifications-dropdown">
          <div class="notifications-header">
            <h3><i class="fas fa-calendar-star" style="color:#10b981;margin-right:6px;"></i>Próximos Eventos</h3>
          </div>
          <div id="notificationList" class="notification-list">
            <div class="notification-loader"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-menu-container">
      <div class="header-avatar-container" id="profilePillBtn">
        <img src="${basePath}assets/icons/icon-192.png" alt="Profile" id="headerProfileAvatar" class="header-avatar">
        <div class="user-info-pill">
          <span id="headerUserName" class="user-name-pill">Invitado</span>
          <span id="headerUserRole" class="user-role-pill">Visitante</span>
        </div>
        <i class="fas fa-chevron-down pill-chevron"></i>
      </div>

      <div id="profileDropdown" class="profile-dropdown">
        <div class="dropdown-card">
          <div class="user-card-header">
            <div class="user-card-info">
              <span id="menuProfileName" class="user-card-name">Invitado</span>
              <span id="menuProfileEmail" class="user-card-email">Inicia sesión para más</span>
            </div>
          </div>

          <div class="dropdown-menu-list">
            <a href="${basePath}index.html" class="menu-item">
              <div class="menu-item-icon bg-blue"><i class="fas fa-home"></i></div>
              <span>Inicio</span>
              <i class="fas fa-chevron-right arrow-link"></i>
            </a>
            <a href="${basePath}formulario_asistencia_eventos.html" class="menu-item">
              <div class="menu-item-icon bg-green"><i class="fas fa-poll"></i></div>
              <span>Asistencia</span>
              <i class="fas fa-chevron-right arrow-link"></i>
            </a>
            <a href="${basePath}index.html#galeria" class="menu-item">
              <div class="menu-item-icon bg-blue"><i class="fas fa-images"></i></div>
              <span>Galería</span>
              <i class="fas fa-chevron-right arrow-link"></i>
            </a>

            <div class="dropdown-theme-section">
              <span class="theme-label">TEMA</span>
              <div class="theme-selector-group">
                <button class="theme-btn" id="themeLight" onclick="window.setTheme('light')" title="Modo Claro">
                  <i class="fas fa-sun"></i>
                </button>
                <button class="theme-btn" id="themeDark" onclick="window.setTheme('dark')" title="Modo Oscuro">
                  <i class="fas fa-moon"></i>
                </button>
                <button class="theme-btn" id="themeSystem" onclick="window.setTheme('system')" title="Seguir Sistema">
                  <i class="fas fa-desktop"></i>
                </button>
              </div>
            </div>

            <div class="dropdown-footer">
              <button class="logout-pill-btn" id="menuLoginBtn" onclick="window.handleAuthAction()">
                <i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>`;
}

// ── HTML del Bottom Nav ─────────────────────────────────────────────────────
function buildNavHTML(navItems) {
    const itemsHTML = navItems.map(item => {
        const activeClass = item.isActive ? ' active' : '';
        const external    = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `
    <a id="${item.id}" href="${item.href}" class="nav-item${activeClass}"${external}>
      <i class="fas ${item.icon}"></i>
      <span>${item.label}</span>
    </a>`;
    }).join('');

    return `<nav class="bottom-nav" id="bottom-nav-root">${itemsHTML}\n  </nav>`;
}

// ── Fondo dinámico ──────────────────────────────────────────────────────────
function initBackground(basePath) {
    const container = document.getElementById('app-background');
    if (!container) return;

    const images = [
        'assets/images/WhatsApp Image 2024-05-23 at 8.01.21 AM (1).jpeg',
        'assets/images/WhatsApp Image 2024-05-23 at 8.01.21 AM.jpeg',
        'assets/images/WhatsApp Image 2024-05-23 at 8.01.22 AM.jpeg',
    ];

    // Crear slides
    images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'bg-slide' + (i === 0 ? ' active' : '');
        slide.style.backgroundImage = `url('${basePath}${src}')`;
        container.appendChild(slide);
    });

    // Rotar slides cada 8 s
    let current = 0;
    const slides = container.querySelectorAll('.bg-slide');
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 8000);
}

// ── Tema (Claro / Oscuro / Sistema) ────────────────────────────────────────
function initTheme() {
    window.setTheme = (theme) => {
        document.body.classList.remove('dark-mode');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }
        localStorage.setItem('green-force-theme', theme);
        localStorage.setItem('selected-theme', theme);
        updateThemeButtons(theme);
    };

    function updateThemeButtons(theme) {
        ['light','dark','system'].forEach(t => {
            const btn = document.getElementById(`theme${t.charAt(0).toUpperCase() + t.slice(1)}`);
            if (btn) btn.classList.toggle('active', t === theme);
        });
    }

    const saved = localStorage.getItem('green-force-theme') || 'system';
    window.setTheme(saved);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('green-force-theme') === 'system') window.setTheme('system');
    });
}

// ── Dropdowns (perfil y notificaciones) ────────────────────────────────────
function initDropdowns() {
    const profileDropdown = document.getElementById('profileDropdown');
    const notifDropdown   = document.getElementById('notificationsDropdown');
    const profilePill     = document.getElementById('profilePillBtn');
    const notifBell       = document.getElementById('notifBellBtn');

    if (profilePill && profileDropdown) {
        profilePill.addEventListener('click', () => {
            profileDropdown.classList.toggle('active');
            if (notifDropdown) notifDropdown.classList.remove('active');
        });
    }

    if (notifBell && notifDropdown) {
        notifBell.addEventListener('click', () => {
            notifDropdown.classList.toggle('active');
            if (profileDropdown) profileDropdown.classList.remove('active');
        });
    }

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (profileDropdown && !e.target.closest('.profile-menu-container'))
            profileDropdown.classList.remove('active');
        if (notifDropdown && !e.target.closest('.notifications-wrapper'))
            notifDropdown.classList.remove('active');
    });

    // Exponer globalmente por compatibilidad con onclick inline en index.html
    window.toggleProfileMenu    = () => profileDropdown?.classList.toggle('active');
    window.toggleNotifications  = () => notifDropdown?.classList.toggle('active');
    window.closeProfileDropdown = () => profileDropdown?.classList.remove('active');
}

// ── Auth: actualizar UI del header ─────────────────────────────────────────
function initAuthUI() {
    const ADMINS = ['greenforceiebb@gmail.com', 'lfalzatel@gmail.com'];

    function updateHeaderUI(user) {
        const avatar    = document.getElementById('headerProfileAvatar');
        const nameEl    = document.getElementById('headerUserName');
        const roleEl    = document.getElementById('headerUserRole');
        const menuName  = document.getElementById('menuProfileName');
        const menuEmail = document.getElementById('menuProfileEmail');
        const loginBtn  = document.getElementById('menuLoginBtn');

        if (user) {
            if (avatar)    avatar.src   = user.photoURL || 'assets/icons/icon-192.png';
            if (nameEl)    nameEl.textContent  = (user.displayName || 'Usuario').split(' ')[0];
            const isAdmin  = ADMINS.includes(user.email);
            if (roleEl)    roleEl.textContent  = isAdmin ? 'Admin' : 'Miembro';
            if (menuName)  menuName.textContent  = user.displayName || 'Usuario';
            if (menuEmail) menuEmail.textContent = user.email || '';
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>';
                loginBtn.classList.remove('btn-login');
                loginBtn.classList.add('btn-logout');
            }
            window.currentUserRole = isAdmin ? 'admin' : 'miembro';
        } else {
            if (avatar)    avatar.src   = 'assets/icons/icon-192.png';
            if (nameEl)    nameEl.textContent  = 'Invitado';
            if (roleEl)    roleEl.textContent  = 'Visitante';
            if (menuName)  menuName.textContent  = 'Invitado';
            if (menuEmail) menuEmail.textContent = 'Inicia sesión para acceder';
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
                loginBtn.classList.remove('btn-logout');
                loginBtn.classList.add('btn-login');
            }
            window.currentUserRole = 'visitor';
        }
    }

    window.handleAuthAction = async () => {
        const { loginWithGoogle, logout } = await import('./auth.js');
        if (auth.currentUser) {
            logout();
        } else {
            loginWithGoogle();
        }
    };

    onAuthStateChanged(auth, updateHeaderUI);
}

// ── Notificaciones: cargar próximos eventos desde Firestore ────────────────
async function loadNotifications() {
    const list   = document.getElementById('notificationList');
    const badge  = document.getElementById('notificationBadge');
    if (!list) return;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const in30 = new Date(today);
        in30.setDate(today.getDate() + 30);

        const q = query(
            collection(db, 'activities'),
            where('date', '>=', today.toISOString().split('T')[0]),
            where('date', '<=', in30.toISOString().split('T')[0]),
            orderBy('date', 'asc'),
            limit(5)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            list.innerHTML = `
              <div class="notification-empty">
                <i class="fas fa-calendar-check"></i>
                Sin eventos próximos (30 días)
              </div>`;
            return;
        }

        badge.textContent = snap.size;
        badge.style.display = 'flex';

        list.innerHTML = snap.docs.map(d => {
            const ev      = d.data();
            const evDate  = new Date(ev.date + 'T00:00:00');
            const diff    = Math.round((evDate - today) / 86400000);
            const chip    = diff === 0 ? 'today' : diff <= 7 ? 'soon' : 'upcoming';
            const label   = diff === 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`;
            return `
              <div class="notification-item">
                <div class="notif-icon"><i class="fas fa-calendar-day"></i></div>
                <div class="notif-content">
                  <div class="notif-title">${ev.title || 'Actividad'}</div>
                  <div class="notif-meta">
                    <span class="notif-date">${ev.date || ''}</span>
                    <span class="notif-days-chip ${chip}">${label}</span>
                  </div>
                </div>
              </div>`;
        }).join('');
    } catch (err) {
        console.warn('No se pudieron cargar notificaciones:', err.message);
        list.innerHTML = `<div class="notification-empty"><i class="fas fa-wifi-slash"></i> Sin conexión</div>`;
    }
}

// ── Función principal de inicialización ────────────────────────────────────
export function initLayout(options = {}) {
    const opts = { ...DEFAULTS, ...options };

    // 1. Inyectar fondo dinámico (si existe el contenedor)
    initBackground(opts.basePath);

    // 2. Inyectar Header
    const headerPlaceholder = document.getElementById('app-header-placeholder');
    const headerHTML = buildHeaderHTML(opts.basePath);
    if (headerPlaceholder) {
        headerPlaceholder.outerHTML = headerHTML;
    } else if (!document.getElementById('app-header-root')) {
        // Si no hay placeholder, insertar al inicio del body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // 3. Inyectar Bottom Nav
    const navItems = getNavItems(opts.basePath, opts.activeNav);
    const navHTML  = buildNavHTML(navItems);
    const navPlaceholder = document.getElementById('bottom-nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.outerHTML = navHTML;
    } else if (!document.getElementById('bottom-nav-root')) {
        document.body.insertAdjacentHTML('beforeend', navHTML);
    }

    // 4. Inicializar subsistemas
    initTheme();
    initDropdowns();
    initAuthUI();

    // 5. Cargar notificaciones (async, no bloquea)
    loadNotifications();
}

// ── Export helpers globales opcionales ─────────────────────────────────────
export { initTheme };
