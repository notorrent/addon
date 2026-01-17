const express = require('express');
const cors = require('cors');

const app = express();

// Habilitar CORS para que Stremio pueda acceder
app.use(cors());

// URL base de tus archivos en Hostinger
const HOSTINGER_BASE = 'https://aqua-vulture-337623.hostingersite.com/addon';

// 1. MANIFEST (Configuración del Addon)
app.get('/manifest.json', (req, res) => {
    res.json({
        "id": "com.notorrent.addon",
        "version": "2.0.0",
        "name": "NoTorrent Addon",
        "description": "Películas y Series desde Hostinger",
        "resources": ["catalog", "meta", "stream"],
        "types": ["series", "movie"],
        "idPrefixes": ["tmdb_", "tt"],
        "catalogs": [
            { "type": "series", "id": "netflix", "name": "Netflix" },
            { "type": "series", "id": "disney", "name": "Disney+" },
            { "type": "series", "id": "primevideo", "name": "Prime Video" },
            { "type": "series", "id": "apple", "name": "Apple TV+" },
            { "type": "series", "id": "max", "name": "Max" },
            { "type": "series", "id": "paramount", "name": "Paramount+" },
            { "type": "series", "id": "crunchyroll", "name": "Crunchyroll" },
            { "type": "movie", "id": "movie_action", "name": "Acción" },
            { "type": "movie", "id": "movie_horror", "name": "Terror" },
            { "type": "movie", "id": "movie_scifi", "name": "Ciencia Ficción" }
        ],
        "background": `${HOSTINGER_BASE}/background.jpg`,
        "logo": "https://styles.redditmedia.com/t5_fvvpco/styles/profileIcon_c8ye4t9j6x2g1.png"
    });
});

// 2. CATALOG (Lista de películas/series)
app.get('/catalog/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    const targetUrl = `${HOSTINGER_BASE}/catalog/${type}/${id}.json`;
    
    console.log(`Solicitando Catálogo: ${targetUrl}`);
    
    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error('No encontrado en Hostinger');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error en catálogo: ${error.message}`);
        res.json({ metas: [] });
    }
});

// 3. META (Detalles de una película o serie específica)
app.get('/meta/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    // Quitamos .json si Stremio lo envía en el ID
    const cleanId = id.replace('.json', '');
    const targetUrl = `${HOSTINGER_BASE}/meta/${type}/${cleanId}.json`;
    
    console.log(`Solicitando Meta: ${targetUrl}`);
    
    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error('Meta no encontrado');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error en meta: ${error.message}`);
        res.status(404).json({ error: "No encontrado" });
    }
});

// 4. STREAM (Enlaces de video)
app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    let fileName = id.replace('.json', '');
    
    // Si es serie (ej: tt123:1:1), convertir a tt123-s01e01
    if (type === 'series' && fileName.includes(':')) {
        const parts = fileName.split(':');
        const imdbId = parts[0];
        const season = parts[1].padStart(2, '0');
        const episode = parts[2].padStart(2, '0');
        fileName = `${imdbId}-s${season}e${episode}`;
    }

    const targetUrl = `${HOSTINGER_BASE}/stream/${type}/${fileName}.json`;
    console.log(`Solicitando Stream: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error('Archivo de stream no encontrado');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Error en stream: ${error.message}`);
        res.json({ streams: [] });
    }
});

// Página de inicio básica
app.get('/', (req, res) => {
    res.send('<h1>Addon NoTorrent está funcionando</h1><p>Usa la URL /manifest.json en Stremio</p>');
});

// Configuración del puerto para Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});