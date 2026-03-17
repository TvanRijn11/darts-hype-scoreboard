'use client';

import { SoundType, SOUND_URLS } from '@/src/types/sounds';

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

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance();
  msg.lang = 'en-GB';
  msg.text = `${score}`;
  msg.rate = 1.05;
  msg.pitch = 1.0;
  msg.volume = 1;

  window.speechSynthesis.speak(msg);
};

export const playSound = (type: SoundType): void => {
  if (typeof window === 'undefined') return;

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
        if (currentAudio === audio) currentAudio = null;
        playSpeech(type);
      });

      return;
    }
  } catch (error) {
    playSpeech(type);
  }
};

const playSpeech = (type: SoundType): void => {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance();
  msg.lang = 'en-GB';
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

export const setSoundURL = (type: SoundType, url: string): void => {
  SOUND_URLS[type] = url;
};
