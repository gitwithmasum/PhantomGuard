const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Generate a sleek 256x256 futuristic cyberpunk shield icon in PNG format
const width = 256;
const height = 256;

// Create raw RGBA buffer
const rawData = Buffer.alloc(height * (1 + width * 4));

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = y * (1 + width * 4) + 1 + x * 4;
  rawData[idx] = r;
  rawData[idx + 1] = g;
  rawData[idx + 2] = b;
  rawData[idx + 3] = a;
}

// Background: deep cyber dark with radial glow
const cx = width / 2;
const cy = height / 2;

for (let y = 0; y < height; y++) {
  rawData[y * (1 + width * 4)] = 0; // Filter byte: None
  for (let x = 0; x < width; x++) {
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    // Dark radial gradient
    const t = Math.min(dist / 140, 1);
    let r = Math.floor(6 + (4 - 6) * t);
    let g = Math.floor(10 + (6 - 10) * t);
    let b = Math.floor(25 + (12 - 25) * t);

    // Subtle grid lines
    if (x % 32 === 0 || y % 32 === 0) {
      r += 12;
      g += 20;
      b += 40;
    }

    setPixel(x, y, r, g, b, 255);
  }
}

// Draw a futuristic cyberpunk shield outline
function isInsideShield(x, y, scale = 1.0) {
  const nx = (x - cx) / (85 * scale);
  const ny = (y - (cy - 10)) / (95 * scale);

  if (ny < -0.8 || ny > 1.2) return false;
  if (Math.abs(nx) > 1.0) return false;

  // Upper flat / curved top
  if (ny < 0) {
    return Math.abs(nx) <= 1.0 - (ny + 0.8) * 0.1;
  }
  // Bottom tapered point
  const taper = 1.0 - (ny / 1.2) ** 1.6;
  return Math.abs(nx) <= taper;
}

// Draw shield layers
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const inOuter = isInsideShield(x, y, 1.05);
    const inBorder = isInsideShield(x, y, 1.0);
    const inInner = isInsideShield(x, y, 0.88);
    const inCore = isInsideShield(x, y, 0.45);

    // Outer glow
    if (inOuter && !inBorder) {
      setPixel(x, y, 0, 240, 255, 180); // Neon Cyan glow
    } else if (inBorder && !inInner) {
      // Border
      setPixel(x, y, 0, 255, 230, 255);
    } else if (inInner) {
      // Shield interior
      const dy = (y - cy) / 80;
      const baseR = Math.floor(15 + 20 * (1 - dy));
      const baseG = Math.floor(25 + 40 * (1 - dy));
      const baseB = Math.floor(60 + 80 * (1 - dy));
      setPixel(x, y, baseR, baseG, baseB, 255);

      // Cyber cross / core symbol
      if (inCore) {
        setPixel(x, y, 0, 240, 255, 255);
      }
    }
  }
}

// Draw futuristic radar reticle & central glowing pulse
for (let theta = 0; theta < Math.PI * 2; theta += 0.01) {
  for (const radius of [25, 45, 70]) {
    const px = Math.floor(cx + Math.cos(theta) * radius);
    const py = Math.floor(cy + Math.sin(theta) * radius);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      setPixel(px, py, 0, 240, 255, 140);
    }
  }
}

// Compress into PNG
function makePng(buffer, w, h) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(buffer);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
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
fs.mkdirSync(path.join(__dirname, '../assets'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../assets/icon.png'), pngBuffer);
console.log('Generated assets/icon.png successfully! Size:', pngBuffer.length, 'bytes');
