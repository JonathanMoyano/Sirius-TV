const fs = require('fs');

const channels = JSON.parse(fs.readFileSync('public/data/catalogo.json', 'utf8'));

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal
    });
    clearTimeout(id);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function testMainChannels() {
  const targets = ['Band', 'Globo RJ', 'Globo SP', 'SBT', 'Record', 'CNN Brasil', 'ESPN', 'Cartoon Network'];
  
  for (const name of targets) {
    const ch = channels.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!ch) continue;
    console.log(`\nTesting ${ch.name} (${ch.sources.length} sources):`);
    for (let i = 0; i < ch.sources.length; i++) {
      const srcUrl = typeof ch.sources[i] === 'string' ? ch.sources[i] : ch.sources[i].url;
      const ok = await checkUrl(srcUrl);
      console.log(`  Server ${i + 1}: ${ok ? 'OK (200)' : 'FAIL'} => ${srcUrl.slice(0, 70)}`);
    }
  }
}

testMainChannels();
