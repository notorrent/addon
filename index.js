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
    ]
  });
});

// 2. CATALOG
app.get('/catalog/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
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

// 4. STREAM
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  let fileName = id.replace('.json', '');
  
  if (type === 'series' && fileName.includes(':')) {
    const parts = fileName.split(':');
    const idS = parts[0];
    const s = parts[1].padStart(2, '0');
    const e = parts[2].padStart(2, '0');
    fileName = `${idS}-s${s}e${e}`;
  }

  const targetUrl = `${HOSTINGER_BASE}/stream/${type}/${fileName}.json`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.json({ streams: [] });
  }
});

// IMPORTANTE PARA VERCEL:
module.exports = app;