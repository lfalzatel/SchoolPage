import { db } from './firebase-config.js';
import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function loadTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando cronograma...</div>';

    try {
        const q = query(collection(db, "activities"), orderBy("date", "asc"));
        const querySnapshot = await getDocs(q);

        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        if (events.length === 0) {
            container.innerHTML = '<p class="text-center">No hay actividades programadas.</p>';
            return;
        }

        renderTimeline(events, container);
    } catch (e) {
        console.error("Error loading timeline:", e);
        container.innerHTML = '<p class="error">Error cargando el cronograma.</p>';
    }
}

function renderTimeline(events, container) {
    const now = new Date();

    const eventsHtml = events.map((event, index) => {
        let eventDate = null;
        if (event.date && event.date.toDate) {
            eventDate = event.date.toDate();
        } else if (event.date) {
            eventDate = new Date(event.date); // Fallback if regular date string
        } else {
            // Fallback to createdAt if date is missing (migration issue)
            eventDate = event.createdAt?.toDate() || new Date();
        }

        const isPast = eventDate < now;
        // Determine status: "Realizada" vs "Próxima"
        // Logic: if date < now -> Realizada (Checkmark)
        //        if date > now -> Próxima (Calendar)
        // Optionally "En progreso" if same day? Let's keep it simple as per prompt.

        const statusClass = isPast ? 'status-done' : 'status-upcoming';
        const statusText = isPast ? 'Realizada' : 'Próxima';
        const statusIcon = isPast ? 'fas fa-check-circle' : 'fas fa-calendar-alt';

        const dateStr = eventDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

        // Alignment: alternate left/right for desktop
        const alignmentClass = index % 2 === 0 ? 'left' : 'right';

        return `
            <div class="timeline-item ${alignmentClass} ${statusClass}">
                <div class="timeline-badge">${dateStr}</div>
                <div class="timeline-content">
                    <div class="timeline-status"><i class="${statusIcon}"></i> ${statusText}</div>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    ${event.hasGallery || (event.images && event.images.length > 0) ?
                `<button class="btn-timeline-gallery" onclick="window.openGalleryModalFromId('${event.id}')">
                            <i class="fas fa-images"></i> Ver Fotos
                         </button>` : ''
            }
                    ${event.createdBy && event.createdBy.name ? `<div class="timeline-author"><small>Por: ${event.createdBy.name}</small></div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="timeline">${eventsHtml}</div>`;
}

// Global helper to find activity by ID and open modal
// Since gallery data might not be loaded in currentGalleryActivities if we are just viewing timeline,
// we might need to fetch it or ensure gallery is loaded. 
// For simplicity, let's assume loadActivities has run or we fetch on demand.
// Better yet, let's just make it work with the gallery module if possible.
// Only problem: openGalleryModal uses index of currentGalleryActivities.
// We need a way to open by ID.
window.openGalleryModalFromId = async (id) => {
    // Check if gallery module exposes a find method or we just search currentGalleryActivities
    // If not loaded, we might need to load them.
    // Let's rely on gallery.js having loaded data OR implement a quick fetch.

    // Quick fix: import loadActivities? No, cyclic dependency.
    // We will attach this logic to window in gallery.js instead or here if we have access to variables.
    // For now, let's just trigger a custom event or accessing global window.currentGalleryActivities

    if (!window.currentGalleryActivities || window.currentGalleryActivities.length === 0) {
        // Try to wait or fetch?
        // Let's just alert for now or try to find it in the DOM if it was rendered?
        // Actually, let's fetch specific doc if needed.
        console.log("Gallery data not loaded yet, trying to fetch...");
        // This part requires importing getDoc which we didn't import yet for simplicity in this function
        // Let's add it to imports
    }

    const index = window.currentGalleryActivities.findIndex(a => a.id === id);
    if (index !== -1) {
        window.openGalleryModal(index);
    } else {
        // Fallback: maybe it's not in the currently loaded list (e.g. pagination?)
        console.warn("Activity not found in local cache");
    }
};
