'use strict';
// Writes build metadata consumed by the web footer and /healthz endpoints.
const { execSync } = require('child_process');
const fs = require('fs');

function safe(cmd, fallback) {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return fallback; }
}

const info = {
  version: require('../package.json').version,
  commit: safe('git rev-parse --short HEAD', 'unknown'),
  builtAt: new Date().toISOString(),
};
fs.writeFileSync('apps/web/public/build-info.json', JSON.stringify(info, null, 2));
console.warn('Build info', info);
