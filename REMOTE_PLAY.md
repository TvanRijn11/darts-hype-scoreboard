# Remote Play Guide

This guide explains how to use the Darts Hype Scoreboard across multiple devices.

## Connection Modes

The app supports different modes for different use cases. Configure them via:
- URL query parameters
- LocalStorage (persists between sessions)

### URL Parameters

```
https://your-app.com/?role=controller&mode=server&playback=server&ws=wss://your-ngrok-url
```

| Parameter | Values | Description |
|-----------|--------|-------------|
| `role` | `controller` / `player` | Who controls the game vs who just watches |
| `mode` | `client` / `server` | Where sounds are triggered |
| `playback` | `device` / `server` | Where sounds actually play |
| `ws` | WebSocket URL | Override the server URL |

### Role: Controller vs Player

- **Controller** (default): Primary device for entering scores, controlling the game
- **Player**: Secondary device that receives game state and plays sounds

### Output Mode: Client vs Server

- **Client** (default): Sounds are triggered and played on the device itself
- **Server**: Sounds are sent to the WebSocket server to play there

### Playback Target: Device vs Server

- **Device** (default): Play sounds locally on this device
- **Server**: Send sounds to server to play on server's audio output

## Common Setups

### Setup 1: Single Device (Local)

Everything runs on one device - no WebSocket needed.

```
Default settings (no parameters needed)
```

### Setup 2: Phone as Controller, Pi as Player

Use your phone to enter scores, but have the Raspberry Pi play sounds through speakers.

**On the Raspberry Pi (server):**
```bash
./start-all.sh
# Get the ngrok URL from logs or: cat server/ngrok-url.txt
```

**On your phone:**
```
URL: https://your-app.com/?role=controller&mode=server&playback=server&ws=wss://your-ngrok-url
```

This means:
- You're the controller (entering scores)
- Sounds go to server (server plays them)
- Audio amplifies through Pi's connected speakers

### Setup 3: Phone as Controller, Phone as Display

Use phone for input, another phone/tablet for display only.

**Controller phone:**
```
https://your-app.com/?role=controller&ws=wss://your-ngrok-url
```

**Display phone (player):**
```
https://your-app.com/?role=player&ws=wss://your-ngrok-url
```

### Setup 4: Voice Commentary Through Server

Stream your voice through the server for PA/system amplification.

**On your phone:**
```
https://your-app.com/?role=controller&mode=server&playback=server&ws=wss://your-ngrok-url
```

Then tap the microphone button to broadcast voice to the server.

## Saving Settings

Settings are saved to localStorage automatically. You only need to specify the URL once.

### Via URL (one-time)
Just visit the URL with parameters - they'll be saved.

### Via UI (future feature)
Settings panel in the app UI.

## WebSocket URL Management

The WebSocket URL can be set in multiple ways (in priority order):

1. **URL parameter**: `?ws=wss://...`
2. **LocalStorage**: `darts.wsUrl`
3. **Environment variable**: `NEXT_PUBLIC_WS_URL` (build-time)

## Troubleshooting Connection

### "No URL configured"
- Add `?ws=wss://your-ngrok-url` to the URL
- Or set `NEXT_PUBLIC_WS_URL` in `.env.local`

### "Connection refused"
- Server may be down - check PM2 status on Pi
- ngrok tunnel may have changed - get new URL

### "Connection timeout"
- Check internet connectivity
- ngrok free tier has limits - try paid tier for stability

### Sounds not playing on server
- Ensure server has audio device connected
- Check server logs: `pm2 logs ws-server`
- Verify `aplay` command works on Pi

## Quick Reference

| Use Case | role | mode | playback |
|----------|------|------|----------|
| Solo play | controller | client | device |
| Phone → Pi speakers | controller | server | server |
| Remote display | player | client | device |
| Voice PA system | controller | server | server |

## Current Configuration

Your current setup (from `.env`):
- **WebSocket URL**: `https://hypercivilized-pyrolytic-gretta.ngrok-free.dev`
- **Server Port**: 4000
