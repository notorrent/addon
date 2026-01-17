const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const HOSTINGER_BASE = 'https://aqua-vulture-337623.hostingersite.com/addon';

// 1. MANIFEST
app.get('/manifest.json', (req, res) => {
  res.json({
    id: "com.notorrent.addon",
    version: "2.0.0",
    name: "NoTorrent",
    description: "Series y Películas desde Hostinger",
    resources: ["catalog", "meta", "stream"],
    types: ["series", "movie"],
    idPrefixes: ["tmdb_", "tt"],
    catalogs: [
      { type: "series", id: "netflix", name: "Netflix" },
      { type: "series", id: "disney", name: "Disney+" },
      { type: "movie", id: "movie_action", name: "Acción" }
      // Agrega aquí los demás de tu manifest original si quieres
    ]
  });
});

// 2. CATALOG
app.get('/catalog/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  // Mapeo simple: si el ID es 'netflix', busca en Hostinger 'series/netflix.json'
  const targetUrl = `${HOSTINGER_BASE}/catalog/${type}/${id}.json`;
  
  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.json({ metas: [] });
  }
});

// 3. META
app.get('/meta/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const targetUrl = `${HOSTINGER_BASE}/meta/${type}/${id}.json`;
  
  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: "No encontrado" });
  }
});

// 4. STREAM (La parte crítica)
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  let fileName = id.replace('.json', '');
  
  // Si es serie (ej: tt123:1:1), convertir a tt123-s01e01
  if (type === 'series' && fileName.includes(':')) {
    const parts = fileName.split(':');
    const id = parts[0];
    const s = parts[1].padStart(2, '0');
    const e = parts[2].padStart(2, '0');
    fileName = `${id}-s${s}e${e}`;
  }

  const targetUrl = `${HOSTINGER_BASE}/stream/${type}/${fileName}.json`;
  console.log("Buscando stream en:", targetUrl);

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error("No encontrado");
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.json({ streams: [] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy corriendo en puerto ${PORT}`));