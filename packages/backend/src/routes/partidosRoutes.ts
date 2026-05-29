import { Router } from 'express';
import { obtenerResultadosRecientes, 
    obtenerFixtureTorneo, 
    obtenerResultados, 
    obtenerProximosPartidos, 
    listarTorneos, 
    obtenerTablaPosiciones, 
    obtenerPartidosTorneo, 
    obtenerGoleadores, 
    obtenerTarjetas } from '../controllers/partidoController';

const router = Router();
// Los ultimos 10 partidos
router.get('/recientes', obtenerResultadosRecientes);
router.get('/fixture/:idTorneo', obtenerFixtureTorneo);
router.get('/torneos', listarTorneos);
// Todos los resultados de los partidos
router.get('/resultados', obtenerResultados);
router.get('/proximos', obtenerProximosPartidos);

// Tabla de posiciones
router.get('/posiciones/:idTorneo', obtenerTablaPosiciones);

router.get('/torneo/:idTorneo', obtenerPartidosTorneo);

router.get('/goleadores/:idTorneo', obtenerGoleadores);
router.get('/tarjetas/:idTorneo', obtenerTarjetas);

export default router;