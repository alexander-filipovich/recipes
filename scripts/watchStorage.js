#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const STORAGE = path.join(__dirname, '..', 'public', 'storage');

function runGenerator() {
  const p = spawn(process.execPath, [path.join(__dirname, 'generateStorageIndex.js')], { stdio: 'inherit' });
  p.on('exit', (code) => { if (code !== 0) console.warn('generateStorageIndex exited', code); });
}

let timer = null;
function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { runGenerator(); timer = null; }, 200);
}

if (!fs.existsSync(STORAGE)) {
  console.error('No public/storage directory — create it and add files first.');
  process.exit(1);
}

console.log('Watching', STORAGE, 'for changes...');
runGenerator();

try {
  fs.watch(STORAGE, { recursive: true }, (ev, filename) => {
    if (!filename) return;
    // ignore index.json changes coming from the generator to avoid loops
    if (filename.endsWith('index.json')) return;
    console.log('Change detected:', ev, filename);
    schedule();
  });
} catch (e) {
  console.error('fs.watch error', e.message);
  process.exit(1);
}
