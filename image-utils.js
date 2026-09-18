// ══════════════════════════════════════════════════════════════════════════
//  Green Force — Utilidad de Imágenes y Compresión en Cliente
//  image-utils.js
// ══════════════════════════════════════════════════════════════════════════

import { storage } from "./firebase-config.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

/**
 * Comprime una imagen en el cliente usando HTML5 Canvas a formato WebP optimizado (~40 KB)
 * @param {File} file Archivo seleccionado por el usuario
 * @param {number} maxWidth Ancho máximo (por defecto 800px)
 * @param {number} quality Calidad WebP (0.7 por defecto)
 * @returns {Promise<Blob>} Blob comprimido en WebP
 */
export function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Error al generar blob WebP"));
            },
            "image/webp",
            quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Convierte un Blob o File a String Base64 Data URL
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Sube una foto procesada a Firebase Storage con Fallback automático a Base64 en Firestore
 * @param {File} file Archivo de la foto
 * @param {string} pathRuta Ruta en Storage (ej. 'huerta/siembras')
 * @returns {Promise<string>} URL de Firebase Storage o String Base64 (Fallback)
 */
export async function uploadOrCompressPhoto(file, pathRuta = "huerta/general") {
  if (!file) return null;

  let compressedBlob = null;
  try {
    // 1. Compresión previa en cliente (pasa de ~6MB a ~40KB)
    compressedBlob = await compressImage(file, 800, 0.7);
  } catch (err) {
    console.warn("No se pudo comprimir la imagen, utilizando archivo original:", err);
    compressedBlob = file;
  }

  // 2. Intentar subir a Firebase Storage (Plan Gratuito 5GB)
  try {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.webp`;
    const storageRef = ref(storage, `${pathRuta}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, compressedBlob, {
      contentType: "image/webp"
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log("Foto subida exitosamente a Firebase Storage:", downloadUrl);
    return downloadUrl;
  } catch (err) {
    console.warn("Firebase Storage no disponible/configurado (CORS o Bucket inactivo). Aplicando Fallback a Base64 WebP en Firestore...", err.message);
    // 3. Fallback a Base64 WebP (~40KB cabe sin problemas en Firestore)
    try {
      const base64Url = await blobToBase64(compressedBlob);
      return base64Url;
    } catch (fallbackErr) {
      console.error("Error crítico en fallback Base64:", fallbackErr);
      return null;
    }
  }
}
