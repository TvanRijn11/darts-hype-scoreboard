'use client';

import { SoundType, SOUNDS } from '@/src/types/sounds';
import { setSoundURL } from './sounds';

export const initializeSounds = (): void => {
  SOUNDS.forEach((sound) => {
    const url = sound.customUrl || sound.url;
    setSoundURL(sound.id, url);
  });
};

export { setSoundURL };
