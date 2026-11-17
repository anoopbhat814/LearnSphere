#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE = process.env.SITE_URL || 'https://learnsphere.dev';

async function main() {
  const res = await fetch(`${API}/api/courses?pageSize=50`);
  const { items } = await res.json();
  const urls = ['/', '/courses', ...items.map((c) => `/courses/${c.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(__dirname, '..', 'apps', 'web', 'public', 'sitemap.xml'), xml);
  console.warn(`Wrote sitemap with ${urls.length} URLs`);
}

main().catch((e) => { console.error(e); process.exit(1); });
