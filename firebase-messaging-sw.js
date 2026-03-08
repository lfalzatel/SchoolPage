importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Configuración de Firebase - Debe coincidir exactamente con la de firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyC0QFzN6ZZQGXhH1fcYdfx0-dcQ2XdYJ6g",
    authDomain: "green-force-pwa-2025.firebaseapp.com",
    projectId: "green-force-pwa-2025",
    storageBucket: "green-force-pwa-2025.firebasestorage.app",
    messagingSenderId: "385628439914",
    appId: "1:385628439914:web:520a75554db345afe91113"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Mensaje en segundo plano recibido ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        data: {
            url: payload.data ? payload.data.click_action || '/' : '/'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejo de clic en notificaciones en segundo plano
self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Clic en la notificación.', event);
    event.notification.close();

    const urlToOpen = new URL(event.notification.data.url || '/', self.location.origin).href;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    })
        .then((windowClients) => {
            let matchingClient = null;

            for (let i = 0; i < windowClients.length; i++) {
                const windowClient = windowClients[i];
                if (windowClient.url === urlToOpen) {
                    matchingClient = windowClient;
                    break;
                }
            }

            if (matchingClient) {
                return matchingClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        });

    event.waitUntil(promiseChain);
});
