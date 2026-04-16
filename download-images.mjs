import { createWriteStream, mkdirSync, statSync } from 'fs';
import { dirname } from 'path';
import { pipeline } from 'stream/promises';

const BASE = 'public/images/servicios';

const posts = [
  // UÑAS
  { url: 'https://www.instagram.com/p/DWISUdmDWFS/',  save: `${BASE}/unas/unas_01_acrilicas.jpg` },
  { url: 'https://www.instagram.com/p/DTMiV4jjCIA/',  save: `${BASE}/unas/unas_02_acrilicas3D.jpg` },
  { url: 'https://www.instagram.com/p/DTxl4H7AK8B/',  save: `${BASE}/unas/unas_03_esmaltado.jpg` },
  { url: 'https://www.instagram.com/p/DVOfIX0gDw4/',  save: `${BASE}/unas/unas_04_kapping_flores.jpg` },
  // PESTAÑAS
  { url: 'https://www.instagram.com/p/DWITz54jU5M/',  save: `${BASE}/pestanas/pestanas_01_ojo.jpg` },
  { url: 'https://www.instagram.com/p/DTxmYW0gHgo/',  save: `${BASE}/pestanas/pestanas_02_egipcias.jpg` },
  { url: 'https://www.instagram.com/p/DTMiOUkjAB6/',  save: `${BASE}/pestanas/pestanas_03_lifting.jpg` },
  { url: 'https://www.instagram.com/p/DS7_HoXD-8O/',  save: `${BASE}/pestanas/pestanas_04_kapping.jpg` },
  // CEJAS
  { url: 'https://www.instagram.com/p/DWLwdxLDlo2/',  save: `${BASE}/cejas/cejas_01_micropigmentacion.jpg` },
  { url: 'https://www.instagram.com/p/DS7-TVgj9HV/',  save: `${BASE}/cejas/cejas_02_henna.jpg` },
  { url: 'https://www.instagram.com/p/DVOe-ToAJIh/',  save: `${BASE}/cejas/cejas_03_perfilado.jpg` },
  // CABELLO
  { url: 'https://www.instagram.com/p/DWLwKCgDvo0/',  save: `${BASE}/cabello/cabello_01_retoque_visos.jpg` },
  { url: 'https://www.instagram.com/p/DWITJRjjeEq/',  save: `${BASE}/cabello/cabello_02_mechas.jpg` },
  { url: 'https://www.instagram.com/p/DTxmTsmgJZM/',  save: `${BASE}/cabello/cabello_03_alisado.jpg` },
  { url: 'https://www.instagram.com/p/DTrJ7tcjOwQ/',  save: `${BASE}/cabello/cabello_04_planchado.jpg` },
  // FACIAL
  { url: 'https://www.instagram.com/p/DLJNhScNE2-/',  save: `${BASE}/facial/facial_01_limpieza.jpg` },
  { url: 'https://www.instagram.com/p/DMbCIfZP_yO/',  save: `${BASE}/facial/facial_02_collagen.jpg` },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

async function getThumbnailUrl(postUrl) {
  const apiUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(postUrl)}&maxwidth=1080`;
  const res = await fetch(apiUrl, { headers: HEADERS });
  if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
  const json = await res.json();
  if (!json.thumbnail_url) throw new Error('No thumbnail_url in response');
  return json.thumbnail_url;
}

async function downloadImage(imgUrl, savePath) {
  mkdirSync(dirname(savePath), { recursive: true });
  const res = await fetch(imgUrl, { headers: HEADERS });
  if (!res.ok) throw new Error(`Image fetch failed: HTTP ${res.status}`);
  const writer = createWriteStream(savePath);
  await pipeline(res.body, writer);
  return statSync(savePath).size;
}

const results = [];
for (const post of posts) {
  process.stdout.write(`⬇  ${post.save.split('/').pop()} ... `);
  try {
    const thumbUrl = await getThumbnailUrl(post.url);
    const bytes = await downloadImage(thumbUrl, post.save);
    const kb = (bytes / 1024).toFixed(1);
    const ok = bytes > 50_000;
    console.log(`${ok ? '✅' : '⚠️ '} ${kb} KB`);
    results.push({ ...post, bytes, ok });
  } catch (err) {
    console.log(`❌ ${err.message}`);
    results.push({ ...post, bytes: 0, ok: false });
  }
  await new Promise(r => setTimeout(r, 600));
}

console.log('\n=== RESUMEN ===');
const ok = results.filter(r => r.ok);
const fail = results.filter(r => !r.ok);
console.log(`✅ Exitosas: ${ok.length}/${results.length}`);
if (fail.length) {
  console.log('❌ Fallidas:');
  fail.forEach(f => console.log(`   - ${f.save.split('/').slice(-2).join('/')}`));
}
