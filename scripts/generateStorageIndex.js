#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Scans public/storage and generates public/storage/index.json
// Structure produced:
// { types: { <type>: { items: [ { name, objects: [{name, contentType}] } ] } }, _raw: { '<type>/<item>/file.json': <parsed json> } }

const PUBLIC = path.join(__dirname, '..', 'public');
const STORAGE = path.join(PUBLIC, 'storage');

async function exists(p) {
  try { await fs.promises.access(p); return true; } catch { return false; }
}

function isJsonFile(name) {
  return name.toLowerCase().endsWith('.json');
}

async function scan() {
  if (!await exists(STORAGE)) {
    console.error('No public/storage directory found. Create it and add folders/files first.');
    process.exit(1);
  }

  const types = {};
  const raw = {};

  const typeNames = await fs.promises.readdir(STORAGE, { withFileTypes: true });
  for (const tdirent of typeNames) {
    if (!tdirent.isDirectory()) continue;
    const typeName = tdirent.name;
    const typePath = path.join(STORAGE, typeName);
    const items = [];
    const itemNames = await fs.promises.readdir(typePath, { withFileTypes: true });
    for (const idirent of itemNames) {
      if (!idirent.isDirectory()) continue;
      const itemName = idirent.name;
      const itemPath = path.join(typePath, itemName);
      const files = await fs.promises.readdir(itemPath, { withFileTypes: true });
      const objects = [];
      for (const fdirent of files) {
        if (!fdirent.isFile()) continue;
        const fname = fdirent.name;
        objects.push({ name: fname, contentType: mimeTypeFor(fname) });
        if (isJsonFile(fname)) {
          try {
            const full = path.join(itemPath, fname);
            const txt = await fs.promises.readFile(full, 'utf8');
            raw[`${typeName}/${itemName}/${fname}`] = JSON.parse(txt);
          } catch (e) {
            console.warn('Failed to parse JSON', typeName, itemName, fname, e.message);
          }
        }
      }
      items.push({ name: itemName, objects });
    }
    types[typeName] = { items };
  }

  const out = { types, _raw: raw };
  const dest = path.join(STORAGE, 'index.json');
  await fs.promises.writeFile(dest, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', dest);
}

function mimeTypeFor(name) {
  const ext = path.extname(name).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

scan().catch((err) => { console.error(err); process.exit(2); });
