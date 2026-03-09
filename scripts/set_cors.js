const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Lee la cuenta de servicio local
const serviceAccountPath = path.join(__dirname, '../green-force-pwa-2025-firebase-adminsdk-fbsvc-01d92f9a8e.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Inicializa Firebase Admin especificando el nombre de tu bucket de Storage
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'green-force-pwa-2025.firebasestorage.app'
});

const bucket = admin.storage().bucket();

async function configureCors() {
    console.log('Configurando reglas CORS para el bucket...');

    // Reglas CORS que permiten cualquier origen (localhost o github pages) subir y descargar imágenes
    const corsConfiguration = [
        {
            origin: ['*'], // Permite peticiones desde cualquier lugar
            method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
            responseHeader: ['*'], // Permite todos los headers (vital para el SDK de Firebase)
            maxAgeSeconds: 3600 // Cache para el navegador
        }
    ];

    try {
        // Aplica las reglas
        await bucket.setCorsConfiguration(corsConfiguration);
        console.log('✅ ¡Las reglas CORS se configuraron exitosamente!');
        console.log('Ahora deberías poder subir imágenes sin el error rojo en la consola.');
    } catch (error) {
        console.error('❌ Error configurando CORS:', error.message, error);
    }
}

configureCors();
