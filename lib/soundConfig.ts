'use client';

import { SoundType } from '@/types/game';
import { setSoundURL } from './sounds';

/**
 * Configuration for custom sound URLs
 * 
 * To add your own sounds:
 * 1. Host your audio files (MP3, WAV, OGG, etc.) on a CDN or server
 * 2. Update the URLs below with your file paths
 * 3. The app will fall back to Web Speech Synthesis if audio fails to load
 * 
 * Free hosting options:
 * - Cloudinary (free tier available)
 * - Firebase Storage
 * - GitHub releases
 * - Your own server
 * 
 * Example with local files in public/:
 * 'https://yourdomain.com/sounds/180.mp3'
 */
export const initializeSounds = (): void => {
  // Use local MP3 files for best performance
  // Game sounds
  setSoundURL('180', '/sounds/180.mp3');

  // Soundboard sounds
  setSoundURL('67', '/sounds/67.mp3');
  setSoundURL('indian-song', '/sounds/indian-song.mp3');
  setSoundURL('luke-the-nuke', '/sounds/luke-the-nuke.mp3');
  setSoundURL('seven nation army', '/sounds/seven-nation-army.mp3');
  setSoundURL('kip', '/sounds/kip.mp3');
  setSoundURL('messi', '/sounds/messi.mp3');
  setSoundURL('trap', '/sounds/winner.mp3');
};

/**
 * Quick setup for myinstants darts sounds
 * Call this to use curated darts sounds from the community
 */
export const setupMyInstancesDartsSounds = (): void => {
  setSoundURL('180', 'https://www.myinstants.com/data/5e/audio/darts-180-19928.mp3');
  // You can add more darts-specific sounds from myinstants here
  // Find them at: https://www.myinstants.com/?search=darts
};

/**
 * Set a custom sound URL
 * Example: setSoundURL('180', '/sounds/180-custom.mp3')
 */
export { setSoundURL };
