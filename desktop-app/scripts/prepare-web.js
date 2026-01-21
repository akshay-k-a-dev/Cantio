const fs = require('fs');
const path = require('path');

const FRONTEND_DIST = path.join(__dirname, '..', '..', 'vercel-serverless', 'frontend', 'dist');
const DEST = path.join(__dirname, '..', 'dist');
const ICON_SRC = path.join(__dirname, '..', '..', 'vercel-serverless', 'frontend', 'public', 'icon.svg');
const ICON_DEST = path.join(__dirname, '..', 'assets', 'icon.svg');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) throw new Error('Source not found: ' + src);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

try {
  if (!fs.existsSync(FRONTEND_DIST)) {
    console.error('Frontend dist not found. Run `cd vercel-serverless/frontend && npm install && VITE_API_URL=https://music-mu-lovat.vercel.app npm run build` first.');
    process.exit(1);
  }
  copyDir(FRONTEND_DIST, DEST);
  if (fs.existsSync(ICON_SRC)) {
    fs.copyFileSync(ICON_SRC, ICON_DEST);
    console.log('Copied icon.svg to assets/. Convert to PNG/ICO for best results.');
  }
  console.log('Front-end prepared in', DEST);
} catch (err) {
  console.error(err);
  process.exit(1);
}
