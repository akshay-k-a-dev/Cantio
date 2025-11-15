# PWA Setup Instructions

## Creating PWA Icons

You need to create the following PNG icons from your pwa.png screenshot:

### Required Icons:

1. **pwa-192.png** (192x192px)
   - Standard PWA icon
   - Place in `client/public/` and `vercel-serverless/frontend/public/`

2. **pwa-512.png** (512x512px)
   - High-res PWA icon
   - Place in `client/public/` and `vercel-serverless/frontend/public/`

3. **pwa-192-maskable.png** (192x192px)
   - Icon with safe zone for maskable
   - Place in `client/public/` and `vercel-serverless/frontend/public/`

4. **pwa-512-maskable.png** (512x512px)
   - High-res maskable icon
   - Place in `client/public/` and `vercel-serverless/frontend/public/`

### How to Create Icons:

#### Option 1: Using Online Tools
- Visit: https://www.pwabuilder.com/imageGenerator
- Upload your logo or screenshot
- Download all required sizes

#### Option 2: Using ImageMagick (CLI)
```bash
# Install ImageMagick first
sudo apt install imagemagick

# Create 192x192
convert pwa.png -resize 192x192 pwa-192.png

# Create 512x512
convert pwa.png -resize 512x512 pwa-512.png

# For maskable icons, add 10% padding
convert pwa.png -resize 154x154 -gravity center -extent 192x192 -background transparent pwa-192-maskable.png
convert pwa.png -resize 410x410 -gravity center -extent 512x512 -background transparent pwa-512-maskable.png
```

#### Option 3: Using Node.js Script
```javascript
// Create this as generate-icons.js
const sharp = require('sharp');

async function generateIcons() {
  const sizes = [
    { size: 192, name: 'pwa-192.png' },
    { size: 512, name: 'pwa-512.png' },
    { size: 192, name: 'pwa-192-maskable.png', padding: 20 },
    { size: 512, name: 'pwa-512-maskable.png', padding: 51 }
  ];

  for (const { size, name, padding } of sizes) {
    const actualSize = padding ? size - (padding * 2) : size;
    
    await sharp('pwa.png')
      .resize(actualSize, actualSize)
      .extend({
        top: padding || 0,
        bottom: padding || 0,
        left: padding || 0,
        right: padding || 0,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(name);
    
    console.log(`✅ Created ${name}`);
  }
}

generateIcons();
```

### After Creating Icons:

1. Place all PNG files in:
   - `client/public/`
   - `vercel-serverless/frontend/public/`

2. Ensure `pwa.png` (screenshot) is also in both public folders

3. Test PWA:
   ```bash
   npm run dev
   # Open Chrome DevTools > Application > Manifest
   # Check all icons load correctly
   ```

## Testing PWA Installation

### Desktop (Chrome/Edge):
1. Open http://localhost:5173
2. Look for install icon in address bar
3. Or use Chrome DevTools > Application > Manifest > "Add to homescreen"

### Mobile (Android Chrome):
1. Visit the deployed site
2. Chrome will show "Add to Home screen" banner
3. Or use menu > "Install app"

### iOS Safari:
1. Visit the site
2. Tap Share button
3. Select "Add to Home Screen"
