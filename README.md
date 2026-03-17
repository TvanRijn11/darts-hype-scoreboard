<div align="center">
<img width="1200" height="475" alt="Darts Hype Scoreboard" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Darts Hype Scoreboard

A hype scoreboard for darts with sound effects, commentary, and a soundboard.

## Features

- **Game Modes**: 501, 301, Cricket
- **Soundboard**: 27 built-in sound effects
- **Audio Commentary**: Text-to-speech score announcement
- **Remote Play**: WebSocket server for syncing sounds across devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file with:

```
GEMINI_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### WebSocket Server

For multi-device sound sync, run the WebSocket server:

```bash
npm run ws-server
```

The server runs on port 4000 by default. Set `WS_PORT` to customize.

## Sound Management

All sounds are configured in `sounds.json`. This single file defines:
- Sound IDs and filenames
- Categories (game/soundboard)
- Custom URLs (for CDN hosting)

### Adding a Sound

**Interactive CLI:**
```bash
npm run add:sound
```

**Manual:**
1. Add sound to `sounds.json`
2. Place audio file in `public/sounds/`
3. Run `npm run generate:sounds`

See [SOUND_CUSTOMIZATION.md](SOUND_CUSTOMIZATION.md) for detailed documentation.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Socket.io
- Web Audio API

## License

MIT
