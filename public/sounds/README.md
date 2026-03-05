# Sound Files Directory

Place your custom audio files here:

## Game Sounds (auto-play during gameplay)

- `180.mp3` - Sound for 180 points
- `bust.mp3` - Sound for busting
- `winner.mp3` - Sound for winning

## Soundboard Sounds (manual triggers)

- `cheer.mp3` - Crowd cheer sound
- `goodshot.mp3` - Good shot commentary
- `fantastic.mp3` - Fantastic shot commentary
- `wow.mp3` - Wow reaction sound
- `shame.mp3` - Shame/oh no reaction

Then the sounds are automatically configured in `lib/soundConfig.ts`:

```typescript
setSoundURL("180", "/sounds/180.mp3");
setSoundURL("bust", "/sounds/bust.mp3");
setSoundURL("winner", "/sounds/winner.mp3");
setSoundURL("cheer", "/sounds/cheer.mp3");
setSoundURL("goodshot", "/sounds/goodshot.mp3");
setSoundURL("fantastic", "/sounds/fantastic.mp3");
setSoundURL("wow", "/sounds/wow.mp3");
setSoundURL("shame", "/sounds/shame.mp3");
```

See `SOUND_CUSTOMIZATION.md` for download recommendations.
