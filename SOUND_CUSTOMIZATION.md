# Sound Customization Guide

## Overview

All sounds are now configured in a single file: `sounds.json`. This makes it easy to add, remove, or modify sounds without editing multiple files.

## Quick Start

### Adding a New Sound

**Option 1: Interactive CLI (Recommended)**
```bash
npm run add:sound
```

This will prompt you for:
- Sound ID (e.g., "my-awesome-sound")
- Filename in `public/sounds/` (e.g., "my-awesome-sound.mp3")
- Category (game or soundboard)
- Description (optional)

**Option 2: Manual Edit**

1. Add the sound to `sounds.json`:
```json
{
  "sounds": {
    "my-sound": {
      "file": "my-sound.mp3",
      "category": "soundboard",
      "description": "My custom sound"
    }
  }
}
```

2. Place your audio file in `public/sounds/my-sound.mp3`

3. Regenerate the types:
```bash
npm run generate:sounds
```

## Sound Configuration

Each sound in `sounds.json` has these properties:

| Property | Type | Description |
|----------|------|-------------|
| `file` | string | Filename in `public/sounds/` |
| `category` | string | "game" (auto-play) or "soundboard" (manual) |
| `description` | string | Optional description |
| `customUrl` | string | Optional override URL (for CDN hosting) |

### Categories

- **game**: Sounds triggered automatically by game events (180, winners, etc.)
- **soundboard**: Sounds triggered manually from the soundboard UI

## Using Custom Audio URLs

To use hosted audio files instead of local files, add a `customUrl` property:

```json
{
  "sounds": {
    "180": {
      "file": "180.mp3",
      "category": "game",
      "customUrl": "https://your-cdn.com/sounds/180.mp3"
    }
  }
}
```

The `customUrl` takes precedence over the local `file`.

## Supported Audio Formats

- MP3 (recommended)
- WAV
- OGG
- FLAC
- M4A

## Fallback Behavior

If an audio file fails to load or play, the app automatically falls back to Web Speech Synthesis (text-to-speech).

## Regenerating Types

After editing `sounds.json`, run:

```bash
npm run generate:sounds
```

This generates:
- `types/sounds.ts` - TypeScript types and URLs for the frontend
- `server/sounds.js` - CommonJS module for the WebSocket server

## Directory Structure

```
project/
├── sounds.json              # Single source of truth for sound config
├── public/
│   └── sounds/             # Audio files go here
│       ├── 180.mp3
│       ├── trap.mp3
│       └── ...
├── types/
│   └── sounds.ts           # Auto-generated
├── server/
│   └── sounds.js           # Auto-generated
└── lib/
    └── sounds.ts           # Uses generated types
```

## Troubleshooting

**Sound not playing?**
- Verify the file exists in `public/sounds/`
- Check browser console for errors
- Ensure you've run `npm run generate:sounds`

**Changes not showing?**
- Restart the dev server: `npm run dev`
- Make sure to run `npm run generate:sounds` after editing `sounds.json`

**CORS Issues?**
- Use local files in `public/sounds/`
- Or use a CDN that allows cross-origin requests

## Free Audio Resources

- [Soundjay.com](https://www.soundjay.com) - Free sound effects
- [Zapsplat.com](https://www.zapsplat.com) - Free sound effects
- [Freesound.org](https://freesound.org) - Creative Commons sounds
- [myinstants.com](https://www.myinstants.com) - Community soundboard
