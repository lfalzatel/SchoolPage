const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'green-force-pwa-2025-firebase-adminsdk-fbsvc-01d92f9a8e.json');
const corsPath = path.join(__dirname, '..', 'cors.json');

const serviceAccount = require(serviceAccountPath);
const cors = JSON.parse(fs.readFileSync(corsPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function applyCors() {
  const buckets = [
    'green-force-pwa-2025.firebasestorage.app',
    'green-force-pwa-2025.appspot.com'
  ];

  for (const bName of buckets) {
    try {
      console.log(`Intentando configurar CORS en bucket: ${bName}...`);
      const bucket = admin.storage().bucket(bName);
      await bucket.setCorsConfiguration(cors);
      console.log(`✅ ¡CORS configurado exitosamente en ${bName}!`);
    } catch (err) {
      console.error(`❌ Error en bucket ${bName}:`, err.message);
    }
  }
  process.exit(0);
}

applyCors();
