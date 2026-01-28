const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const HOSTINGER_BASE = 'https://aqua-vulture-337623.hostingersite.com/addon';


app.get('/manifest.json', (req, res) => {
    res.json({
        "id": "com.notorrent.addon",
        "version": "2.0.0",
        "name": "NoTorrent",
        "description": "All TV shows from Netflix, Disney+, Prime Video, Apple TV+, Paramount+, HBO Max, Crunchyroll, and over 24K movies in English & Spanish.",
        "resources": ["catalog", "stream"],
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

        ],
        "background": `${HOSTINGER_BASE}/background.jpg`,
        "logo": "https://styles.redditmedia.com/t5_fvvpco/styles/profileIcon_c8ye4t9j6x2g1.png"
    });
});


app.get('/catalog/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    
    // Construir URL pero NO descargar si no es necesario
    const targetUrl = `${HOSTINGER_BASE}/catalog/${type}/${id}.json`;
    console.log(`Proxy para Catálogo: ${targetUrl}`);
    
    try {
        // Solo hacemos fetch si realmente vamos a usarlo
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Stremio-Addon/1.0'
            }
        });
        
        if (!response.ok) {
            // Si falla, devolver array vacío inmediatamente
            return res.json({ metas: [] });
        }
        
        // Pasar los headers de CORS importantes
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        
        // Pipe directo: Hostinger → Render → Stremio
        response.body.pipe(res);
        
    } catch (error) {
        console.error(`Error en catálogo: ${error.message}`);
        res.json({ metas: [] });
    }
});


app.get('/stream/:type/:id.json', async (req, res) => {
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
    console.log(`Proxy para Stream: ${targetUrl}`);
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Stremio-Addon/1.0'
            }
        });
        
        if (!response.ok) {
            return res.json({ streams: [] });
        }
        
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json');
        response.body.pipe(res);
        
    } catch (error) {
        console.error(`Error en stream: ${error.message}`);
        res.json({ streams: [] });
    }
});


app.get('/', (req, res) => {
    res.send('<h1>Addon NoTorrent (Proxy Optimizado)</h1><p>Minimizando consumo de ancho de banda</p>');
});

// 5. Health check para Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor proxy activo en puerto ${PORT}`);
});