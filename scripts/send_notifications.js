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

    // Convert current UTC time to Colombia time (America/Bogota)
    const nowBogota = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    const today = new Date(nowBogota);
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

            let eventDate;
            if (data.date && typeof data.date.toDate === 'function') {
                eventDate = data.date.toDate();
            } else {
                eventDate = new Date(data.date);
            }

            // Adjust eventDate to Colombia time to compare days correctly
            const eventDay = new Date(eventDate.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
            eventDay.setHours(0, 0, 0, 0);

            let timeframe = null;
            let fieldToUpdate = null;

            // Check if it's a new event that hasn't happened yet and hasn't been notified
            if (!data.notified_new && eventDay.getTime() >= today.getTime()) {
                timeframe = 'new';
                fieldToUpdate = 'notified_new';
            }
            // Check if it's exactly tomorrow
            else if (!data.notified_tomorrow && eventDay.getTime() === tomorrow.getTime()) {
                timeframe = 'tomorrow';
                fieldToUpdate = 'notified_tomorrow';
            }
            // Check if it's exactly next week
            else if (!data.notified_nextWeek && eventDay.getTime() === nextWeek.getTime()) {
                timeframe = 'nextWeek';
                fieldToUpdate = 'notified_nextWeek';
            }

            if (timeframe) {
                eventsToNotify.push({ ...data, id: doc.id, timeframe, fieldToUpdate });
            }
        });

        if (eventsToNotify.length === 0) {
            console.log('No events require notification right now.');
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

        // 3. Send notifications and update Firestore
        const batch = db.batch();

        for (const event of eventsToNotify) {
            let title = "";
            let body = "";

            if (event.timeframe === 'new') {
                title = `¡Nuevo Evento: ${event.title}!`;
                body = `Se ha programado un nuevo evento. ¡Revisa el cronograma!`;
            } else if (event.timeframe === 'tomorrow') {
                title = `¡Evento Mañana: ${event.title}!`;
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

                // If at least one message was sent successfully(or even if none, but the attempt was made to all users), we mark it as notified
                const eventRef = db.collection('activities').doc(event.id);
                batch.update(eventRef, { [event.fieldToUpdate]: true });

            } catch (sendErr) {
                console.error('Error sending multicast message:', sendErr);
            }
        }

        // Commit all the notification updates to Firestore
        await batch.commit();
        console.log('Firestore updated successfully to prevent duplicate notifications.');

    } catch (err) {
        console.error("Error in notification job:", err);
        process.exit(1);
    }
}

sendNotifications();
