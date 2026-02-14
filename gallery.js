import { db, storage } from './firebase-config.js';
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
    setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

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
    { title: 'Green Force: Nace un Movimiento Ambiental', description: 'Presentación inicial de nuestro proyecto Green Force, mostrando cómo nació esta iniciativa ambiental en la IE Barro Blanco.', videoId: '9StDvt-2Nbs', thumbnail: 'https://img.youtube.com/vi/9StDvt-2Nbs/hqdefault.jpg' },
    { title: 'Reforestación - 1000 Árboles para el Premio Zayed 2025', description: 'Jornada de reforestación donde plantamos más de 1000 árboles nativos como parte de nuestra postulación al Premio Zayed de Sostenibilidad.', videoId: 'QUC-DD5WTRI', thumbnail: 'https://img.youtube.com/vi/QUC-DD5WTRI/hqdefault.jpg' },
    { title: 'Planting a Sustainable Future', description: 'Documental completo sobre nuestro proyecto Green Force y nuestra postulación al Premio Zayed 2025, mostrando todas nuestras actividades ambientales.', videoId: 'H_0aTsx8C-w', thumbnail: 'https://img.youtube.com/vi/H_0aTsx8C-w/hqdefault.jpg' }
];

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
let currentGalleryActivities = [];
let currentGalleryVideos = [];

// --- LOAD FUNCTIONS ---
export async function loadActivities() {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando actividades...</div>';

    try {
        const q = query(collection(db, "activities"), orderBy("createdAt", "desc")); // Temporarily sort by creation
        const querySnapshot = await getDocs(q);

        currentGalleryActivities = [];
        querySnapshot.forEach((doc) => {
            currentGalleryActivities.push({ id: doc.id, ...doc.data() });
        });

        // If empty, suggest seeding (for admin/dev)
        if (currentGalleryActivities.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <p>No hay actividades cargadas.</p>
                    <button onclick="seedDatabase()" style="background: var(--primary); color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                        Cargar Datos Iniciales (Seed)
                    </button>
                </div>`;
            return;
        }

        renderActivityCards(currentGalleryActivities);

    } catch (e) {
        console.error("Error loading activities:", e);
        grid.innerHTML = '<p class="error">Error cargando actividades. Intenta recargar.</p>';
        console.log("Fallback to local data if needed...");
    }
}

export async function loadVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando videos...</div>';

    try {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        currentGalleryVideos = [];
        querySnapshot.forEach((doc) => {
            currentGalleryVideos.push({ id: doc.id, ...doc.data() });
        });

        if (currentGalleryVideos.length === 0) {
            grid.innerHTML = '<p>No hay videos cargados.</p>';
            return;
        }

        renderVideoCards(currentGalleryVideos);

    } catch (e) {
        console.error("Error loading videos:", e);
        grid.innerHTML = '<p class="error">Error cargando videos.</p>';
    }
}

// --- RENDER HELPERS ---
function renderActivityCards(activities) {
    const grid = document.getElementById('activitiesGrid');
    const isAdmin = window.currentUserRole === 'admin';

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
              <span class="activity-year"><i class="fas fa-calendar-alt"></i> ${a.year}</span>
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
};

// --- UPLOAD MODAL LOGIC ---
window.openUploadModal = (type) => {
    const modal = document.getElementById('uploadModal');
    const title = document.getElementById('uploadModalTitle');
    const typeInput = document.getElementById('uploadType');
    const activityFields = document.getElementById('activityFields');
    const videoFields = document.getElementById('videoFields');

    if (!modal) return;

    typeInput.value = type;
    if (type === 'activity') {
        title.innerHTML = '<i class="fas fa-camera"></i> Nueva Actividad';
        activityFields.style.display = 'block';
        videoFields.style.display = 'none';
    } else {
        title.innerHTML = '<i class="fas fa-video"></i> Nuevo Video';
        activityFields.style.display = 'none';
        videoFields.style.display = 'block';
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

        if (type === 'activity') {
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
    const activity = currentGalleryActivities[index];
    if (!activity) return;

    const modal = document.getElementById('galleryModal');
    const title = document.getElementById('galleryTitle');
    const grid = document.getElementById('galleryImagesGrid');

    // Set global for lightbox
    window.currentActivityImages = activity.images || [];

    if (title) title.textContent = activity.title;
    if (grid) {
        grid.innerHTML = activity.images.map((img, i) => `
            <div class="gallery-item" onclick="openLightbox(${i})">
                <img src="${img}" loading="lazy" alt="Foto ${i + 1}">
            </div>
        `).join('');
    }

    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

window.closeGalleryModal = () => {
    const modal = document.getElementById('galleryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

window.openVideoModal = (index) => {
    const video = currentGalleryVideos[index];
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

// Override closeGalleryModal to unsubscribe
const originalClose = window.closeGalleryModal;
window.closeGalleryModal = () => {
    if (unsubscribeLikes) unsubscribeLikes();
    if (unsubscribeComments) unsubscribeComments();

    // Call original or recreate logic
    // Since originalClose is defined in global scope or simple function, 
    // let's just replicate the simple logic:
    const modal = document.getElementById('galleryModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    // Or call the original if accessible:
    // originalClose(); // Risk of recursion/undefined if not captured well?
    // Actually the function is defined in this file's scope in previous version?
    // It was likely 'window.closeGalleryModal = ...' so we are overwriting it. 
    // The previous implementation was:
    // window.closeGalleryModal = function() { ... }
    // So we just redefine it.
};
