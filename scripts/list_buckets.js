const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../green-force-pwa-2025-firebase-adminsdk-fbsvc-01d92f9a8e.json');

const storage = new Storage({ keyFilename: serviceAccountPath });

async function listBuckets() {
    try {
        const [buckets] = await storage.getBuckets();
        console.log('Buckets en este proyecto GCP:');
        buckets.forEach(bucket => {
            console.log(bucket.name);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listBuckets();

listBuckets();
