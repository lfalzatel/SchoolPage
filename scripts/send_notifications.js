const admin = require('firebase-admin');

// Parse the service account from environment variable
// In GitHub Actions, you will set FIREBASE_SERVICE_ACCOUNT secret
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
    process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

async function sendNotifications() {
    console.log("Starting notification job...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    try {
        // 1. Fetch upcoming events
        const activitiesRef = db.collection('activities');
        const snapshot = await activitiesRef.get();

        if (snapshot.empty) {
            console.log('No activities found.');
            return;
        }

        const eventsToNotify = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.date) return;

            const eventDate = new Date(data.date);
            eventDate.setHours(0, 0, 0, 0);

            // Check if event is exactly tomorrow or exactly next week
            if (eventDate.getTime() === tomorrow.getTime()) {
                eventsToNotify.push({ ...data, id: doc.id, timeframe: 'tomorrow' });
            } else if (eventDate.getTime() === nextWeek.getTime()) {
                eventsToNotify.push({ ...data, id: doc.id, timeframe: 'nextWeek' });
            }
        });

        if (eventsToNotify.length === 0) {
            console.log('No events require notification today.');
            return;
        }

        console.log(`Found ${eventsToNotify.length} events needing notifications.`);

        // 2. Fetch all FCM tokens
        const tokensSnapshot = await db.collection('fcm_tokens').get();
        if (tokensSnapshot.empty) {
            console.log('No FCM tokens found.');
            return;
        }

        const tokens = [];
        tokensSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.token) {
                tokens.push(data.token);
            }
        });

        console.log(`Sending to ${tokens.length} devices...`);

        // 3. Send notifications for each event
        for (const event of eventsToNotify) {
            let title = "";
            let body = "";

            if (event.timeframe === 'tomorrow') {
                title = `¡Evento Mña: ${event.title}!`;
                body = `Recuerda que mañana es ${event.title}. ¡No te lo pierdas!`;
            } else {
                title = `Próximo: ${event.title}`;
                body = `Falta 1 semana para ${event.title}. Ve preparándote.`;
            }

            const message = {
                notification: {
                    title: title,
                    body: body,
                },
                data: {
                    view: 'cronograma'
                },
                tokens: tokens // Multicast
            };

            try {
                const response = await messaging.sendEachForMulticast(message);
                console.log(`Successfully sent ${response.successCount} messages for event "${event.title}". Failed: ${response.failureCount}.`);
            } catch (sendErr) {
                console.error('Error sending multicast message:', sendErr);
            }
        }

    } catch (err) {
        console.error("Error in notification job:", err);
        process.exit(1);
    }
}

sendNotifications();
