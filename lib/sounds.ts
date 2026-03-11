'use client';

import { SoundType } from '@/types/game';

// Audio file URLs for sound effects (can be replaced with your own hosted files)
// These use free audio hosting services - feel free to add your own sound file URLs
const SOUND_URLS: Record<SoundType, string> = {
  '180': '/sounds/180.mp3',
  '67': '/sounds/67.mp3',
  'indian-song': '/sounds/indian-song.mp3',
  'luke-the-nuke': '/sounds/luke-the-nuke.mp3',
  'seven nation army': '/sounds/seven-nation-army.mp3',
  'kip': '/sounds/kip.mp3',
  'messi': '/sounds/messi.mp3',
  'trap': '/sounds/trap.mp3',
  'brainrot': '/sounds/brainrot.mp3',
  'fbi': '/sounds/fbi.mp3',
  'granny': '/sounds/granny.mp3',
  'hema': '/sounds/hema.mp3',
  'poepen': '/sounds/poepen.mp3',
  'scream': '/sounds/scream.mp3',
  'sinterklaasjournaal': '/sounds/sinterklaasjournaal.mp3',
  'spetterpoep': '/sounds/spetterpoep.mp3',
  'watermeloen': '/sounds/watermeloen.mp3',
  'running': '/sounds/running.mp3',
  'angelo': '/sounds/angelo.mp3',
  'luchtalarm': '/sounds/luchtalarm.mp3',
};

let currentAudio: HTMLAudioElement | null = null;
let currentType: SoundType | null = null;

export type SoundPlaybackStatus = 'playing' | 'stopped';
export type SoundPlaybackEvent = { type: SoundType; status: SoundPlaybackStatus };

const playbackListeners = new Set<(event: SoundPlaybackEvent) => void>();

export const onSoundPlayback = (
  listener: (event: SoundPlaybackEvent) => void
): (() => void) => {
  playbackListeners.add(listener);
  return () => playbackListeners.delete(listener);
};

const emitPlayback = (event: SoundPlaybackEvent) => {
  playbackListeners.forEach((l) => l(event));
};

export const speakScore = (score: number | string): void => {
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis) return;

  // Don't stop currently playing audio here; only manage speech.
  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance();
  msg.lang = 'en-GB';
  msg.text = `${score}`;
  msg.rate = 1.05;
  msg.pitch = 1.0;
  msg.volume = 1;

  window.speechSynthesis.speak(msg);
};

/**
 * Plays an audio file, with fallback to Web Speech Synthesis
 */
export const playSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;

  // Stop anything currently playing (audio or speech) before starting a new sound
  if (currentType) emitPlayback({ type: currentType, status: 'stopped' });
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  currentType = type;
  emitPlayback({ type, status: 'playing' });

  // Try to play audio file first
  try {
    const audioUrl = SOUND_URLS[type];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      const clearIfCurrent = () => {
        if (currentAudio === audio) {
          currentAudio = null;
          if (currentType === type) {
            currentType = null;
            emitPlayback({ type, status: 'stopped' });
          }
        }
      };
      audio.addEventListener('ended', clearIfCurrent);
      audio.addEventListener('pause', clearIfCurrent);

      audio.play().catch(() => {
        // If audio fails, fall back to speech synthesis
        if (currentAudio === audio) currentAudio = null;
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
  msg.onend = () => {
    if (currentType === type) {
      currentType = null;
      emitPlayback({ type, status: 'stopped' });
    }
  };
  msg.onerror = () => {
    if (currentType === type) {
      currentType = null;
      emitPlayback({ type, status: 'stopped' });
    }
  };

  switch (type) {
    case '180':
      msg.text = 'One hundred and eighty!';
      msg.rate = 1.1;
      msg.pitch = 1.3;
      msg.volume = 1;
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
