# Server Setup Guide

This guide covers running the WebSocket server on a Raspberry Pi for remote/hyped darts play.

## Overview

The server handles:
- Sound playback on the server machine (for amplified audio)
- Broadcasting sounds to connected clients
- Voice streaming from clients to server

## Prerequisites

### Raspberry Pi Setup

1. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install ngrok**:
   ```bash
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
   echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
   sudo apt update && sudo apt install ngrok
   ```

3. **Configure ngrok auth token**:
   ```bash
   ngrok config add-authtoken YOUR_NGROK_TOKEN
   ```

4. **Install PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   ```

5. **Audio setup** (optional, for server-side sound):
   - Connect speakers/amplifier to the Pi's audio jack or USB
   - Test with: `aplay /usr/share/sounds/alsa/Noise.wav`

## Installation

1. **Clone and install**:
   ```bash
   cd ~/darts-hype-scoreboard
   npm install
   ```

2. **Configure environment**:
   ```bash
   # Edit .env file
   nano .env
   ```

   Add your WebSocket URL configuration:
   ```
   USE_NGROK=true
   WS_PORT=4000
   WS_ALLOWED_ORIGINS=*
   ```

## Starting the Server

### Option 1: Using the startup script

```bash
./start-all.sh
```

This script:
- Stops any existing processes
- Starts the WebSocket server via PM2
- Starts ngrok tunnel
- Saves PM2 state for auto-restart on reboot

### Option 2: Manual start

```bash
# Terminal 1: Start WebSocket server
npm run ws-server

# Terminal 2: Start ngrok (separate)
ngrok http 4000
```

### Option 3: With ngrok auto-start

```bash
npm run ws-server:ngrok
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_PORT` | 4000 | WebSocket server port |
| `USE_NGROK` | false | Whether to auto-start ngrok |
| `WS_ALLOWED_ORIGINS` | * | Comma-separated CORS origins |

### ngrok Configuration

For a persistent domain, upgrade to ngrok paid plan and configure:
```bash
ngrok http --domain=your-domain.ngrok-app.com 4000
```

## Checking Status

```bash
# PM2 status
pm2 list

# PM2 logs
pm2 logs ws-server
pm2 logs ngrok-tunnel

# ngrok URL
cat server/ngrok-url.txt
```

## Troubleshooting

### Server not starting
- Check Node.js version: `node --version` (needs 18+)
- Check ports: `sudo lsof -i :4000`

### ngrok not connecting
- Verify auth token: `ngrok config check`
- Check ngrok dashboard: https://dashboard.ngrok.com

### Audio not playing on server
- Check audio device: `aplay -l`
- Test playback: `aplay /usr/share/sounds/alsa/Noise.wav`
- The server uses `plughw:2,0` - adjust in `server/websocket-server.js` if needed

### Client can't connect
- Verify the ngrok URL is correct in the frontend
- Check CORS settings in server
- Ensure using `https://` not `http://`

## Production Considerations

### Auto-start on boot

PM2 handles this after first run:
```bash
pm2 save
sudo pm2 startup
```

### Firewall

If using a home router, forward port 4000 or rely on ngrok tunnel.

### Custom Domain

For a stable URL:
1. Purchase a domain
2. Configure ngrok with your domain
3. Update `NEXT_PUBLIC_WS_URL` in frontend `.env`

## Voice Streaming

The server supports voice streaming from clients:

1. Client connects with `?mode=server&playback=server`
2. Client streams microphone audio via `voice-data` events
3. Server plays audio on `plughw:2,0` (configurable ALSA device)

This allows commentary from a phone/tablet to be amplified through the server's speakers.
