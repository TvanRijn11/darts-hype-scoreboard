'use client';

import { SoundType } from '@/types/game';

// Audio file URLs for sound effects (can be replaced with your own hosted files)
// These use free audio hosting services - feel free to add your own sound file URLs
const SOUND_URLS: Record<SoundType, string> = {
  '180': '/sounds/180.mp3',
  'bust': '/sounds/bust.mp3',
  'winner': '/sounds/winner.mp3',
  '67': '/sounds/67.mp3',
  'indian-song': '/sounds/indian-song.mp3',
  'luke-the-nuke': '/sounds/luke-the-nuke.mp3',
  'seven nation army': '/sounds/seven-nation-army.mp3',
  'shame': '/sounds/shame.mp3',
};

// Audio instances to stop previous sounds
const audioInstances: Record<SoundType, HTMLAudioElement | null> = {
  '180': null,
  'bust': null,
  'winner': null,
  '67': null,
  'indian-song': null,
  'luke-the-nuke': null,
  'seven nation army': null,
  'shame': null,
};

/**
 * Plays an audio file, with fallback to Web Speech Synthesis
 */
export const playSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;

  // Stop any currently playing sound of this type
  if (audioInstances[type]) {
    audioInstances[type]?.pause();
    audioInstances[type] = null;
  }

  // Try to play audio file first
  try {
    const audioUrl = SOUND_URLS[type];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioInstances[type] = audio;
      
      audio.play().catch(() => {
        // If audio fails, fall back to speech synthesis
        playSpeech(type);
      });
      
      return;
    }
  } catch (error) {
    // If audio fails for any reason, fall back to speech synthesis
    playSpeech(type);
  }
};

/**
 * Fallback: Plays a sound using Web Speech Synthesis API
 */
const playSpeech = (type: SoundType): void => {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance();
  msg.lang = 'en-GB'; // British accent for darts!

  switch (type) {
    case '180':
      msg.text = 'One hundred and eighty!';
      msg.rate = 1.1;
      msg.pitch = 1.3;
      msg.volume = 1;
      break;
    case 'bust':
      msg.text = 'No score!';
      msg.rate = 1.0;
      msg.pitch = 0.8;
      break;
    case 'winner':
      msg.text = 'Game shot, and the match!';
      msg.rate = 1.1;
      msg.pitch = 1.1;
      break;
  }

  window.speechSynthesis.speak(msg);
};

/**
 * Set custom audio URLs for sounds
 * Use this to replace the default sound URLs with your own
 */
export const setSoundURL = (type: SoundType, url: string): void => {
  SOUND_URLS[type] = url;
};
