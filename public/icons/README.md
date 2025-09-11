# Icons Directory

This directory should contain PWA icons in various sizes. Generate them using a tool like [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/).

## Required Icons

### App Icons (PNG format)
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Shortcut Icons
- shortcut-map.png (192x192)
- shortcut-drops.png (192x192)
- shortcut-create.png (192x192)

### Apple Touch Icons
- apple-touch-icon.png (180x180)
- apple-touch-icon-precomposed.png (180x180)

## Generation Command

Using PWA Asset Generator:
```bash
npx pwa-asset-generator logo.svg ./public/icons --manifest ./public/manifest.json --index ./src/app/layout.tsx --type png --padding "10%" --background "#ffffff"
```

## Design Guidelines

- Use the Trove logo with a map pin or location icon
- Primary color: #3b82f6 (blue)
- Background: White (#ffffff) 
- Ensure good contrast and visibility at small sizes
- Follow platform-specific guidelines for masking and safe areas
