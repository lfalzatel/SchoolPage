import { db, storage } from './firebase-config.js';
import { auth } from './auth.js';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    deleteDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    onSnapshot,
    runTransaction,
    setDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// --- BACKGROUND IMAGES ---
export const allBackgroundImages = [
    "assets/images/1. logo 1.jpg",
    "assets/images/1. logo 2.jpg",
    "assets/images/1. logo 3.jpg",
    "assets/images/10. Capacitación CORNARE - 1.jpg",
    "assets/images/10. Capacitación CORNARE - 2.jpg",
    "assets/images/10. Capacitación CORNARE - 3.jpg",
    "assets/images/10. Capacitación CORNARE - 4.jpg",
    "assets/images/10. Capacitación CORNARE - 5.jpg",
    "assets/images/10. Encuentro regional 2025 - 1.jpg",
    "assets/images/10. Encuentro regional 2025 - 10.jpg",
    "assets/images/10. Encuentro regional 2025 - 2.jpg",
    "assets/images/10. Encuentro regional 2025 - 3.jpg",
    "assets/images/10. Encuentro regional 2025 - 4.jpg",
    "assets/images/10. Encuentro regional 2025 - 5.jpg",
    "assets/images/10. Encuentro regional 2025 - 6.jpg",
    "assets/images/10. Encuentro regional 2025 - 7.jpg",
    "assets/images/10. Encuentro regional 2025 - 8.jpg",
    "assets/images/10. Encuentro regional 2025 - 9.jpg",
    "assets/images/10. Reforestación institucional - 1.jpg",
    "assets/images/10. Reforestación institucional - 2.jpg",
    "assets/images/10. Reforestación institucional - 3.jpg",
    "assets/images/10. Reforestación institucional - 4.jpg",
    "assets/images/10. Reforestación institucional - 5.jpg",
    "assets/images/11. Campaña ambiental - 1.jpg",
    "assets/images/11. Campaña ambiental - 2.jpg",
    "assets/images/11. Campaña ambiental - 3.jpg",
    "assets/images/11. Campaña ambiental - 4.jpg",
    "assets/images/11. Campaña ambiental - 5.jpg",
    "assets/images/11. Campaña ambiental - 6.jpg",
    "assets/images/11. Campaña ambiental - 7.jpg",
    "assets/images/11. Encuentro departamental 2025 - 1.jpg",
    "assets/images/11. Encuentro departamental 2025 - 10.jpg",
    "assets/images/11. Encuentro departamental 2025 - 11.jpg",
    "assets/images/11. Encuentro departamental 2025 - 12.jpg",
    "assets/images/11. Encuentro departamental 2025 - 13.jpg",
    "assets/images/11. Encuentro departamental 2025 - 14.jpg",
    "assets/images/11. Encuentro departamental 2025 - 15.jpg",
    "assets/images/11. Encuentro departamental 2025 - 16.jpg",
    "assets/images/11. Encuentro departamental 2025 - 17.jpg",
    "assets/images/11. Encuentro departamental 2025 - 18.jpg",
    "assets/images/11. Encuentro departamental 2025 - 2.jpg",
    "assets/images/11. Encuentro departamental 2025 - 3.jpg",
    "assets/images/11. Encuentro departamental 2025 - 4.jpg",
    "assets/images/11. Encuentro departamental 2025 - 5.jpg",
    "assets/images/11. Encuentro departamental 2025 - 6.jpg",
    "assets/images/11. Encuentro departamental 2025 - 7.jpg",
    "assets/images/11. Encuentro departamental 2025 - 8.jpg",
    "assets/images/11. Encuentro departamental 2025 - 9.jpg",
    "assets/images/12. Visita agrosavia 2025 - 1.jpg",
    "assets/images/12. Visita agrosavia 2025 - 2.jpg",
    "assets/images/12. Visita agrosavia 2025 - 3.jpg",
    "assets/images/12. Visita agrosavia 2025 - 4.jpg",
    "assets/images/12. Visita agrosavia 2025 - 5.jpg",
    "assets/images/12. Visita agrosavia 2025 - 6.jpg",
    "assets/images/12. Visita agrosavia 2025 - 7.jpg",
    "assets/images/12. Visita agrosavia 2025 - 8.jpg",
    "assets/images/13. Preparación compostaje 2025 - 1.jpg",
    "assets/images/13. Preparación compostaje 2025 - 2.jpg",
    "assets/images/13. Preparación compostaje 2025 - 3.jpg",
    "assets/images/13. Preparación compostaje 2025 - 4.jpg",
    "assets/images/13. Preparación compostaje 2025 - 5.jpg",
    "assets/images/13. Preparación compostaje 2025 - 6.jpg",
    "assets/images/13. Preparación compostaje 2025 - 7.jpg",
    "assets/images/13. Preparación compostaje 2025 - 8.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 1.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 2.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 3.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 4.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 5.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 6.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 7.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 8.jpg",
    "assets/images/13. Segunda capacitación CORNARE - 9.jpg",
    "assets/images/13. Segunda siembra - 1.jpg",
    "assets/images/13. Segunda siembra - 2.jpg",
    "assets/images/13. Segunda siembra - 3.jpg",
    "assets/images/13. Segunda siembra - 4.jpg",
    "assets/images/13. Segunda siembra - 5.jpg",
    "assets/images/13. Segunda siembra - 6.jpg",
    "assets/images/13. Segunda siembra - 7.jpg",
    "assets/images/13. Segunda siembra - 8.jpg",
    "assets/images/13. Segunda siembra - 9.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 1.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 10.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 11.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 12.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 13.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 14.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 15.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 16.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 17.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 18.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 2.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 3.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 4.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 5.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 6.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 7.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 8.jpg",
    "assets/images/14. Sembraton de 1000 árboles - 9.jpg",
    "assets/images/15. Siembra y mantenimiento - 1.jpg",
    "assets/images/15. Siembra y mantenimiento 2.jpg",
    "assets/images/15. Siembra y mantenimiento 3.jpg",
    "assets/images/15. Siembra y mantenimiento 4.jpg",
    "assets/images/15. Siembra y mantenimiento 5.jpg",
    "assets/images/15. Siembra y mantenimiento 6.jpg",
    "assets/images/16. Miroorganismos del suelo - 1.jpg",
    "assets/images/16. Miroorganismos del suelo - 2.jpg",
    "assets/images/16. Miroorganismos del suelo - 3.jpg",
    "assets/images/16. Miroorganismos del suelo - 4.jpg",
    "assets/images/16. Miroorganismos del suelo - 5.jpg",
    "assets/images/16. Miroorganismos del suelo - 6.jpg",
    "assets/images/16. Miroorganismos del suelo - 7.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 1.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 10.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 11.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 12.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 13.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 14.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 15.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 2.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 3.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 4.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 5.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 6.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 7.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 8.jpg",
    "assets/images/17. Visita Microcuenca ARSA - 9.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 1.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 10.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 11.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 12.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 13.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 14.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 15.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 16.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 2.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 3.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 4.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 5.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 6.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 7.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 8.jpg",
    "assets/images/18. Encuentro semilleros IEBB - 9.jpg",
    "assets/images/19. Encuentro UCO - 1.jpg",
    "assets/images/19. Encuentro UCO - 10.jpg",
    "assets/images/19. Encuentro UCO - 11.jpg",
    "assets/images/19. Encuentro UCO - 12.jpg",
    "assets/images/19. Encuentro UCO - 2.jpg",
    "assets/images/19. Encuentro UCO - 3.jpg",
    "assets/images/19. Encuentro UCO - 4.jpg",
    "assets/images/19. Encuentro UCO - 5.jpg",
    "assets/images/19. Encuentro UCO - 6.jpg",
    "assets/images/19. Encuentro UCO - 7.jpg",
    "assets/images/19. Encuentro UCO - 8.jpg",
    "assets/images/19. Encuentro UCO - 9.jpg",
    "assets/images/19. Vivero actual 2025 - 1.jpg",
    "assets/images/19. Vivero actual 2025 - 2.jpg",
    "assets/images/19. Vivero actual 2025 - 3.jpg",
    "assets/images/19. Vivero actual 2025 - 4.jpg",
    "assets/images/19. Vivero actual 2025 - 5.jpg",
    "assets/images/19. Vivero actual 2025 - 6.jpg",
    "assets/images/2. Inicio marzo 2023 - 0.jpg",
    "assets/images/2. Inicio marzo 2023 - 1.jpg",
    "assets/images/2. Inicio marzo 2023 - 2.jpg",
    "assets/images/2. Inicio marzo 2023 - 3.jpg",
    "assets/images/2. Inicio marzo 2023 - 4.jpg",
    "assets/images/2. Inicio marzo 2023 - 5.jpg",
    "assets/images/2. Inicio marzo 2023 - 6.jpg",
    "assets/images/2. Inicio marzo 2023 - 7.jpg",
    "assets/images/2. Inicio marzo 2023 - 8.jpg",
    "assets/images/2. Inicio marzo 2023 - 9.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 1.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 10.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 11.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 12.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 2.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 3.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 4.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 5.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 6.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 7.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 8.jpg",
    "assets/images/20. Encuentro Nacional 2025 - 9.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 1.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 10.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 2.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 3.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 4.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 5.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 6.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 7.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 8.jpg",
    "assets/images/3. Plántulas reforestación 2023 - 9.jpg",
    "assets/images/4. 4 marzo 2024 Estacas - 1.jpg",
    "assets/images/4. 4 marzo 2024 Estacas - 2.jpg",
    "assets/images/4. 4 marzo 2024 Estacas - 3.jpg",
    "assets/images/4. 4 marzo 2024 Estacas - 4.jpg",
    "assets/images/4. 4 marzo 2024 Estacas - 5.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 1.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 2.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 3.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 4.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 5.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 6.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 7.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 8.jpg",
    "assets/images/4. Visita agrosavia octubre 2024 - 9.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 1.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 2.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 3.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 4.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 5.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 6.jpg",
    "assets/images/5. Limpieza de zonas 2024 - 7.jpg",
    "assets/images/6. Embellecimiento 2024 - 1.jpg",
    "assets/images/6. Embellecimiento 2024 - 10.jpg",
    "assets/images/6. Embellecimiento 2024 - 2.jpg",
    "assets/images/6. Embellecimiento 2024 - 3.jpg",
    "assets/images/6. Embellecimiento 2024 - 4.jpg",
    "assets/images/6. Embellecimiento 2024 - 5.jpg",
    "assets/images/6. Embellecimiento 2024 - 6.jpg",
    "assets/images/6. Embellecimiento 2024 - 7.jpg",
    "assets/images/6. Embellecimiento 2024 - 8.jpg",
    "assets/images/6. Embellecimiento 2024 - 9.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 1.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 2.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 3.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 4.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 5.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 6.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 7.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 8.jpg",
    "assets/images/6. Riego y mantenimiento 2024 - 9.jpg",
    "assets/images/6. Segunda limpieza 2024 - 1.jpg",
    "assets/images/6. Segunda limpieza 2024 - 2.jpg",
    "assets/images/6. Segunda limpieza 2024 - 3.jpg",
    "assets/images/6. Segunda limpieza 2024 - 4.jpg",
    "assets/images/6. Segunda limpieza 2024 - 5.jpg",
    "assets/images/7. Reciclaje de tapas 2024 - 1.jpg",
    "assets/images/7. Reciclaje de tapas 2024 - 2.jpg",
    "assets/images/7. Reciclaje de tapas 2024 - 3.jpg",
    "assets/images/7. Reciclaje de tapas 2024 - 4.jpg",
    "assets/images/7. Reciclaje de tapas 2024 - 5.jpg",
    "assets/images/8. sep 2024 mantenimiento - 1.jpg",
    "assets/images/8. sep 2024 mantenimiento - 10.jpg",
    "assets/images/8. sep 2024 mantenimiento - 11.jpg",
    "assets/images/8. sep 2024 mantenimiento - 2.jpg",
    "assets/images/8. sep 2024 mantenimiento - 3.jpg",
    "assets/images/8. sep 2024 mantenimiento - 4.jpg",
    "assets/images/8. sep 2024 mantenimiento - 5.jpg",
    "assets/images/8. sep 2024 mantenimiento - 6.jpg",
    "assets/images/8. sep 2024 mantenimiento - 7.jpg",
    "assets/images/8. sep 2024 mantenimiento - 8.jpg",
    "assets/images/8. sep 2024 mantenimiento - 9.jpg",
    "assets/images/9. Reciclaje tapas 2024 - 1.jpg",
    "assets/images/9. Reciclaje tapas 2024 - 2.jpg",
    "assets/images/9. Reciclaje tapas 2024 - 3.jpg",
    "assets/images/9. Reciclaje tapas 2024 - 4.jpg",
    "assets/images/9. Reciclaje tapas 2024 - 5.jpg",
    "assets/images/9. Reciclaje tapas 2024 - 6.jpg",
    "assets/images/9. Reforestación 2024 - 1.jpg",
    "assets/images/9. Reforestación 2024 - 2.jpg",
    "assets/images/9. Reforestación 2024 - 3.jpg",
    "assets/images/9. Reforestación 2024 - 4.jpg",
    "assets/images/9. Reforestación 2024 - 5.jpg",
    "assets/images/9. Reforestación 2024 - 6.jpg",
    "assets/images/9. Reforestación 2024 - 7.jpg"
];

// --- TEMPORARY DATA FOR MIGRATION ---
const activitiesSeedData = [
    { title: 'Creación de la huerta y primera siembra', description: 'Iniciamos nuestro proyecto en marzo de 2023 con la construcción de nuestra huerta escolar, involucrando a estudiantes y docentes.', year: '2023', thumbnail: 'assets/images/2. Inicio marzo 2023 - 1.jpg', images: ['assets/images/2. Inicio marzo 2023 - 0.jpg', 'assets/images/2. Inicio marzo 2023 - 1.jpg', 'assets/images/2. Inicio marzo 2023 - 2.jpg', 'assets/images/2. Inicio marzo 2023 - 3.jpg', 'assets/images/2. Inicio marzo 2023 - 4.jpg', 'assets/images/2. Inicio marzo 2023 - 5.jpg', 'assets/images/2. Inicio marzo 2023 - 6.jpg', 'assets/images/2. Inicio marzo 2023 - 7.jpg', 'assets/images/2. Inicio marzo 2023 - 8.jpg', 'assets/images/2. Inicio marzo 2023 - 9.jpg'] },
    { title: 'Entrega de plántulas para huerta casera - 20 de sep', description: 'Recibimos y distribuimos plántulas de árboles nativos para reforestación y huertas caseras', year: '2023', thumbnail: 'assets/images/3. Plántulas reforestación 2023 - 1.jpg', images: ['assets/images/3. Plántulas reforestación 2023 - 1.jpg', 'assets/images/3. Plántulas reforestación 2023 - 2.jpg', 'assets/images/3. Plántulas reforestación 2023 - 3.jpg', 'assets/images/3. Plántulas reforestación 2023 - 4.jpg', 'assets/images/3. Plántulas reforestación 2023 - 5.jpg', 'assets/images/3. Plántulas reforestación 2023 - 6.jpg', 'assets/images/3. Plántulas reforestación 2023 - 7.jpg', 'assets/images/3. Plántulas reforestación 2023 - 8.jpg', 'assets/images/3. Plántulas reforestación 2023 - 9.jpg', 'assets/images/3. Plántulas reforestación 2023 - 10.jpg', 'assets/images/3. Plántulas reforestación 2023 - 11.jpg'] },
    { title: 'Mantenimiento y puesta de estacas - 4 de marzo', description: 'Jornada de mantenimiento y adecuaciones de la huerta', year: '2024', thumbnail: 'assets/images/4. 4 marzo 2024 Estacas - 1.jpg', images: ['assets/images/4. 4 marzo 2024 Estacas - 1.jpg', 'assets/images/4. 4 marzo 2024 Estacas - 2.jpg', 'assets/images/4. 4 marzo 2024 Estacas - 3.jpg', 'assets/images/4. 4 marzo 2024 Estacas - 4.jpg', 'assets/images/4. 4 marzo 2024 Estacas - 5.jpg'] },
    { title: 'Limpieza de zonas aledañas - 19 de marzo', description: 'Jornada de limpieza en las áreas cercanas a nuestra institución.', year: '2024', thumbnail: 'assets/images/5. Limpieza de zonas 2024 - 5.jpg', images: ['assets/images/5. Limpieza de zonas 2024 - 1.jpg', 'assets/images/5. Limpieza de zonas 2024 - 2.jpg', 'assets/images/5. Limpieza de zonas 2024 - 3.jpg', 'assets/images/5. Limpieza de zonas 2024 - 4.jpg', 'assets/images/5. Limpieza de zonas 2024 - 5.jpg', 'assets/images/5. Limpieza de zonas 2024 - 6.jpg', 'assets/images/5. Limpieza de zonas 2024 - 7.jpg'] },
    { title: 'Mantenimiento, plástico y riego - Todo abril', description: 'Actividades diarias de cuidado de nuestra huerta orgánica.', year: '2024', thumbnail: 'assets/images/6. Riego y mantenimiento 2024 - 1.jpg', images: ['assets/images/6. Riego y mantenimiento 2024 - 1.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 2.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 3.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 4.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 5.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 6.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 7.jpg', 'assets/images/6. Riego y mantenimiento 2024 - 8.jpg'] },
    { title: 'Segunda jornada de limpieza - 30 abril', description: 'Segunda jornada de limpieza de zonas aledañas', year: '2024', thumbnail: 'assets/images/6. Segunda limpieza 2024 - 1.jpg', images: ['assets/images/6. Segunda limpieza 2024 - 1.jpg', 'assets/images/6. Segunda limpieza 2024 - 2.jpg', 'assets/images/6. Segunda limpieza 2024 - 3.jpg', 'assets/images/6. Segunda limpieza 2024 - 4.jpg', 'assets/images/6. Segunda limpieza 2024 - 5.jpg'] },
    { title: 'Embellecimiento de la Huerta - Todo mayo', description: 'Transformando la imagen y el espacio de la huerta orgánica', year: '2024', thumbnail: 'assets/images/6. Embellecimiento 2024 - 10.jpg', images: ['assets/images/6. Embellecimiento 2024 - 1.jpg', 'assets/images/6. Embellecimiento 2024 - 2.jpg', 'assets/images/6. Embellecimiento 2024 - 3.jpg', 'assets/images/6. Embellecimiento 2024 - 4.jpg', 'assets/images/6. Embellecimiento 2024 - 5.jpg', 'assets/images/6. Embellecimiento 2024 - 6.jpg', 'assets/images/6. Embellecimiento 2024 - 7.jpg', 'assets/images/6. Embellecimiento 2024 - 8.jpg', 'assets/images/6. Embellecimiento 2024 - 9.jpg', 'assets/images/6. Embellecimiento 2024 - 10.jpg'] },
    { title: 'Reciclaje de tapas - 19 de Julio', description: 'Convirtiendo tapas en canecas para basuras. Proyecto de economía circular transformando tapas plásticas.', year: '2024', thumbnail: 'assets/images/7. Reciclaje de tapas 2024 - 3.jpg', images: ['assets/images/7. Reciclaje de tapas 2024 - 1.jpg', 'assets/images/7. Reciclaje de tapas 2024 - 2.jpg', 'assets/images/7. Reciclaje de tapas 2024 - 3.jpg', 'assets/images/7. Reciclaje de tapas 2024 - 4.jpg', 'assets/images/7. Reciclaje de tapas 2024 - 5.jpg'] },
    { title: 'Matenimiento - 9 de septiembre', description: 'Nuevas labores de mejora y adecuación', year: '2024', thumbnail: 'assets/images/8. sep 2024 mantenimiento - 5.jpg', images: ['assets/images/8. sep 2024 mantenimiento - 1.jpg', 'assets/images/8. sep 2024 mantenimiento - 2.jpg', 'assets/images/8. sep 2024 mantenimiento - 3.jpg', 'assets/images/8. sep 2024 mantenimiento - 4.jpg', 'assets/images/8. sep 2024 mantenimiento - 5.jpg', 'assets/images/8. sep 2024 mantenimiento - 6.jpg', 'assets/images/8. sep 2024 mantenimiento - 7.jpg', 'assets/images/8. sep 2024 mantenimiento - 8.jpg', 'assets/images/8. sep 2024 mantenimiento - 9.jpg', 'assets/images/8. sep 2024 mantenimiento - 10.jpg', 'assets/images/8. sep 2024 mantenimiento - 11.jpg'] },
    { title: 'Visita académica Agrosavia - 13 de septiembre', description: 'Visita educativa al Centro de Investigación La Selva de Agrosavia.', year: '2024', thumbnail: 'assets/images/4. Visita agrosavia octubre 2024 - 1.jpg', images: ['assets/images/4. Visita agrosavia octubre 2024 - 1.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 2.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 3.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 4.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 5.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 6.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 7.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 8.jpg', 'assets/images/4. Visita agrosavia octubre 2024 - 9.jpg'] },
    { title: 'Segundo Reciclaje de tapas - 27 de sep', description: 'Proyecto de economía circular transformando tapas plásticas.', year: '2024', thumbnail: 'assets/images/9. Reciclaje tapas 2024 - 1.jpg', images: ['assets/images/9. Reciclaje tapas 2024 - 1.jpg', 'assets/images/9. Reciclaje tapas 2024 - 2.jpg', 'assets/images/9. Reciclaje tapas 2024 - 3.jpg', 'assets/images/9. Reciclaje tapas 2024 - 4.jpg', 'assets/images/9. Reciclaje tapas 2024 - 5.jpg', 'assets/images/9. Reciclaje tapas 2024 - 6.jpg'] },
    { title: 'Donación y siembra de árboles - 3 de octubre', description: 'Recibimos más de 50 árboles nativos para reforestación.', year: '2024', thumbnail: 'assets/images/9. Reforestación 2024 - 5.jpg', images: ['assets/images/9. Reforestación 2024 - 1.jpg', 'assets/images/9. Reforestación 2024 - 2.jpg', 'assets/images/9. Reforestación 2024 - 3.jpg', 'assets/images/9. Reforestación 2024 - 4.jpg', 'assets/images/9. Reforestación 2024 - 5.jpg', 'assets/images/9. Reforestación 2024 - 6.jpg', 'assets/images/9. Reforestación 2024 - 7.jpg'] },
    { title: 'Capacitación CORNARE - 17 Febrero', description: 'Capacitación hortalizas y compost', year: '2025', thumbnail: 'assets/images/10. Capacitación CORNARE - 1.jpg', images: ['assets/images/10. Capacitación CORNARE - 1.jpg', 'assets/images/10. Capacitación CORNARE - 2.jpg', 'assets/images/10. Capacitación CORNARE - 3.jpg', 'assets/images/10. Capacitación CORNARE - 4.jpg', 'assets/images/10. Capacitación CORNARE - 5.jpg'] },
    { title: 'Reforestación Institucional - 4 de Marzo', description: 'Embelleciendo Barro Blanco', year: '2025', thumbnail: 'assets/images/10. Reforestación institucional - 4.jpg', images: ['assets/images/10. Reforestación institucional - 1.jpg', 'assets/images/10. Reforestación institucional - 2.jpg', 'assets/images/10. Reforestación institucional - 3.jpg', 'assets/images/10. Reforestación institucional - 4.jpg', 'assets/images/10. Reforestación institucional - 5.jpg'] },
    { title: 'Encuentro regional de semilleros - 7 de Marzo', description: 'Participación en encuentro regional de semilleros.', year: '2025', thumbnail: 'assets/images/10. Encuentro regional 2025 - 1.jpg', images: ['assets/images/10. Encuentro regional 2025 - 1.jpg', 'assets/images/10. Encuentro regional 2025 - 2.jpg', 'assets/images/10. Encuentro regional 2025 - 3.jpg', 'assets/images/10. Encuentro regional 2025 - 4.jpg', 'assets/images/10. Encuentro regional 2025 - 5.jpg', 'assets/images/10. Encuentro regional 2025 - 6.jpg', 'assets/images/10. Encuentro regional 2025 - 7.jpg', 'assets/images/10. Encuentro regional 2025 - 8.jpg', 'assets/images/10. Encuentro regional 2025 - 9.jpg', 'assets/images/10. Encuentro regional 2025 - 10.jpg'] },
    { title: 'Campaña ambiental 21 - 25 de Abril', description: 'Cuidado del medio ambiente en la institución', year: '2025', thumbnail: 'assets/images/11. Campaña ambiental - 7.jpg', images: ['assets/images/11. Campaña ambiental - 1.jpg', 'assets/images/11. Campaña ambiental - 2.jpg', 'assets/images/11. Campaña ambiental - 3.jpg', 'assets/images/11. Campaña ambiental - 4.jpg', 'assets/images/11. Campaña ambiental - 5.jpg', 'assets/images/11. Campaña ambiental - 6.jpg', 'assets/images/11. Campaña ambiental - 7.jpg',] },
    { title: 'Encuentro departamental de semilleros - 7 de Mayo', description: 'Representación en encuentro departamental de investigación.', year: '2025', thumbnail: 'assets/images/11. Encuentro departamental 2025 - 1.jpg', images: ['assets/images/11. Encuentro departamental 2025 - 1.jpg', 'assets/images/11. Encuentro departamental 2025 - 2.jpg', 'assets/images/11. Encuentro departamental 2025 - 3.jpg', 'assets/images/11. Encuentro departamental 2025 - 4.jpg', 'assets/images/11. Encuentro departamental 2025 - 5.jpg', 'assets/images/11. Encuentro departamental 2025 - 6.jpg', 'assets/images/11. Encuentro departamental 2025 - 7.jpg', 'assets/images/11. Encuentro departamental 2025 - 8.jpg', 'assets/images/11. Encuentro departamental 2025 - 9.jpg', 'assets/images/11. Encuentro departamental 2025 - 10.jpg', 'assets/images/11. Encuentro departamental 2025 - 11.jpg', 'assets/images/11. Encuentro departamental 2025 - 12.jpg', 'assets/images/11. Encuentro departamental 2025 - 13.jpg', 'assets/images/11. Encuentro departamental 2025 - 14.jpg', 'assets/images/11. Encuentro departamental 2025 - 15.jpg', 'assets/images/11. Encuentro departamental 2025 - 16.jpg', 'assets/images/11. Encuentro departamental 2025 - 17.jpg', '11. Encuentro departamental 2025 - 18 - copia.pdf'] },
    { title: 'Visita Agrosavia - Zanahoria - 13 de Mayo', description: 'Segunda visita enfocada en cultivo de zanahoria.', year: '2025', thumbnail: 'assets/images/12. Visita agrosavia 2025 - 1.jpg', images: ['assets/images/12. Visita agrosavia 2025 - 1.jpg', 'assets/images/12. Visita agrosavia 2025 - 2.jpg', 'assets/images/12. Visita agrosavia 2025 - 3.jpg', 'assets/images/12. Visita agrosavia 2025 - 4.jpg', 'assets/images/12. Visita agrosavia 2025 - 5.jpg', 'assets/images/12. Visita agrosavia 2025 - 6.jpg', 'assets/images/12. Visita agrosavia 2025 - 7.jpg', 'assets/images/12. Visita agrosavia 2025 - 8.jpg'] },
    { title: 'Segunda siembra - 21 de Mayo', description: 'Segunda siembra del año en El vivero institucional', year: '2025', thumbnail: 'assets/images/13. Segunda siembra - 3.jpg', images: ['assets/images/13. Segunda siembra - 1.jpg', 'assets/images/13. Segunda siembra - 2.jpg', 'assets/images/13. Segunda siembra - 3.jpg', 'assets/images/13. Segunda siembra - 4.jpg', 'assets/images/13. Segunda siembra - 5.jpg', 'assets/images/13. Segunda siembra - 6.jpg', 'assets/images/13. Segunda siembra - 7.jpg', 'assets/images/13. Segunda siembra - 8.jpg', 'assets/images/13. Segunda siembra - 9.jpg',] },
    { title: 'Segunda Capacitación CORNARE - 27 de Mayo', description: 'CORNARE fortaleciendo la eduación ambiental ', year: '2025', thumbnail: 'assets/images/13. Segunda capacitación CORNARE - 1.jpg', images: ['assets/images/13. Segunda capacitación CORNARE - 1.jpg', 'assets/images/13. Segunda capacitación CORNARE - 2.jpg', 'assets/images/13. Segunda capacitación CORNARE - 3.jpg', 'assets/images/13. Segunda capacitación CORNARE - 4.jpg', 'assets/images/13. Segunda capacitación CORNARE - 5.jpg', 'assets/images/13. Segunda capacitación CORNARE - 6.jpg', 'assets/images/13. Segunda capacitación CORNARE - 7.jpg', 'assets/images/13. Segunda capacitación CORNARE - 8.jpg', 'assets/images/13. Segunda capacitación CORNARE - 9.jpg'] },
    { title: 'Preparación de compostaje - 3 de junio', description: 'Gracias a la capacitación del coordinador Jaime y CORNARE', year: '2025', thumbnail: 'assets/images/13. Preparación compostaje 2025 - 3.jpg', images: ['assets/images/13. Preparación compostaje 2025 - 1.jpg', 'assets/images/13. Preparación compostaje 2025 - 2.jpg', 'assets/images/13. Preparación compostaje 2025 - 3.jpg', 'assets/images/13. Preparación compostaje 2025 - 4.jpg', 'assets/images/13. Preparación compostaje 2025 - 5.jpg', 'assets/images/13. Preparación compostaje 2025 - 6.jpg', 'assets/images/13. Preparación compostaje 2025 - 7.jpg', 'assets/images/13. Preparación compostaje 2025 - 8.jpg'] },
    { title: 'Sembratón 1000 árboles 5 JUNIO', description: 'Sembratón en el lago de corazón y cumpleaños del líder ambiental', year: '2025', thumbnail: 'assets/images/14. Sembraton de 1000 árboles - 16.jpg', images: ['assets/images/14. Sembraton de 1000 árboles - 1.jpg', 'assets/images/14. Sembraton de 1000 árboles - 2.jpg', 'assets/images/14. Sembraton de 1000 árboles - 3.jpg', 'assets/images/14. Sembraton de 1000 árboles - 4.jpg', 'assets/images/14. Sembraton de 1000 árboles - 5.jpg', 'assets/images/14. Sembraton de 1000 árboles - 6.jpg', 'assets/images/14. Sembraton de 1000 árboles - 7.jpg', 'assets/images/14. Sembraton de 1000 árboles - 8.jpg', 'assets/images/14. Sembraton de 1000 árboles - 9.jpg', 'assets/images/14. Sembraton de 1000 árboles - 10.jpg', 'assets/images/14. Sembraton de 1000 árboles - 11.jpg', 'assets/images/14. Sembraton de 1000 árboles - 12.jpg', 'assets/images/14. Sembraton de 1000 árboles - 13.jpg', 'assets/images/14. Sembraton de 1000 árboles - 14.jpg', 'assets/images/14. Sembraton de 1000 árboles - 15.jpg', 'assets/images/14. Sembraton de 1000 árboles - 16.jpg', 'assets/images/14. Sembraton de 1000 árboles - 17.jpg', 'assets/images/14. Sembraton de 1000 árboles - 18.jpg'] },
    { title: 'Mantenimiento y siembra - 15 de Julio', description: 'Cuidando y sembrando en el vívero', year: '2025', thumbnail: 'assets/images/15. Siembra y mantenimiento 3.jpg', images: ['assets/images/15. Siembra y mantenimiento - 1.jpg', 'assets/images/15. Siembra y mantenimiento 2.jpg', 'assets/images/15. Siembra y mantenimiento 3.jpg', 'assets/images/15. Siembra y mantenimiento 4.jpg', 'assets/images/15. Siembra y mantenimiento 5.jpg', 'assets/images/15. Siembra y mantenimiento 6.jpg'] },
    { title: 'Microorganismos del suelo - 12 de Agosto', description: 'Se destapó el cultivo de microorganismos', year: '2025', thumbnail: 'assets/images/16. Miroorganismos del suelo - 1.jpg', images: ['assets/images/16. Miroorganismos del suelo - 1.jpg', 'assets/images/16. Miroorganismos del suelo - 2.jpg', 'assets/images/16. Miroorganismos del suelo - 3.jpg', 'assets/images/16. Miroorganismos del suelo - 4.jpg', 'assets/images/16. Miroorganismos del suelo - 5.jpg', 'assets/images/16. Miroorganismos del suelo - 6.jpg', 'assets/images/16. Miroorganismos del suelo - 7.jpg'] },
    { title: 'Visita microcuenca ARSA - 29 de Agosto', description: 'Planata de tratamiento y enseñanza de los procesos de purificación de agua', year: '2025', thumbnail: 'assets/images/17. Visita Microcuenca ARSA - 3.jpg', images: ['assets/images/17. Visita Microcuenca ARSA - 1.jpg', 'assets/images/17. Visita Microcuenca ARSA - 2.jpg', 'assets/images/17. Visita Microcuenca ARSA - 3.jpg', 'assets/images/17. Visita Microcuenca ARSA - 4.jpg', 'assets/images/17. Visita Microcuenca ARSA - 5.jpg', 'assets/images/17. Visita Microcuenca ARSA - 6.jpg', 'assets/images/17. Visita Microcuenca ARSA - 7.jpg', 'assets/images/17. Visita Microcuenca ARSA - 8.jpg', 'assets/images/17. Visita Microcuenca ARSA - 9.jpg', 'assets/images/17. Visita Microcuenca ARSA - 10.jpg', 'assets/images/17. Visita Microcuenca ARSA - 11.jpg', 'assets/images/17. Visita Microcuenca ARSA - 12.jpg', 'assets/images/17. Visita Microcuenca ARSA - 13.jpg', 'assets/images/17. Visita Microcuenca ARSA - 14.jpg', 'assets/images/17. Visita Microcuenca ARSA - 15.jpg'] },
    { title: 'Encuentro de semilleros IEBB 12 de Septiembre', description: 'Segundo conversatorio zonal de juventudes', year: '2025', thumbnail: 'assets/images/18. Encuentro semilleros IEBB - 4.jpg', images: ['assets/images/18. Encuentro semilleros IEBB - 1.jpg', 'assets/images/18. Encuentro semilleros IEBB - 2.jpg', 'assets/images/18. Encuentro semilleros IEBB - 3.jpg', 'assets/images/18. Encuentro semilleros IEBB - 4.jpg', 'assets/images/18. Encuentro semilleros IEBB - 5.jpg', 'assets/images/18. Encuentro semilleros IEBB - 6.jpg', 'assets/images/18. Encuentro semilleros IEBB - 7.jpg', 'assets/images/18. Encuentro semilleros IEBB - 8.jpg', 'assets/images/18. Encuentro semilleros IEBB - 9.jpg', 'assets/images/18. Encuentro semilleros IEBB - 10.jpg', 'assets/images/18. Encuentro semilleros IEBB - 11.jpg', 'assets/images/18. Encuentro semilleros IEBB - 12.jpg', 'assets/images/18. Encuentro semilleros IEBB - 13.jpg', 'assets/images/18. Encuentro semilleros IEBB - 14.jpg', 'assets/images/18. Encuentro semilleros IEBB - 15.jpg', 'assets/images/18. Encuentro semilleros IEBB - 16.jpg'] },
    { title: 'Décimo tercer (XIII) encuentro de ciencia, innovación e investigación formativa – ECIF 2025', description: 'Evento entre el 22 y 26 de septiembre en la Universidad Católica de Oriente (UCO).', year: '2025', thumbnail: 'assets/images/19. Encuentro UCO - 4.jpg', images: ['assets/images/19. Encuentro UCO - 1.jpg', 'assets/images/19. Encuentro UCO - 2.jpg', 'assets/images/19. Encuentro UCO - 3.jpg', 'assets/images/19. Encuentro UCO - 4.jpg', 'assets/images/19. Encuentro UCO - 5.jpg', 'assets/images/19. Encuentro UCO - 6.jpg', 'assets/images/19. Encuentro UCO - 7.jpg', 'assets/images/19. Encuentro UCO - 8.jpg', 'assets/images/19. Encuentro UCO - 9.jpg', 'assets/images/19. Encuentro UCO - 10.jpg', 'assets/images/19. Encuentro UCO - 11.jpg', 'assets/images/19. Encuentro UCO - 12.jpg'] },
    { title: 'Estado Actual de la huerta septiembre', description: 'Ahora la huerta escolar convertida en un vivero', year: '2025', thumbnail: 'assets/images/19. Vivero actual 2025 - 1.jpg', images: ['assets/images/19. Vivero actual 2025 - 1.jpg', 'assets/images/19. Vivero actual 2025 - 2.jpg', 'assets/images/19. Vivero actual 2025 - 3.jpg', 'assets/images/19. Vivero actual 2025 - 4.jpg', 'assets/images/19. Vivero actual 2025 - 5.jpg', 'assets/images/19. Vivero actual 2025 - 6.jpg'] },
    { title: 'Encuentro Nacional de semilleros de investigación', description: 'Participación en encuentro nacional de semilleros de investigación -Bogotá 7 - 10 de octubre 2025', year: '2025', thumbnail: 'assets/images/20. Encuentro Nacional 2025 - 8.jpg', images: ['assets/images/20. Encuentro Nacional 2025 - 1.jpg', 'assets/images/20. Encuentro Nacional 2025 - 2.jpg', 'assets/images/20. Encuentro Nacional 2025 - 3.jpg', 'assets/images/20. Encuentro Nacional 2025 - 4.jpg', 'assets/images/20. Encuentro Nacional 2025 - 5.jpg', 'assets/images/20. Encuentro Nacional 2025 - 6.jpg', 'assets/images/20. Encuentro Nacional 2025 - 7.jpg', 'assets/images/20. Encuentro Nacional 2025 - 8.jpg', 'assets/images/20. Encuentro Nacional 2025 - 9.jpg', 'assets/images/20. Encuentro Nacional 2025 - 10.jpg', 'assets/images/20. Encuentro Nacional 2025 - 11.jpg'] }
];

const videosSeedData = [
    { title: 'Planting a Sustainable Future', description: 'Documental completo sobre nuestro proyecto Green Force y nuestra postulación al Premio Zayed 2025.', videoId: 'H_0aTsx8C-w', thumbnail: 'https://img.youtube.com/vi/H_0aTsx8C-w/hqdefault.jpg' },
    { title: 'Fomentando la Conciencia Ambiental', description: 'Video sobre el fomento de la conciencia ambiental en nuestra institución.', videoId: 'XeIvLfG3K3A', thumbnail: 'https://img.youtube.com/vi/XeIvLfG3K3A/hqdefault.jpg' },
    { title: 'Green Force: Nace un Movimiento Ambiental', description: 'Presentación inicial de nuestro proyecto Green Force en la IE Barro Blanco.', videoId: '9StDvt-2Nbs', thumbnail: 'https://img.youtube.com/vi/9StDvt-2Nbs/hqdefault.jpg' },
    { title: 'Reforestación - 1000 Árboles (Short)', description: 'Jornada de reforestación como parte de nuestra postulación al Premio Zayed 2025.', videoId: 'QUC-DD5WTRI', thumbnail: 'https://img.youtube.com/vi/QUC-DD5WTRI/hqdefault.jpg', isShort: true }
];

const seedData = {
    activities: activitiesSeedData,
    videos: videosSeedData
};

// --- SEED FUNCTION ---
window.seedDatabase = async () => {
    console.log("Starting DB Seed...");
    if (!confirm("This will upload all activities and videos to Firestore. Continue?")) return;

    try {
        const activitiesColl = collection(db, "activities");
        for (const act of activitiesSeedData) {
            await addDoc(activitiesColl, {
                ...act,
                createdAt: serverTimestamp(),
                date: serverTimestamp(), // Default to now, need to edit later or parse title dates
                status: 'published',
                createdBy: { uid: 'system', name: 'System' }
            });
            console.log("Added:", act.title);
        }

        const videosColl = collection(db, "videos");
        for (const vid of videosSeedData) {
            await addDoc(videosColl, {
                ...vid,
                createdAt: serverTimestamp(),
                status: 'published',
                createdBy: { uid: 'system', name: 'System' }
            });
            console.log("Added video:", vid.title);
        }
        alert("Seeding complete! Refresh page.");
    } catch (e) {
        console.error("Seeding failed", e);
        alert("Error seeding DB: " + e.message);
    }
};

// --- GLOBAL STATE ---
window.currentGalleryActivities = [];
window.currentGalleryVideos = [];
window.currentDocuments = [];

// --- DOCUMENTS LOGIC ---

const staticDocuments = [
    { title: 'Reconocimiento Oficial Grupo Ambiental 2024', type: 'pdf', year: '2024', url: 'assets/documents/1.1 Reconocimiento Oficial del Grupo Ambiental 2024.pdf', fileName: '1.1 Reconocimiento Oficial del Grupo Ambiental 2024.pdf', backgroundImage: 'assets/images/1. logo 1.jpg' },
    { title: 'Solicitud vinculación CORNARE', type: 'pdf', year: '2025', url: 'assets/documents/1.10. 6. Carta Solicitud de vinculación a prácticas ambientales y visitas pedagógicas CAM CORNARE.pdf', fileName: '1.10. 6. Carta Solicitud de vinculación.pdf', backgroundImage: 'assets/images/10. Capacitación CORNARE - 1.jpg' },
    { title: 'Solicitud visita Planta Tratamiento', type: 'pdf', year: '2025', url: 'assets/documents/1.11. 11. Carta Solicitud de pedagógica a la planta de tratamiento y participación en jornada de siembra de árboles.pdf', fileName: '1.11. 11. Carta Solicitud visita.pdf', backgroundImage: 'assets/images/13. Segunda siembra - 1.jpg' },
    { title: 'Solicitud permiso evento UCO (Sep 2025)', type: 'pdf', year: '2025', url: 'assets/documents/1.12. 12. Carta Solicitud de permiso para participación en evento académico de 22 al 26 de septiembre de 2025 en la UCO.pdf', fileName: '1.12. 12. Solicitud UCO.pdf', backgroundImage: 'assets/images/19. Encuentro UCO - 1.jpg' },
    { title: 'Poster Green Force - ENISIS', type: 'pdf', year: '2025', url: 'assets/documents/1.13. Poster 3 Green force - ENISIS.pdf', fileName: '1.13. Poster 3 Green force.pdf', backgroundImage: 'assets/images/20. Encuentro Nacional 2025 - 1.jpg' },
    { title: 'Informe 1 - Evaluación PRAE 2024', type: 'pdf', year: '2024', url: 'assets/documents/1.2. Informe 1 - Evaluación del Proyecto Ambiental Escolar (GREEN FORCE).pdf', fileName: '1.2. Informe 1.pdf', backgroundImage: 'assets/images/1. logo 2.jpg' },
    { title: 'Solicitud Actividades Extracurriculares 2024', type: 'pdf', year: '2024', url: 'assets/documents/1.3. Solicitud de Autorización para Actividades Extracurriculares del Grupo Ambiental “Green Force” – Segundo Semestre 2024.pdf', fileName: '1.3. Solicitud Extracurriculares.pdf', backgroundImage: 'assets/images/6. Riego y mantenimiento 2024 - 1.jpg' },
    { title: 'Informe 2 de Actividades', type: 'pdf', year: '2024', url: 'assets/documents/1.4. Informe 2 de Actividades del Grupo Ambiental.pdf', fileName: '1.4. Informe 2.pdf', backgroundImage: 'assets/images/14. Sembraton de 1000 árboles - 1.jpg' },
    { title: 'Poster 1 - Conciencia Ambiental', type: 'pdf', year: '2025', url: 'assets/documents/1.5. Poster 1 Fomento de la conciencia ambiental y desarrollo sostenible a través de la creación del grupo.pdf', fileName: '1.5. Poster 1.pdf', backgroundImage: 'assets/images/11. Campaña ambiental - 1.jpg' },
    { title: 'Poster 2 - Semillero Green Force', type: 'pdf', year: '2025', url: 'assets/documents/1.6. Poster 2 Semillero IE Barro Blanco Green Force 2025.pdf', fileName: '1.6. Poster 2.pdf', backgroundImage: 'assets/images/18. Encuentro semilleros IEBB - 1.jpg' },
    { title: 'Reconocimiento Oficial 2025', type: 'pdf', year: '2025', url: 'assets/documents/1.8. Reconocimiento Oficial del Grupo Ambiental 2025.pdf', fileName: '1.8. Reconocimiento 2025.pdf', backgroundImage: 'assets/images/1. logo green force v6 fondo blanco.png' },
    { title: 'Solicitud Visita AGROSAVIA (Mayo 2025)', type: 'pdf', year: '2025', url: 'assets/documents/1.9. Carta Solicitud de Visita Educativa AGROSAVIA para la Semana del 12 al 16 de mayo de 2025.pdf', fileName: '1.9. Solicitud AGROSAVIA.pdf', backgroundImage: 'assets/images/12. Visita agrosavia 2025 - 1.jpg' },
    { title: 'Encuentro Departamental 2025', type: 'pdf', year: '2025', url: 'assets/documents/11. Encuentro departamental 2025 - 18 - copia.pdf', fileName: '11. Encuentro departamental 2025.pdf', backgroundImage: 'assets/images/11. Encuentro departamental 2025 - 1.jpg' },
    { title: 'Propuesta Educativa', type: 'pdf', year: '2025', url: 'assets/documents/propuesta_educativa.pdf', fileName: 'propuesta_educativa.pdf', backgroundImage: 'assets/images/1. logo 3.jpg' }
];

// --- DOCUMENT LOGIC ---

export async function loadDocuments() {
    const grid = document.getElementById('documentsGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando documentos...</div>';

    try {
        const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        let documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });

        console.log("Documents FETCHED from DB:", documents);

        // Always merge static documents with DB documents
        // This ensures the default files (GitHub) are always shown
        documents = [...documents, ...staticDocuments];

        window.currentDocuments = documents;

        // Default filter to 'all' (Todos) to show everything initially
        const activeYearBtn = document.querySelector('#docsYearSelector .year-pill.active');
        const defaultYear = activeYearBtn ? activeYearBtn.getAttribute('data-year') : 'all';

        filterDocumentsByYear(defaultYear);

    } catch (e) {
        console.error("Error loading documents:", e);
        grid.innerHTML = '<p style="text-align: center; color: red;">Error al cargar documentos.</p>';
    }
}

export function filterDocumentsByYear(year) {
    // Update UI buttons
    document.querySelectorAll('#docsYearSelector .year-pill').forEach(btn => {
        if (btn.getAttribute('data-year') === year) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (!window.currentDocuments) return;

    const filtered = window.currentDocuments.filter(doc => {
        if (year === 'all') return true;
        // Ensure string comparison
        return (doc.year || '').toString() === year;
    });

    renderDocumentCards(filtered);
}

function renderDocumentCards(documents) {
    const grid = document.getElementById('documentsGrid');
    if (!grid) return;

    if (documents.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No hay documentos disponibles para este año.</p>';
        return;
    }

    // Check admin role (using same simplistic check as gallery for now, should use auth.currentUser limits in real app)
    const isAdmin = window.currentUserEmail === 'greenforceiebb@gmail.com' || (auth.currentUser && auth.currentUser.email === 'greenforceiebb@gmail.com');

    grid.innerHTML = documents.map(doc => {
        let iconClass = 'fa-file-alt';
        if (doc.type === 'pdf') iconClass = 'fa-file-pdf';
        else if (doc.type === 'word') iconClass = 'fa-file-word';
        else if (doc.type === 'excel') iconClass = 'fa-file-excel';

        let bgStyle = '';
        let cardClass = 'document-card';

        // REVERT: Removed background image logic
        let bgImage = null;

        const cardClassFinal = cardClass;

        return `
        <div class="${cardClassFinal}" style="${bgStyle}" onclick="window.open('${doc.url}', '_blank')">
            <div class="doc-overlay"></div>
            <div class="doc-icon-container">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="doc-info">
                <h4>${doc.title}</h4>
                <span class="doc-year">${doc.year}</span>
            </div>
            ${isAdmin ? `<button class="delete-btn-doc" onclick="event.stopPropagation(); deleteDocument('${doc.id}', '${doc.fileName}')"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        `;
    }).join('');
}

export async function deleteDocument(docId, fileName) {
    if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) return;

    try {
        // 1. Delete from Firestore
        await deleteDoc(doc(db, "documents", docId));

        // 2. Delete from Storage (if fileName is available)
        // Note: We need to store reference or path to delete cleanly. 
        // For now, if we don't have exact path, we might skip or try to guess.
        // Ideally we store 'storagePath' in the doc.

        alert("Documento eliminado.");
        loadDocuments(); // Reload
    } catch (e) {
        console.error("Error deleting document:", e);
        alert("Error al eliminar documento: " + e.message);
    }
}
window.deleteDocument = deleteDocument; // Expose globally for onclick
window.filterDocumentsByYear = filterDocumentsByYear; // Expose globally
window.loadDocuments = loadDocuments; // Expose globally for navigation


// La variable seedData ya fue definida correctamente arriba agrupando las constantes activitiesSeedData y videosSeedData corregidas.

// Configuración de fondo
// (Movido arriba para evitar problemas de referencia)


export async function loadActivities(targetId = 'galleryGridFull') {
    const grid = document.getElementById(targetId);
    if (!grid) return;

    grid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando actividades...</div>';

    try {
        const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const activities = [];
        querySnapshot.forEach((doc) => {
            activities.push({ id: doc.id, ...doc.data() });
        });

        // Combinar datos de Firestore con Seed Data para asegurar que se muestre todo
        // Usamos un Map por título para evitar duplicados si ya se subieron
        const activitiesMap = new Map();

        // Primero cargamos los seed (históricos)
        seedData.activities.forEach(act => activitiesMap.set(act.title, act));

        // Luego sobreescribimos/añadimos con los de Firestore (más recientes o editados)
        activities.forEach(act => activitiesMap.set(act.title, act));

        const finalActivities = Array.from(activitiesMap.values())
            .sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));

        window.currentGalleryActivities = finalActivities;
        renderActivityCards(finalActivities, targetId);

    } catch (e) {
        console.error("Error loading activities:", e);
        window.currentGalleryActivities = seedData.activities;
        renderActivityCards(seedData.activities, targetId);
    }
}

/**
 * Filtra las actividades cargadas por una fecha específica o año.
 * @param {string} dateString - El valor del input date (YYYY-MM-DD).
 */
export function filterActivitiesByDate(dateString) {
    if (!window.currentGalleryActivities) return;

    if (!dateString) {
        renderActivityCards(window.currentGalleryActivities);
        return;
    }

    const filtered = window.currentGalleryActivities.filter(act => {
        // Si hay una fecha en Firestore (como Timestamp)
        if (act.date && act.date.toDate) {
            const actDate = act.date.toDate().toISOString().split('T')[0];
            return actDate === dateString;
        }
        // Si el título contiene la fecha (legacy) o el año coincide
        const year = dateString.split('-')[0];
        return act.title.toLowerCase().includes(dateString) || act.year === year;
    });

    renderActivityCards(filtered);
}

/**
 * Crea una nueva actividad/evento en Firestore con soporte para múltiples fotos.
 */
// --- CREATE & UPDATE ACTIVITIES ---

export async function createActivity(data, photos) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Debes iniciar sesión para crear eventos.");

        const imageUrls = [];

        // Subir fotos a Storage (Solo si hay fotos)
        if (photos && photos.length > 0) {
            for (let i = 0; i < photos.length; i++) {
                const file = photos[i];
                const storageRef = ref(storage, `activities/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }
        }

        // Create Date object with time if provided
        let eventDate;
        if (data.time) {
            eventDate = new Date(`${data.date}T${data.time}`);
        } else {
            eventDate = new Date(`${data.date}T00:00:00`);
        }

        const newActivity = {
            title: data.title,
            description: data.notes || '',
            date: Timestamp.fromDate(eventDate),
            year: data.date.split('-')[0],
            thumbnail: imageUrls[0] || 'assets/images/1. logo 1.jpg',
            images: imageUrls,
            createdAt: serverTimestamp(),
            createdBy: {
                uid: user.uid,
                name: user.displayName || user.email
            },
            status: 'published'
        };

        const docRef = await addDoc(collection(db, "activities"), newActivity);
        console.log("Actividad creada con ID:", docRef.id);

        // Recargar actividades y cronograma
        await loadActivities();
        await loadCronograma();
        return docRef.id;

    } catch (error) {
        console.error("Error en createActivity:", error);
        throw error;
    }
}

export async function updateActivity(id, data, newPhotos) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Debes iniciar sesión para editar eventos.");

        const imageUrls = data.existingImages || [];

        // Subir fotos nuevas a Storage (Solo si hay fotos)
        if (newPhotos && newPhotos.length > 0) {
            for (let i = 0; i < newPhotos.length; i++) {
                const file = newPhotos[i];
                const storageRef = ref(storage, `activities/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }
        }

        // Create Date object with time if provided
        let eventDate;
        if (data.time) {
            eventDate = new Date(`${data.date}T${data.time}`);
        } else {
            eventDate = new Date(`${data.date}T00:00:00`);
        }

        const updatedData = {
            title: data.title,
            description: data.notes || '',
            date: Timestamp.fromDate(eventDate),
            year: data.date.split('-')[0],
            updatedAt: serverTimestamp(),
            updatedBy: {
                uid: user.uid,
                name: user.displayName || user.email
            }
        };

        if (imageUrls.length > 0) {
            updatedData.images = imageUrls;
            updatedData.thumbnail = imageUrls[0];
        }

        const docRef = doc(db, "activities", id);
        await updateDoc(docRef, updatedData);
        console.log("Actividad actualizada con ID:", id);

        // Recargar actividades y cronograma
        await loadActivities();
        await loadCronograma();
        return id;

    } catch (error) {
        console.error("Error en updateActivity:", error);
        throw error;
    }
}

export async function loadVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando videos...</div>';

    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const firestoreVideos = [];
        querySnapshot.forEach((doc) => {
            firestoreVideos.push({ id: doc.id, ...doc.data() });
        });

        // Combinar videos
        const videosMap = new Map();
        seedData.videos.forEach(v => videosMap.set(v.videoId, v));
        firestoreVideos.forEach(v => videosMap.set(v.videoId, v));

        const videosToRender = Array.from(videosMap.values());
        window.currentGalleryVideos = videosToRender;
        renderVideoCards(videosToRender);

    } catch (e) {
        console.error("Error// Reading file first:", e);
        renderVideoCards(seedData.videos);
    }
}

/**
 * Inicia el carrusel de fondo aleatorio.
 * @param {string[]} customImages - Lista opcional de imágenes. Si no se pasa, usa todas las disponibles.
 */
export function initBackgroundSlideshow(customImages = null) {
    const bgContainer = document.getElementById('app-background');
    if (!bgContainer) return;

    const imagesToUse = customImages || allBackgroundImages;
    // Mezclar imágenes
    const shuffled = [...imagesToUse].sort(() => 0.5 - Math.random());

    bgContainer.innerHTML = ''; // Limpiar si había algo

    // Crear capas de slide
    shuffled.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'bg-slide';
        // Usar la ruta completa
        const imgPath = img.startsWith('assets') ? img : `assets/images/${encodeURIComponent(img)}`;
        slide.style.backgroundImage = `url('${imgPath}')`;
        if (index === 0) slide.classList.add('active');
        bgContainer.appendChild(slide);
    });

    let currentSlide = 0;
    const slides = bgContainer.querySelectorAll('.bg-slide');

    if (slides.length < 2) return;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');

        // Selección aleatoria que no sea el mismo slide actual
        let nextSlide;
        do {
            nextSlide = Math.floor(Math.random() * slides.length);
        } while (nextSlide === currentSlide);

        currentSlide = nextSlide;
        slides[currentSlide].classList.add('active');
    }, 6000); // Cambiar cada 6 segundos
}

// Iniciar automáticamente si el contenedor existe (para index.html)
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en index.html, cargamos todas las imágenes
    if (document.getElementById('app-background') && !window.location.pathname.includes('login.html')) {
        initBackgroundSlideshow();
    }
});

// --- RENDER HELPERS ---
function renderActivityCards(activities, targetId = 'activitiesGrid') {
    const grid = document.getElementById(targetId);
    if (!grid) return;

    // Simular rol admin (mejorar si hay sistema de roles real)
    const isAdmin = window.currentUserEmail === 'greenforceiebb@gmail.com';

    grid.innerHTML = activities.map((a, i) => `
        <div class="activity-card" onclick="openGalleryModal(${i})">
          <div class="activity-card-image">
            <img src="${a.thumbnail}" alt="${a.title}">
            <div class="image-count"><i class="fas fa-images"></i> ${a.images ? a.images.length : 0}</div>
            ${isAdmin ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteActivity('${a.id}')"><i class="fas fa-trash"></i></button>` : ''}
          </div>
          <div class="activity-card-content">
            <h3>${a.title}</h3>
            <p>${a.description}</p>
            <div class="activity-card-footer">
              <span class="activity-year"><i class="fas fa-calendar-alt"></i> ${a.year || '2025'}</span>
              <button class="view-gallery-btn">Ver Galería <i class="fas fa-arrow-right"></i></button>
            </div>
          </div>
        </div>
    `).join('');
}

function renderVideoCards(videos) {
    const grid = document.getElementById('videosGrid');
    const isAdmin = window.currentUserRole === 'admin';

    grid.innerHTML = videos.map((v, i) => `
        <div class="video-card" onclick="openVideoModal(${i})">
          <div class="video-thumbnail">
            <img src="${v.thumbnail}" alt="${v.title}">
            <div class="play-icon"><i class="fas fa-play-circle"></i></div>
            ${isAdmin ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteVideo('${v.id}')"><i class="fas fa-trash"></i></button>` : ''}
          </div>
          <div class="video-info">
            <h3>${v.title}</h3>
            <p>${v.description}</p>
          </div>
        </div>
    `).join('');
}

// --- DELETE FUNCTIONS (Admin Only) ---
window.deleteActivity = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.')) return;

    try {
        await deleteDoc(doc(db, "activities", id));
        alert('Actividad eliminada correctamente.');
        loadActivities(); // Reload list
    } catch (e) {
        console.error("Error eliminando actividad:", e);
        alert("Error al eliminar: " + e.message);
    }
};

window.deleteVideo = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este video?')) return;

    try {
        await deleteDoc(doc(db, "videos", id));
        alert('Video eliminado correctamente.');
        loadVideos(); // Reload list
    } catch (e) {
        console.error("Error eliminando video:", e);
        alert("Error al eliminar: " + e.message);
    }
};

// --- ADMIN UI CONTROL ---
window.updateAdminUI = () => {
    const isAdmin = window.currentUserRole === 'admin';
    document.querySelectorAll('.admin-controls').forEach(el => {
        el.style.display = isAdmin ? 'block' : 'none';
    });
    // Explicitly handle document new button if it doesn't have the class
    const btnNewDoc = document.getElementById('btnNewDoc');
    if (btnNewDoc) btnNewDoc.style.display = isAdmin ? 'inline-block' : 'none'; // inline-block to match other buttons behavior
};

// --- UPLOAD MODAL LOGIC ---
window.openUploadModal = (type) => {
    const modal = document.getElementById('uploadModal');
    const title = document.getElementById('uploadModalTitle');
    const typeInput = document.getElementById('uploadType');
    const activityFields = document.getElementById('activityFields');
    const videoFields = document.getElementById('videoFields');
    const documentFields = document.getElementById('documentFields');

    if (!modal) return;

    typeInput.value = type;
    // Reset all
    activityFields.style.display = 'none';
    videoFields.style.display = 'none';
    if (documentFields) documentFields.style.display = 'none';

    if (type === 'activity' || type === 'event') {
        title.innerHTML = type === 'event' ? '<i class="fas fa-calendar-plus"></i> Nueva Actividad' : '<i class="fas fa-camera"></i> Nueva Actividad';
        activityFields.style.display = 'block';
    } else if (type === 'video') {
        title.innerHTML = '<i class="fas fa-video"></i> Nuevo Video';
        videoFields.style.display = 'block';
    } else if (type === 'document') {
        title.innerHTML = '<i class="fas fa-file-upload"></i> Subir Documento';
        if (documentFields) documentFields.style.display = 'block';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeUploadModal = () => {
    const modal = document.getElementById('uploadModal');
    if (modal) modal.classList.remove('active');
    document.getElementById('uploadForm').reset();
    document.body.style.overflow = 'auto';
};

// --- UPLOAD HELPERS ---
async function uploadImage(file, path) {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

// --- HANDLE UPLOAD SUBMISSION ---
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('uploadType').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

    try {
        const title = document.getElementById('uploadTitle').value;
        const description = document.getElementById('uploadDescription').value;
        const year = document.getElementById('uploadYear').value;

        const data = {
            title,
            description,
            year: parseInt(year) || new Date().getFullYear(),
            createdAt: serverTimestamp()
        };

        if (type === 'activity' || type === 'event') {
            const thumbnailFile = document.getElementById('uploadThumbnail').files[0];
            const imageFiles = document.getElementById('uploadImages').files;

            let thumbnail = 'assets/images/default.jpg';
            if (thumbnailFile) {
                thumbnail = await uploadImage(thumbnailFile, `activities/${Date.now()}_thumb_${thumbnailFile.name}`);
            }
            data.thumbnail = thumbnail;

            const images = [];
            if (imageFiles && imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const url = await uploadImage(imageFiles[i], `activities/${Date.now()}_img_${i}_${imageFiles[i].name}`);
                    images.push(url);
                }
            } else if (thumbnailFile) {
                // If no gallery images but thumbnail exists, use thumbnail as first image
                images.push(thumbnail);
            }
            data.images = images;

            await addDoc(collection(db, "activities"), data);
            alert('Actividad creada exitosamente');
            loadActivities();
            if (window.loadCronograma) window.loadCronograma();
        } else if (type === 'document') {
            const docFile = document.getElementById('uploadDocumentFile').files[0];
            const bgImageFile = document.getElementById('uploadDocumentImage').files[0]; // New field

            if (!docFile) throw new Error("Debes seleccionar un archivo.");

            const storagePath = `documents/${Date.now()}_${docFile.name}`;
            const url = await uploadImage(docFile, storagePath);

            data.url = url;
            data.fileName = docFile.name;

            // Handle background image if exists
            if (bgImageFile) {
                const bgPath = `documents/bg_${Date.now()}_${bgImageFile.name}`;
                data.backgroundImage = await uploadImage(bgImageFile, bgPath);
            }

            // Determine type
            const ext = docFile.name.split('.').pop().toLowerCase();
            if (ext === 'pdf') data.type = 'pdf';
            else if (['doc', 'docx'].includes(ext)) data.type = 'word';
            else if (['xls', 'xlsx'].includes(ext)) data.type = 'excel';
            else data.type = 'other';

            await addDoc(collection(db, "documents"), data);
            alert('Documento subido exitosamente');
            loadDocuments();

        } else {
            const videoId = document.getElementById('uploadVideoId').value;
            const thumbnailFile = document.getElementById('uploadVideoThumbnail').files[0];

            data.videoId = videoId;

            if (thumbnailFile) {
                data.thumbnail = await uploadImage(thumbnailFile, `videos/${Date.now()}_thumb_${thumbnailFile.name}`);
            } else {
                data.thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }

            await addDoc(collection(db, "videos"), data);
            alert('Video agregado exitosamente');
            loadVideos();
        }

        window.closeUploadModal();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al guardar: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// --- MODAL LOGIC (Global attachment) ---
let currentLightboxIndex = 0;

window.openGalleryModal = (index) => {
    const activity = window.currentGalleryActivities[index];
    if (!activity) return;

    const modal = document.getElementById('galleryModal');
    // Using correct ID from index.html
    const title = document.getElementById('galleryModalTitle');
    // Using correct ID for body/grid from index.html
    const grid = document.getElementById('galleryModalBody');

    // Also update description and date if they exist
    const desc = document.getElementById('galleryModalDescription');
    const date = document.getElementById('galleryModalDate');

    // Set global for lightbox
    window.currentActivityImages = activity.images || [];

    if (title) title.textContent = activity.title;
    if (desc) desc.textContent = activity.description || '';
    if (date) date.textContent = activity.year || '';

    if (grid) {
        grid.innerHTML = (activity.images || []).map((img, i) => `
            <div class="gallery-item" onclick="openLightbox(${i})">
                <img src="${img}" loading="lazy" alt="Foto ${i + 1}">
            </div>
        `).join('');
    }

    // Initialize social features for this activity
    initSocialFeatures(activity.id);

    if (modal) {
        modal.classList.add('active'); // Use class instead of display: block for animation consistency
        modal.style.display = 'block'; // Keep ensuring display for safety
        document.body.style.overflow = 'hidden';
    }
};

window.closeGalleryModal = () => {
    // Unsubscribe from real-time listeners
    if (unsubscribeLikes) unsubscribeLikes();
    if (unsubscribeComments) unsubscribeComments();

    const modal = document.getElementById('galleryModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300); // Wait for transition
    }
};

window.openVideoModal = (index) => {
    const video = window.currentGalleryVideos[index];
    if (!video) return;

    const modal = document.getElementById('videoModal');
    const title = document.getElementById('videoModalTitle');
    const iframe = document.getElementById('videoModalIframe');

    if (title) title.innerHTML = `<i class="fab fa-youtube"></i> ${video.title}`;

    if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1`;
    }

    if (modal) {
        modal.classList.add('active'); // Using class 'active' based on CSS usually
        // But let's check index.html usages. It seems index used classList.add('active')
        // While gallery.js used style.display = 'block' for galleryModal.
        // Let's standardize on classList.add('active') if CSS supports it, or style.display.
        // Checking previous gallery.js: it used style.display = 'block' for galleryModal.
        // checking index.html: it used classList.add('active') for videoModal.
        // I will support both styles for safety or check CSS.
        // Let's stick to what was in index.html for videoModal: classList.add('active')
        modal.style.display = 'flex'; // often flex for centering
        document.body.style.overflow = 'hidden';
    }
};

window.closeVideoModal = () => {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoModalIframe');

    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
    if (iframe) iframe.src = '';
    document.body.style.overflow = 'auto';
};

// --- LIGHTBOX LOGIC ---
window.openLightbox = (index) => {
    currentLightboxIndex = index;
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImage');

    if (img && window.currentActivityImages[index]) {
        img.src = window.currentActivityImages[index];
    }

    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeLightbox = () => {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.navigateLightbox = (dir) => {
    currentLightboxIndex += dir;
    const images = window.currentActivityImages || [];

    if (currentLightboxIndex < 0) currentLightboxIndex = images.length - 1;
    if (currentLightboxIndex >= images.length) currentLightboxIndex = 0;

    const img = document.getElementById('lightboxImage');
    if (img && images[currentLightboxIndex]) {
        img.src = images[currentLightboxIndex];
    }
};

// Expose lightbox array for global access if needed
window.currentActivityImages = [];
// --- SOCIAL INTERACTIONS ---

let currentActivityId = null;
let unsubscribeLikes = null;
let unsubscribeComments = null;

function initSocialFeatures(activityId) {
    currentActivityId = activityId;

    // Reset UI
    document.getElementById('btnLike').classList.remove('liked');
    document.getElementById('likeCount').textContent = '0';
    document.getElementById('commentsList').innerHTML = '<p class="text-center">Cargando comentarios...</p>';

    // Unsubscribe previous listeners
    if (unsubscribeLikes) unsubscribeLikes();
    if (unsubscribeComments) unsubscribeComments();

    if (!activityId) return;

    const user = auth.currentUser;

    // 1. Listen to Likes (Real-time)
    // We will use a subcollection 'social_stats' or just a separate 'likes' collection?
    // Plan said: Collection 'likes' with docId = {activityId}_{userId} OR just counting in activity doc.
    // Better: Helper collection 'likes' for status and counter on activity doc? 
    // Simplest: 'activities/{id}/likes' subcollection usually costs reads. The prompt didn't specify architecture.
    // Let's go with: 
    // - Collection `activity_likes` (docId: activityId_userId) to track who liked what.
    // - Field `likeCount` in activity document for aggregation.

    // Check if current user liked it
    if (user) {
        const likeDocId = `${activityId}_${user.uid}`;
        // Verify if I liked it. Since we want real-time update of the COUNT, we listen to the activity doc.
        // But for "My Like Status", a single get or snapshot on the like doc is enough.

        // Listen to Activity Doc for Like Count
        unsubscribeLikes = onSnapshot(doc(db, "activities", activityId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('likeCount').textContent = data.likeCount || 0;
            }
        });

        // Check if *I* liked it
        const likeRef = doc(db, "activity_likes", likeDocId);
        getDoc(likeRef).then(snap => {
            if (snap.exists()) {
                document.getElementById('btnLike').classList.add('liked');
                document.getElementById('btnLike').querySelector('i').className = 'fas fa-heart';
            } else {
                document.getElementById('btnLike').classList.remove('liked');
                document.getElementById('btnLike').querySelector('i').className = 'far fa-heart';
            }
        });

    } else {
        // Just listen to count
        unsubscribeLikes = onSnapshot(doc(db, "activities", activityId), (docSnap) => {
            if (docSnap.exists()) {
                document.getElementById('likeCount').textContent = docSnap.data().likeCount || 0;
            }
        });
    }

    // 2. Listen to Comments (Real-time)
    const qComments = query(collection(db, `activities/${activityId}/comments`), orderBy('createdAt', 'desc'));
    unsubscribeComments = onSnapshot(qComments, (snapshot) => {
        const container = document.getElementById('commentsList');
        if (snapshot.empty) {
            container.innerHTML = '<p class="no-comments">Sé el primero en comentar.</p>';
            return;
        }

        container.innerHTML = snapshot.docs.map(doc => {
            const c = doc.data();
            const isMyComment = user && c.userId === user.uid;
            const isAdmin = window.currentUserRole === 'admin';
            const date = c.createdAt ? c.createdAt.toDate().toLocaleDateString() : '';

            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${c.userName}</span>
                        <span class="comment-date">${date}</span>
                    </div>
                    <div class="comment-text">
                        ${c.text}
                        ${(isMyComment || isAdmin) ?
                    `<button class="comment-delete" onclick="deleteComment('${activityId}', '${doc.id}')"><i class="fas fa-trash"></i></button>`
                    : ''}
                    </div>
                </div>
            `;
        }).join('');
    });
}

window.toggleLike = async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para dar like.");
        return;
    }
    if (!currentActivityId) return;

    const likeDocId = `${currentActivityId}_${user.uid}`;
    const activityRef = doc(db, "activities", currentActivityId);
    const likeRef = doc(db, "activity_likes", likeDocId);

    try {
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            const activityDoc = await transaction.get(activityRef);

            if (!activityDoc.exists()) throw "Activity does not exist!";

            let newCount = (activityDoc.data().likeCount || 0);

            if (likeDoc.exists()) {
                // Unlike
                transaction.delete(likeRef);
                newCount = Math.max(0, newCount - 1);
                transaction.update(activityRef, { likeCount: newCount });

                // Optimistic UI update (outside transaction ideally, but ok here)
                document.getElementById('btnLike').classList.remove('liked');
                document.getElementById('btnLike').querySelector('i').className = 'far fa-heart';
            } else {
                // Like
                transaction.set(likeRef, {
                    userId: user.uid,
                    activityId: currentActivityId,
                    createdAt: serverTimestamp()
                });
                newCount += 1;
                transaction.update(activityRef, { likeCount: newCount });

                document.getElementById('btnLike').classList.add('liked');
                document.getElementById('btnLike').querySelector('i').className = 'fas fa-heart';
            }
        });
    } catch (e) {
        console.error("Like transaction failed: ", e);
    }
};

window.handleCommentSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para comentar.");
        return;
    }

    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text) return;

    try {
        await addDoc(collection(db, `activities/${currentActivityId}/comments`), {
            text: text,
            userId: user.uid,
            userName: user.displayName || user.email.split('@')[0],
            createdAt: serverTimestamp()
        });
        input.value = ''; // Clear input
    } catch (error) {
        console.error("Error posting comment: ", error);
        alert("Error al publicar comentario.");
    }
};

window.deleteComment = async (activityId, commentId) => {
    if (!confirm("¿Borrar comentario?")) return;
    try {
        await deleteDoc(doc(db, `activities/${activityId}/comments`, commentId));
    } catch (e) {
        console.error("Error deleting comment:", e);
    }
};


// --- INITIALIZATION ---
window.currentYearFilter = 'all';

window.filterActivitiesByYear = (year) => {
    window.currentYearFilter = year;

    // Update UI
    document.querySelectorAll('.year-pill').forEach(btn => {
        if (btn.dataset.year === year) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (!window.currentGalleryActivities) return;

    const filtered = year === 'all'
        ? window.currentGalleryActivities
        : window.currentGalleryActivities.filter(act => (act.year || '').toString() === year);

    // Determine valid grid ID
    const targetId = document.getElementById('activitiesGrid') ? 'activitiesGrid' : 'galleryGridFull';
    renderActivityCards(filtered, targetId);
};

// --- CRONOGRAMA LOGIC ---

// Calendar Component Logic
let currentCalendarDate = new Date();

export function renderCalendar() {
    const container = document.getElementById('calendar-container');
    if (!container) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // First and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Day of week of first day (0-6, Adjust to start on Monday if needed, but standard is Sunday 0)
    let startingDay = firstDay.getDay();

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Prepare events for this month
    const monthEvents = (window.currentCronogramaItems || []).filter(item => {
        let d = null;
        if (item.date && item.date.toDate) d = item.date.toDate();
        else if (item.date) d = new Date(item.date);
        return d && d.getFullYear() === year && d.getMonth() === month;
    });

    let html = `
        <div class="calendar-header">
            <h3>${monthNames[month]} ${year}</h3>
            <div class="calendar-nav">
                <button class="cal-btn" onclick="window.changeCalendarMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                <button class="cal-btn" onclick="window.changeCalendarMonth(1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
        <div class="calendar-grid">
            <div class="cal-weekday">Dom</div>
            <div class="cal-weekday">Lun</div>
            <div class="cal-weekday">Mar</div>
            <div class="cal-weekday">Mié</div>
            <div class="cal-weekday">Jue</div>
            <div class="cal-weekday">Vie</div>
            <div class="cal-weekday">Sáb</div>
    `;

    // Fill empty days
    for (let i = 0; i < startingDay; i++) {
        html += `<div class="cal-day empty"></div>`;
    }

    // Fill actual days
    const today = new Date();
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateObj = new Date(year, month, day);
        const isToday = dateObj.toDateString() === today.toDateString() ? 'today' : '';

        // Check for events on this day
        const dayEvents = (window.currentCronogramaItems || []).filter(item => {
            let d = null;
            if (item.date && item.date.toDate) d = item.date.toDate();
            else if (item.date) d = new Date(item.date);
            // Compare components to avoid timezone shifts
            return d && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
        });

        const hasEvent = dayEvents.length > 0 ? 'has-event' : '';
        const eventStatus = hasEvent ? (dateObj < today ? 'done' : 'upcoming') : '';

        html += `
            <div class="cal-day ${isToday} ${hasEvent} ${eventStatus}" onclick="window.scrollToEventOnDay(${day})">
                ${day}
                ${hasEvent ? '<div class="event-dot"></div>' : ''}
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

// Global window functions for calendar interaction
window.changeCalendarMonth = (offset) => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + offset);
    renderCalendar();
};

window.scrollToEventOnDay = (day) => {
    // Optional: filter the timeline or scroll to specific item
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    console.log(`Searching for events on ${day}/${month + 1}/${year}`);
    // Here we could implement a smooth scroll to the event in the timeline
};

export async function loadCronograma() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando cronograma...</div>';

    try {
        const q = query(collection(db, "activities"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        window.currentCronogramaItems = events;

        // Render both components
        renderCalendar();

        // Default filter for the timeline view (using current year)
        const currentYear = new Date().getFullYear().toString();
        filterCronogramaByYear(currentYear);

    } catch (e) {
        console.error("Error loading timeline:", e);
        container.innerHTML = '<p class="error">Error cargando el cronograma.</p>';
    }
}

export function filterCronogramaByYear(year) {
    // Update UI
    document.querySelectorAll('#cronogramaYearTrack .year-pill').forEach(btn => {
        if (btn.dataset.year === year) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (!window.currentCronogramaItems) return;

    const filtered = window.currentCronogramaItems.filter(event => {
        if (year === 'all') return true;

        // Check event.year string
        if (event.year && event.year.toString() === year) return true;

        // Check date logic if year string is missing
        if (event.date && event.date.toDate) {
            return event.date.toDate().getFullYear().toString() === year;
        }
        return false;
    });

    renderCronogramaItems(filtered);
}

function renderCronogramaItems(events) {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 2rem; color: #aaa;">No hay actividades para este año.</p>';
        return;
    }

    const now = new Date();

    const eventsHtml = events.map((event) => {
        let eventDate = null;
        if (event.date && event.date.toDate) {
            eventDate = event.date.toDate();
        } else if (event.date) {
            // Ensure we parse without timezone shift if it's a string from input
            eventDate = typeof event.date === 'string' ? new Date(event.date + "T00:00:00") : new Date(event.date);
        } else {
            eventDate = event.createdAt?.toDate() || new Date();
        }

        const isPast = eventDate < now;
        const statusClass = isPast ? 'status-done' : 'status-upcoming';
        const dateStr = eventDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

        // Check if user is admin
        const admins = ['greenforceiebb@gmail.com', 'lfalzatel@gmail.com'];
        const isAdmin = auth.currentUser && admins.includes(auth.currentUser.email);

        const editBtnHtml = isAdmin ? `
            <button class="edit-activity-btn" onclick="event.stopPropagation(); window.openEditActivityModal('${event.id}')">
                <i class="fas fa-edit"></i>
            </button>
        ` : '';

        return `
            <div class="activity-card cronograma-card ${statusClass}" onclick="window.openGalleryModalFromId('${event.id}')">
                ${editBtnHtml}
                <div class="activity-card-image">
                    <img src="${event.thumbnail || 'assets/images/1. logo 1.jpg'}" alt="${event.title}">
                    <div class="image-count"><i class="fas fa-calendar-day"></i></div>
                </div>
                <div class="activity-card-content">
                    <div class="card-status-pill ${statusClass}">
                        <i class="${isPast ? 'fas fa-check-circle' : 'fas fa-clock'}"></i>
                        ${isPast ? 'Realizada' : 'Próxima'}
                    </div>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="activity-card-footer">
                        <span class="activity-year"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="cronograma-grid">${eventsHtml}</div>`;
}

// --- EDIT MODAL LOGIC ---

window.openEditActivityModal = (id) => {
    const event = (window.currentCronogramaItems || []).find(e => e.id === id);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    if (!modal) return;

    // Set Modal Title
    const modalTitle = modal.querySelector('.modal-header-premium h3');
    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Evento';

    // Fill form
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;

    let dateStr = '';
    let timeStr = '';

    if (event.date) {
        let d = event.date.toDate ? event.date.toDate() : new Date(event.date);
        // Date in YYYY-MM-DD
        dateStr = d.toISOString().split('T')[0];
        // Time in HH:MM
        timeStr = d.toTimeString().split(' ')[0].substring(0, 5);
    }

    document.getElementById('eventDate').value = dateStr;
    document.getElementById('eventTime').value = timeStr;
    document.getElementById('eventNotes').value = event.description || '';

    // Clear photos
    document.getElementById('eventPhotos').value = '';
    const photoCount = document.getElementById('photoCount');
    if (photoCount) photoCount.innerText = '';

    modal.classList.add('active');
};

// Helper to open gallery modal by ID
window.openGalleryModalFromId = async (id) => {
    // Try to find in currentGalleryActivities
    if (!window.currentGalleryActivities) window.currentGalleryActivities = [];

    let index = window.currentGalleryActivities.findIndex(a => a.id === id);

    if (index === -1) {
        // If not found, try finding in cronograma items and adding it
        const item = window.currentCronogramaItems ? window.currentCronogramaItems.find(a => a.id === id) : null;
        if (item) {
            window.currentGalleryActivities.push(item);
            index = window.currentGalleryActivities.length - 1;
        }
    }

    if (index !== -1) {
        window.openGalleryModal(index);
    }
};

// --- VIDEO FILTERING ---

export function filterVideosByYear(year) {
    // Update UI
    document.querySelectorAll('#videoYearTrack .year-pill').forEach(btn => {
        if (btn.dataset.year === year) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    if (!window.currentGalleryVideos) return;

    const filtered = window.currentGalleryVideos.filter(video => {
        if (year === 'all') return true;
        // Default check on year property. If string/number mismatch, coerce to string.
        return (video.year || '').toString() === year;
    });

    renderVideoCards(filtered);
}


// --- INITIALIZATION ---

async function initGallery() {
    console.log("Initializing Gallery & Timeline...");

    // 1. Load Data
    if (document.getElementById('activitiesGrid')) {
        await loadActivities('activitiesGrid');
    }

    // Load Timeline (if container exists)
    if (document.getElementById('timeline-container')) {
        loadCronograma();
    }

    // Load Videos
    if (document.getElementById('videosGrid')) {
        loadVideos();
    }

    // Initial Video Filter (default 'all' or '2025'?)
    // The HTML has 'all' as active.
    filterVideosByYear('all');

    setTimeout(updateAdminUI, 1000);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initGallery);

// Exports
export { initGallery };


// --- YEAR SELECTOR LOGIC (Sliding Animation) ---
export function initYearSelector() {
    const tracks = document.querySelectorAll('.year-scroll');

    tracks.forEach(track => {
        const buttons = track.querySelectorAll('.year-pill');
        const activeBtn = track.querySelector('.year-pill.active');

        // Function to update the sliding pill position
        const updatePill = (btn) => {
            if (!btn) return;
            const trackRect = track.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            // Calculate relative position accurately including padding/scroll
            const left = btn.offsetLeft;
            const width = btn.offsetWidth;

            track.style.setProperty('--pill-w', `${width}px`);
            track.style.setProperty('--pill-x', `${left}px`);
        };

        // Initialize position
        if (activeBtn) {
            // Wait for styles/layout to settle
            setTimeout(() => updatePill(activeBtn), 100);
        }

        // Add listeners
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update UI state
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Animate Pill
                updatePill(btn);

                // For Gallery specifically, we trigger the filter manually here
                // other sections might use inline onclick, which is fine, 
                // but we need to ensure this visual update happens.
                if (track.id === 'yearTrack') {
                    const year = btn.getAttribute('data-year');
                    window.filterActivitiesByYear(year);
                }
            });
        });
    });
}

// Global Exposures
window.filterCronogramaByYear = filterCronogramaByYear;
window.filterVideosByYear = filterVideosByYear;
window.loadCronograma = loadCronograma;
window.filterActivitiesByYear = filterActivitiesByYear;
window.loadActivities = loadActivities;
window.initYearSelector = initYearSelector;
