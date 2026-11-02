const fs = require('fs');

const channels = JSON.parse(fs.readFileSync('public/data/catalogo.json', 'utf8'));

// Band: put vipwaytvcdn first
const band = channels.find(c => c.name.toLowerCase() === 'band');
if (band) {
  const working = 'https://vipwaytvcdn.multtv.tv.br:5444/TVThathi_Band/720p/index.m3u8';
  band.sources = [working, ...band.sources.filter(s => s !== working)];
  console.log('Updated Band sources, Server 1 is now vipwaytvcdn');
}

// SBT: put maissbt first
const sbt = channels.find(c => c.name.toLowerCase() === 'sbt');
if (sbt) {
  const working = 'https://aovivo.maissbt.com/indexMobile.m3u8';
  sbt.sources = [working, ...sbt.sources.filter(s => s !== working)];
  console.log('Updated SBT sources, Server 1 is now maissbt');
}

// Globo SP: put aws.s13 working first
const globosp = channels.find(c => c.name.toLowerCase() === 'globo sp');
if (globosp) {
  const working = 'https://aws.s13-s1001604.lat/stream/25c389d4965f4166247f2280886f5cba/globosp.m3u8';
  globosp.sources = [working, ...globosp.sources.filter(s => s !== working)];
  console.log('Updated Globo SP sources');
}

// CNN Brasil: put aws.s13 working first
const cnn = channels.find(c => c.name.toLowerCase() === 'cnn brasil');
if (cnn) {
  const working = 'https://aws.s13-s1001604.lat/stream/4b31648104a3eabb9f1982ff6513147d/cnnbrasil.m3u8';
  cnn.sources = [working, ...cnn.sources.filter(s => s !== working)];
  console.log('Updated CNN Brasil sources');
}

// Cartoon Network: put aws.s13 working first
const cn = channels.find(c => c.name.toLowerCase() === 'cartoon network');
if (cn) {
  const working = 'https://aws.s13-s1001604.lat/stream/f20eee8ca370156a3e6ee41459384861/cartoonnetwork.m3u8';
  cn.sources = [working, ...cn.sources.filter(s => s !== working)];
  console.log('Updated Cartoon Network sources');
}

// ESPN: put aws.s13 working first
const espn = channels.find(c => c.name.toLowerCase() === 'espn');
if (espn) {
  const working = 'https://aws.s13-s1001604.lat/stream/48cae3919e89e385e3789102c01f9a97/espn.m3u8';
  espn.sources = [working, ...espn.sources.filter(s => s !== working)];
  console.log('Updated ESPN sources');
}

fs.writeFileSync('public/data/catalogo.json', JSON.stringify(channels, null, 2), 'utf8');
console.log('Saved optimized catalogo.json');
