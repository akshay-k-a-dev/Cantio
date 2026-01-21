const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
let pngToIco = require('png-to-ico');
if (pngToIco && typeof pngToIco !== 'function' && pngToIco.default) pngToIco = pngToIco.default;

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const FRONTEND_ICON = path.join(__dirname, '..', '..', 'vercel-serverless', 'frontend', 'public', 'icon.svg');
const OUT_PNG = path.join(ASSETS_DIR, 'icon.png');
const OUT_ICO = path.join(ASSETS_DIR, 'icon.ico');

async function svgToPng(svgPath, outPng) {
  // Jimp doesn't render SVGs directly; try to load via buffer (simple workaround fallback to generated icon)
  // If svg exists, create a PNG by rasterizing basic SVG via a quick approach: load it into Jimp via an external tool is not available.
  // So prefer to generate a simple placeholder PNG if SVG to PNG is non-trivial here.
  return false;
}

async function createPlaceholderPng(outPng) {
  const image = new Jimp(512, 512, '#1f2937'); // dark background
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  const text = 'C';
  const w = Jimp.measureText(font, text);
  const h = Jimp.measureTextHeight(font, text, 512);
  image.print(font, (512 - w) / 2, (512 - h) / 2, text);
  await image.writeAsync(outPng);
  console.log('Generated placeholder PNG:', outPng);
}

async function makeIco(fromPng, outIco) {
  const buffer = fs.readFileSync(fromPng);
  const icoBuf = await pngToIco(buffer);
  fs.writeFileSync(outIco, icoBuf);
  console.log('Generated ICO:', outIco);
}

async function generateHicolorIcons(srcPng) {
  // Generate multiple sizes under assets/icons/hicolor/<size>x<size>/apps/cantio-desktop.png
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
  const topIconsDir = path.join(ASSETS_DIR, 'icons');
  if (!fs.existsSync(topIconsDir)) fs.mkdirSync(topIconsDir, { recursive: true });

  for (const s of sizes) {
    const dir = path.join(ASSETS_DIR, 'icons', 'hicolor', `${s}x${s}`, 'apps');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, 'cantio-desktop.png');
    const img = await Jimp.read(srcPng);
    await img.resize(s, s).writeAsync(out);
    console.log('Generated icon:', out);
  }

  // Also write a top-level icons/cantio-desktop.png and icons/icon.png (512) for app-builder
  const topOut = path.join(topIconsDir, 'cantio-desktop.png');
  const topOutAlt = path.join(topIconsDir, 'icon.png');
  const img512 = await Jimp.read(srcPng);
  await img512.resize(512, 512).writeAsync(topOut);
  await img512.writeAsync(topOutAlt);
  console.log('Wrote top-level icons:', topOut, topOutAlt);
}

(async () => {
  try {
    if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

    // If both PNG and ICO exist, ensure hicolor icons exist too — generate missing hicolor icons
    const hicolorTestDir = path.join(ASSETS_DIR, 'icons', 'hicolor', '256x256', 'apps');
    const needHicolor = !fs.existsSync(hicolorTestDir);

    const topIconsDir = path.join(ASSETS_DIR, 'icons');
    const topIconPng = path.join(topIconsDir, 'cantio-desktop.png');
    const topIconAlt = path.join(topIconsDir, 'icon.png');

    if (fs.existsSync(OUT_PNG) && fs.existsSync(OUT_ICO) && !needHicolor && fs.existsSync(topIconPng) && fs.existsSync(topIconAlt)) {
      console.log('Icons already exist in assets/, skipping generation.');
      return;
    }

    if (fs.existsSync(OUT_PNG) && fs.existsSync(OUT_ICO) && needHicolor) {
      console.log('PNG+ICO exist but hicolor icons missing; generating hicolor icons.');
      await generateHicolorIcons(OUT_PNG);
      console.log('Hicolor icons generated in', ASSETS_DIR);
      return;
    }

    if (fs.existsSync(OUT_PNG) && fs.existsSync(OUT_ICO) && (!fs.existsSync(topIconPng) || !fs.existsSync(topIconAlt))) {
      console.log('PNG+ICO exist but top-level icons missing; generating top-level and hicolor icons.');
      await generateHicolorIcons(OUT_PNG);
      console.log('Top-level and hicolor icons generated in', ASSETS_DIR);
      return;
    }

    if (fs.existsSync(OUT_PNG) && !fs.existsSync(OUT_ICO)) {
      console.log('PNG exists but ICO missing; generating ICO from existing PNG.');
      await makeIco(OUT_PNG, OUT_ICO);
      // Also generate hicolor sizes
      await generateHicolorIcons(OUT_PNG);
      console.log('ICO and hicolor icons generated in', ASSETS_DIR);
      return;
    }

    // No icons exist; fall back to placeholder generation
    console.log('No existing icons found. Generating placeholder icon.');
    await createPlaceholderPng(OUT_PNG);
    await makeIco(OUT_PNG, OUT_ICO);
    await generateHicolorIcons(OUT_PNG);
    console.log('Icons created in', ASSETS_DIR);
  } catch (err) {
    console.error('Icon generation failed', err);
    process.exit(1);
  }
})();