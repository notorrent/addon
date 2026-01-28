const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const HOSTINGER_BASE = 'https://aqua-vulture-337623.hostingersite.com/addon';

// 1. MANIFEST
app.get('/manifest.json', (req, res) => {
    res.json({
        "id": "com.notorrent.addon",
        "version": "2.0.0",
        "name": "NoTorrent",
        "description": "All TV shows from Netflix, Disney+, Prime Video, Apple TV+, Paramount+, HBO Max, Crunchyroll, and over 24K movies in English & Spanish.",
        "resources": ["catalog", "stream"], // SIN "meta"
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
            { "type": "movie", "id": "action", "name": "Action 2026" },
            { "type": "movie", "id": "animation", "name": "Animation" },
            { "type": "movie", "id": "comedy", "name": "Comedy" }
        ],
        "background": `${HOSTINGER_BASE}/background.jpg`,
        "logo": "https://styles.redditmedia.com/t5_fvvpco/styles/profileIcon_c8ye4t9j6x2g1.png"
    });
});

// 2. CATALOG - REDIRECCIÓN DIRECTA (sin consumo de ancho de banda)
app.get('/catalog/:type/:id.json', (req, res) => {
    const { type, id } = req.params;
    const targetUrl = `${HOSTINGER_BASE}/catalog/${type}/${id}.json`;
    console.log(`Redirigiendo Catálogo: ${targetUrl}`);
    res.redirect(302, targetUrl);
});

// 3. STREAM - REDIRECCIÓN DIRECTA (sin consumo de ancho de banda)
app.get('/stream/:type/:id.json', (req, res) => {
    const { type, id } = req.params;
    let fileName = id.replace('.json', '');
    
    if (type === 'series' && fileName.includes(':')) {
        const parts = fileName.split(':');
        const imdbId = parts[0];
        const season = parts[1].padStart(2, '0');
        const episode = parts[2].padStart(2, '0');
        fileName = `${imdbId}-s${season}e${episode}`;
    }

    const targetUrl = `${HOSTINGER_BASE}/stream/${type}/${fileName}.json`;
    console.log(`Redirigiendo Stream: ${targetUrl}`);
    res.redirect(302, targetUrl);
});

// NO HAY RUTA PARA /meta/:type/:id.json - Stremio usará Cinemeta automáticamente

app.get('/', (req, res) => {
    res.send('<h1>Addon NoTorrent está funcionando</h1><p>Redirección activa - mínimo consumo</p>');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT} (modo redirección)`);
});