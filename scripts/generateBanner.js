const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Generate 800x240 cyberpunk banner PNG
const width = 800;
const height = 240;
const rawData = Buffer.alloc(height * (1 + width * 4));

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = y * (1 + width * 4) + 1 + x * 4;
  rawData[idx] = r;
  rawData[idx + 1] = g;
  rawData[idx + 2] = b;
  rawData[idx + 3] = a;
}

for (let y = 0; y < height; y++) {
  rawData[y * (1 + width * 4)] = 0;
  for (let x = 0; x < width; x++) {
    // Dark cyber gradient
    const t = y / height;
    let r = Math.floor(4 + (8 - 4) * t);
    let g = Math.floor(7 + (16 - 7) * t);
    let b = Math.floor(17 + (38 - 17) * t);

    // Subtle grid
    if (x % 40 === 0 || y % 40 === 0) {
      r += 8;
      g += 15;
      b += 30;
    }

    // Top border cyan neon glow
    if (y < 3) {
      r = 0; g = 240; b = 255;
    }
    // Bottom border magenta neon glow
    if (y >= height - 3) {
      r = 255; g = 0; b = 85;
    }

    setPixel(x, y, r, g, b, 255);
  }
}

// Draw futuristic radar circles on left
const cx = 120;
const cy = 120;
for (let theta = 0; theta < Math.PI * 2; theta += 0.005) {
  for (const radius of [30, 55, 80]) {
    const px = Math.floor(cx + Math.cos(theta) * radius);
    const py = Math.floor(cy + Math.sin(theta) * radius);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      setPixel(px, py, 0, 240, 255, 200);
    }
  }
}

// Draw radar crosshairs
for (let i = -90; i <= 90; i++) {
  setPixel(cx + i, cy, 0, 240, 255, 120);
  setPixel(cx, cy + i, 0, 240, 255, 120);
}

// Compress into PNG
function makePng(buffer, w, h) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = createChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(buffer);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  let crc = 0xffffffff;
  for (let i = 4; i < 8 + len; i++) {
    crc = crcTable[(crc ^ chunk[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = crc ^ 0xffffffff;

  chunk.writeInt32BE(crc, 8 + len);
  return chunk;
}

const pngBuffer = makePng(rawData, width, height);
fs.writeFileSync(path.join(__dirname, '../assets/banner.png'), pngBuffer);
console.log('Generated assets/banner.png successfully! Size:', pngBuffer.length, 'bytes');
