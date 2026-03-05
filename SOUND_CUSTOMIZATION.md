# Sound Customization Guide

## How to Add Custom Sounds

The Darts Hype Scoreboard now supports playing custom audio files! Here's how to customize the sounds:

### Option 1: Use Local Files (Recommended for Development)

1. Create a `public/sounds/` directory in your project:

   ```bash
   mkdir -p public/sounds
   ```

2. Add your audio files:

   **Game Sounds (auto-play):**
   - `180.mp3` - Sound for 180 points
   - `bust.mp3` - Sound for busting
   - `winner.mp3` - Sound for winning

   **Soundboard Sounds (manual triggers):**
   - `cheer.mp3` - Crowd cheer sound
   - `goodshot.mp3` - Good shot commentary
   - `fantastic.mp3` - Fantastic shot commentary
   - `wow.mp3` - Wow reaction sound
   - `shame.mp3` - Shame/oh no reaction

3. Sounds are automatically configured in `lib/soundConfig.ts`:

   ```typescript
   export const initializeSounds = (): void => {
     setSoundURL("180", "/sounds/180.mp3");
     setSoundURL("bust", "/sounds/bust.mp3");
     setSoundURL("winner", "/sounds/winner.mp3");
     setSoundURL("cheer", "/sounds/cheer.mp3");
     setSoundURL("goodshot", "/sounds/goodshot.mp3");
     setSoundURL("fantastic", "/sounds/fantastic.mp3");
     setSoundURL("wow", "/sounds/wow.mp3");
     setSoundURL("shame", "/sounds/shame.mp3");
   };
   ```

4. The app automatically calls `initializeSounds()` on startup

### Option 2: Use Hosted Audio Files

Use any publicly accessible audio file URL:

```typescript
setSoundURL("180", "https://your-cdn.com/sounds/180.mp3");
setSoundURL("bust", "https://your-cdn.com/sounds/bust.mp3");
setSoundURL("winner", "https://your-cdn.com/sounds/winner.mp3");
setSoundURL("cheer", "https://your-cdn.com/sounds/cheer.mp3");
```

### Option 3: Embed Audio from myinstants.com

To use sounds from myinstants.com:

1. Find a sound you like on [myinstants.com](https://www.myinstants.com)
2. Right-click on the play button and inspect the audio element
3. Copy the audio file URL
4. Add it to `lib/soundConfig.ts`

Example:

```typescript
setSoundURL("180", "https://path-to-myinstants-audio.mp3");
```

## Supported Audio Formats

- MP3
- WAV
- OGG
- FLAC
- M4A

## Fallback Behavior

If an audio file fails to load or play, the app will automatically fall back to Web Speech Synthesis (text-to-speech), so the app will always produce sounds!

## Testing

1. Start the development server: `npm run dev`
2. Open the Soundboard section
3. Click any sound button to test
4. Check browser console for any loading errors

## Troubleshooting

**Sound not playing?**

- Check that the audio file URL is correct and publicly accessible
- Verify the audio format is supported
- Check browser console for CORS errors
- The fallback text-to-speech will activate automatically

**CORS Issues?**

- Make sure your audio hosting allows cross-origin requests
- Use a CORS proxy if needed (last resort)
- Host files locally in the `public/` folder

## Free Audio Resources

- [Soundjay.com](https://www.soundjay.com) - Free sound effects
- [Zapsplat.com](https://www.zapsplat.com) - Free sound effects
- [Freesound.org](https://freesound.org) - Creative Commons sounds
- [myinstants.com](https://www.myinstants.com) - Community soundboard
