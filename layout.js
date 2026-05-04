// ============================================================
//  layout.js — Green Force PWA
//  Header + Bottom Nav compartidos para todas las páginas
//  Uso: import { initLayout } from './layout.js';
//       initLayout({ activeNav: 'asistencia' });
// ============================================================

import { auth, db } from './firebase-config.js';
import {
    doc, getDoc, query, collection, where, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ── Roles ───────────────────────────────────────────────────────────────────
const PRIVILEGED_ROLES = ['admin', 'lider'];
const ADMIN_ROLES      = ['admin'];
const ADMIN_EMAILS     = ['greenforceiebb@gmail.com', 'lfalzatel@gmail.com'];

// ── Opciones por defecto ────────────────────────────────────────────────────
const DEFAULTS = { activeNav: null, basePath: '' };

// ── Helper: ¿Estamos en la página de inicio? ──────────────────────────────
function isHomePage() {
    const p = window.location.pathname.toLowerCase();
    return p.endsWith('/') || p.endsWith('index.html');
}

// ── Detectar ítem activo por hash de URL ────────────────────────────────────
function detectActiveNavFromHash() {
    const hash = window.location.hash.replace('#', '');
    const map = { 'sobre': 'inicio', 'cronograma': 'cronograma',
                  'galeria': 'galeria', 'video': 'video', 'documentos': 'docs' };
    return map[hash] || null;
}

// ── Bottom Nav — IDÉNTICO al de index.html ──────────────────────────────────
function getNavItems(basePath, activeNav) {
    // En la página inicio: usar #anchor (sin recarga). En otras: index.html#anchor
    const home = isHomePage();
    const homeHref = (anchor) => home ? `#${anchor}` : `${basePath}index.html#${anchor}`;

    const items = [
        { id: 'nav-inicio',     href: homeHref('sobre'),      icon: 'fa-home',        label: 'Inicio',     key: 'inicio',     section: 'sobre' },
        { id: 'nav-cronograma', href: homeHref('cronograma'), icon: 'fa-leaf',        label: 'Cronograma', key: 'cronograma', section: 'cronograma' },
        { id: 'nav-galeria',    href: homeHref('galeria'),    icon: 'fa-images',      label: 'Galería',    key: 'galeria',    section: 'galeria' },
        { id: 'nav-video',      href: homeHref('video'),      icon: 'fa-play-circle', label: 'Videos',     key: 'video',      section: 'video' },
        { id: 'nav-docs',       href: homeHref('documentos'), icon: 'fa-file-alt',    label: 'Docs',       key: 'docs',       section: 'documentos' },
        { id: 'nav-chat',       href: 'https://chat.whatsapp.com/L0hrcQ9JWmUB5DQui9ZrXv',
          icon: 'fa-comments', label: 'Chat', key: 'chat', external: true },
    ];
    // Prioridad: parámetro explícito > hash de URL > ruta
    const currentKey = activeNav || detectActiveNavFromHash() || detectActiveNav();
    return items.map(item => ({ ...item, isActive: item.key === currentKey }));
}

function detectActiveNav() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('formulario_asistencia')) return 'asistencia';
    if (path.includes('gallery'))               return 'galeria';
    if (path.includes('gestion_usuarios'))      return null;
    if (path.includes('index') || path.endsWith('/')) return 'inicio';
    return null;
}

// ── HTML del Header (idéntico al de index.html + extras) ───────────────────
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
          <h3>Próximos Eventos</h3>
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
          <a href="${basePath}index.html#galeria" class="menu-item" onclick="window.closeProfileDropdown()">
            <div class="menu-item-icon bg-blue"><i class="fas fa-images"></i></div>
            <span>Gestionar Galería</span>
            <i class="fas fa-chevron-right arrow-link"></i>
          </a>
          <a href="${basePath}formulario_asistencia_eventos.html" class="menu-item" onclick="window.closeProfileDropdown()">
            <div class="menu-item-icon bg-green"><i class="fas fa-poll"></i></div>
            <span>Encuestas</span>
            <i class="fas fa-chevron-right arrow-link"></i>
          </a>
          <!-- Solo visible para admin -->
          <a href="${basePath}gestion_usuarios.html" class="menu-item admin-only" id="menuGestionUsuarios"
             style="display:none;" onclick="window.closeProfileDropdown()">
            <div class="menu-item-icon" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9)">
              <i class="fas fa-users-cog"></i>
            </div>
            <span>Gestionar Usuarios</span>
            <i class="fas fa-chevron-right arrow-link"></i>
          </a>
          <div class="menu-item" onclick="window.showView && window.showView('configuracion'); window.closeProfileDropdown();">
            <div class="menu-item-icon bg-gray"><i class="fas fa-cog"></i></div>
            <span>Configuración</span>
            <i class="fas fa-chevron-right arrow-link"></i>
          </div>
          <div class="menu-item" id="downloadPdfBtnMenu" onclick="window.closeProfileDropdown();">
            <div class="menu-item-icon bg-red"><i class="fas fa-file-pdf"></i></div>
            <span>Descargar Informe PDF</span>
          </div>
          <div class="menu-item" id="installAppBtn" style="display:none;"
               onclick="window.installPWA && window.installPWA(); window.closeProfileDropdown();">
            <div class="menu-item-icon bg-green"><i class="fas fa-download"></i></div>
            <span>Instalar Aplicación</span>
          </div>
          <div class="menu-item" onclick="window.shareApp && window.shareApp(); window.closeProfileDropdown();">
            <div class="menu-item-icon bg-green"><i class="fas fa-share-alt"></i></div>
            <span>Compartir App</span>
            <i class="fas fa-chevron-right arrow-link"></i>
          </div>

          <!-- Toggle Alertas Push -->
          <div class="dropdown-theme-section" style="border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:12px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
              <span class="theme-label" style="margin:0;display:flex;align-items:center;gap:8px;">
                <div class="menu-item-icon bg-blue" style="width:24px;height:24px;min-width:24px;font-size:0.7rem;">
                  <i class="fas fa-bell"></i>
                </div>
                ALERTAS PUSH
              </span>
              <label class="settings-toggle" style="margin:0;pointer-events:none;">
                <input type="checkbox" id="menuPushToggle"
                       onchange="window.handleMenuPushToggle && window.handleMenuPushToggle(this.checked)"
                       style="pointer-events:auto;">
                <span class="toggle-track" style="margin:0;pointer-events:auto;"><span class="toggle-thumb"></span></span>
              </label>
            </div>
          </div>

          <!-- Selector de Tema -->
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
        const cls      = item.isActive ? ' active' : '';
        const external = item.external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a id="${item.id}" href="${item.href}" class="nav-item${cls}"${external}>
      <i class="fas ${item.icon}"></i><span>${item.label}</span></a>`;
    }).join('');
    return `<nav class="bottom-nav" id="bottom-nav-root">${itemsHTML}</nav>`;
}

// ── Fondo dinámico con slideshow ────────────────────────────────────────────
function initBackground(basePath) {
    const container = document.getElementById('app-background');
    if (!container) return;
    const images = [
        'assets/images/WhatsApp Image 2024-05-23 at 8.01.21 AM (1).jpeg',
        'assets/images/WhatsApp Image 2024-05-23 at 8.01.21 AM.jpeg',
        'assets/images/WhatsApp Image 2024-05-23 at 8.01.22 AM.jpeg',
    ];
    images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'bg-slide' + (i === 0 ? ' active' : '');
        slide.style.backgroundImage = `url('${basePath}${src}')`;
        container.appendChild(slide);
    });
    let current = 0;
    const slides = container.querySelectorAll('.bg-slide');
    if (slides.length > 1) {
        setInterval(() => {
            slides[current].classList.remove('active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('active');
        }, 8000);
    }
}

// ── Tema ────────────────────────────────────────────────────────────────────
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
        ['light','dark','system'].forEach(t => {
            const btn = document.getElementById(`theme${t.charAt(0).toUpperCase() + t.slice(1)}`);
            if (btn) btn.classList.toggle('active', t === theme);
            // Compatibilidad con auth.js
            document.querySelectorAll('.theme-btn').forEach(b => {
                if (b.getAttribute('onclick')?.includes(`'${theme}'`)) b.classList.add('active');
                else b.classList.remove('active');
            });
        });
    };
    const saved = localStorage.getItem('green-force-theme') || 'system';
    window.setTheme(saved);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('green-force-theme') === 'system') window.setTheme('system');
    });
}

// ── Dropdowns ───────────────────────────────────────────────────────────────
function initDropdowns() {
    const profileDropdown = document.getElementById('profileDropdown');
    const notifDropdown   = document.getElementById('notificationsDropdown');
    const profilePill     = document.getElementById('profilePillBtn');
    const notifBell       = document.getElementById('notifBellBtn');

    profilePill?.addEventListener('click', () => {
        profileDropdown?.classList.toggle('active');
        notifDropdown?.classList.remove('active');
    });
    notifBell?.addEventListener('click', () => {
        notifDropdown?.classList.toggle('active');
        profileDropdown?.classList.remove('active');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-menu-container')) profileDropdown?.classList.remove('active');
        if (!e.target.closest('.notifications-wrapper'))  notifDropdown?.classList.remove('active');
    });

    // Exponer globalmente (compatibilidad con onclick en index.html)
    window.toggleProfileMenu    = () => profileDropdown?.classList.toggle('active');
    window.toggleNotifications  = () => notifDropdown?.classList.toggle('active');
    window.closeProfileDropdown = () => profileDropdown?.classList.remove('active');

    // Compartir App
    window.shareApp = () => {
        if (navigator.share) {
            navigator.share({ title: 'Green Force', url: window.location.origin });
        } else {
            navigator.clipboard?.writeText(window.location.origin);
            if (window.showToast) window.showToast('Enlace copiado al portapapeles', 'success');
        }
    };
}

// ── Auth UI ─────────────────────────────────────────────────────────────────
function initAuthUI(basePath) {
    const ROLE_LABELS = {
        admin:      'Admin',
        lider:      'Líder',
        integrante: 'Integrante',
        usuario:    'Usuario',
        miembro:    'Miembro',
    };

    async function updateHeaderUI(user) {
        const avatar    = document.getElementById('headerProfileAvatar');
        const nameEl    = document.getElementById('headerUserName');
        const roleEl    = document.getElementById('headerUserRole');
        const menuName  = document.getElementById('menuProfileName');
        const menuEmail = document.getElementById('menuProfileEmail');
        const loginBtn  = document.getElementById('menuLoginBtn');
        const adminLink = document.getElementById('menuGestionUsuarios');

        if (user) {
            if (avatar)    avatar.src = user.photoURL || `${basePath}assets/icons/icon-192.png`;
            if (menuName)  menuName.textContent  = user.displayName || 'Usuario';
            if (menuEmail) menuEmail.textContent = user.email || '';

            // Leer rol desde Firestore
            let role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'miembro';
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists() && snap.data().role) role = snap.data().role;
            } catch (_) {}

            window.currentUserRole = role;
            if (nameEl)  nameEl.textContent  = (user.displayName || 'Usuario').split(' ')[0];
            if (roleEl)  roleEl.textContent  = ROLE_LABELS[role] || 'Miembro';

            // Mostrar enlace de gestión solo a admins
            if (adminLink) adminLink.style.display = ADMIN_ROLES.includes(role) ? 'flex' : 'none';

            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Cerrar Sesión</span>';
            }
        } else {
            window.currentUserRole = 'visitor';
            if (avatar)    avatar.src = `${basePath}assets/icons/icon-192.png`;
            if (nameEl)    nameEl.textContent  = 'Invitado';
            if (roleEl)    roleEl.textContent  = 'Visitante';
            if (menuName)  menuName.textContent  = 'Invitado';
            if (menuEmail) menuEmail.textContent = 'Inicia sesión para acceder';
            if (adminLink) adminLink.style.display = 'none';
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
            }
        }
    }

    window.handleAuthAction = async () => {
        if (auth.currentUser) {
            const { logout } = await import('./auth.js');
            logout();
        } else {
            window.location.href = `${basePath}login.html`;
        }
    };

    onAuthStateChanged(auth, updateHeaderUI);
}

// ── Notificaciones desde Firestore ──────────────────────────────────────────
async function loadNotifications() {
    const list  = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    if (!list) return;
    try {
        const today = new Date(); today.setHours(0,0,0,0);
        const in30  = new Date(today); in30.setDate(today.getDate() + 30);
        const q = query(collection(db, 'activities'),
            where('date', '>=', today.toISOString().split('T')[0]),
            where('date', '<=', in30.toISOString().split('T')[0]),
            orderBy('date','asc'), limit(5));
        const snap = await getDocs(q);
        if (snap.empty) {
            list.innerHTML = `<div class="notification-empty"><i class="fas fa-calendar-check"></i> Sin eventos en los próximos 30 días</div>`;
            return;
        }
        if (badge) { badge.textContent = snap.size; badge.style.display = 'flex'; }
        list.innerHTML = snap.docs.map(d => {
            const ev   = d.data();
            const diff = Math.round((new Date(ev.date+'T00:00:00') - today) / 86400000);
            const lbl  = diff === 0 ? '¡Hoy!' : diff === 1 ? 'Mañana' : `En ${diff} días`;
            const chip = diff === 0 ? 'today' : diff <= 7 ? 'soon' : 'upcoming';
            return `<div class="notification-item">
              <div class="notif-icon"><i class="fas fa-calendar-day"></i></div>
              <div class="notif-content">
                <div class="notif-title">${ev.title || 'Actividad'}</div>
                <div class="notif-meta">
                  <span class="notif-date">${ev.date || ''}</span>
                  <span class="notif-days-chip ${chip}">${lbl}</span>
                </div>
              </div></div>`;
        }).join('');
    } catch (e) {
        list.innerHTML = `<div class="notification-empty"><i class="fas fa-wifi-slash"></i> Sin conexión</div>`;
    }
}

// ── Scrollspy para index.html ────────────────────────────────────────────────
function initHomeScrollspy() {
    if (!isHomePage()) return;

    function setNavActive(key) {
        document.querySelectorAll('#bottom-nav-root .nav-item').forEach(a => {
            a.classList.toggle('active', a.id === `nav-${key}`);
        });
    }

    // Actualizar active al hacer clic (inmediato)
    document.querySelectorAll('#bottom-nav-root .nav-item').forEach(a => {
        a.addEventListener('click', () => {
            const key = a.id.replace('nav-', '');
            if (key !== 'chat') setNavActive(key);
        });
    });

    // IntersectionObserver: actualiza active al hacer scroll
    const sections = [
        { id: 'sobre',      key: 'inicio' },
        { id: 'cronograma', key: 'cronograma' },
        { id: 'galeria',    key: 'galeria' },
        { id: 'video',      key: 'video' },
        { id: 'documentos', key: 'docs' },
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sec = sections.find(s => s.id === entry.target.id);
                if (sec) setNavActive(sec.key);
            }
        });
    }, {
        // Dispara cuando el 30% de la sección es visible
        threshold: 0.3,
        rootMargin: '-70px 0px -50% 0px'
    });

    sections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) observer.observe(el);
    });

    // Actualizar al cambiar el hash (navegación por teclado, etc.)
    window.addEventListener('hashchange', () => {
        const key = detectActiveNavFromHash();
        if (key) setNavActive(key);
    });
}

// ── Función principal ───────────────────────────────────────────────────────
export function initLayout(options = {}) {
    const opts = { ...DEFAULTS, ...options };

    initBackground(opts.basePath);

    // Inyectar Header
    const headerHTML = buildHeaderHTML(opts.basePath);
    const hp = document.getElementById('app-header-placeholder');
    if (hp) hp.outerHTML = headerHTML;
    else if (!document.getElementById('app-header-root'))
        document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Inyectar Bottom Nav
    const navHTML = buildNavHTML(getNavItems(opts.basePath, opts.activeNav));
    const np = document.getElementById('bottom-nav-placeholder');
    if (np) np.outerHTML = navHTML;
    else if (!document.getElementById('bottom-nav-root'))
        document.body.insertAdjacentHTML('beforeend', navHTML);

    initTheme();
    initDropdowns();
    initAuthUI(opts.basePath);
    loadNotifications();
    initHomeScrollspy();   // ← activa solo en index.html
}

// ── Helpers exportados ──────────────────────────────────────────────────────
export { PRIVILEGED_ROLES, ADMIN_ROLES };
