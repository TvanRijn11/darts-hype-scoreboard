#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const soundsJsonPath = path.join(__dirname, '..', 'src', 'lib', 'sounds', 'sounds.json');
const sounds = JSON.parse(fs.readFileSync(soundsJsonPath, 'utf8'));

const soundIds = Object.keys(sounds.sounds);

// Generate TypeScript types/sounds.ts
const tsContent = `// Auto-generated from sounds.json - DO NOT EDIT MANUALLY
// Run: npm run generate:sounds

export type SoundId = ${soundIds.map(id => `'${id}'`).join(' | ')};

export type SoundCategory = 'game' | 'soundboard';

export interface SoundConfig {
  file: string;
  category: SoundCategory;
  label: string;
  description?: string;
  customUrl?: string;
}

export interface SoundEntry extends SoundConfig {
  id: SoundId;
  url: string;
}

export const SOUND_URLS: Record<SoundId, string> = {
${soundIds.map(id => `  '${id}': '/sounds/${sounds.sounds[id].file}',`).join('\n')}
};

export const SOUND_CONFIGS: Record<SoundId, SoundConfig> = {
${soundIds.map(id => `  '${id}': {
    file: '${sounds.sounds[id].file}',
    category: '${sounds.sounds[id].category}',
    label: '${sounds.sounds[id].label || id}',
    description: '${sounds.sounds[id].description || ''}',
  },`).join('\n')}
};

export const SOUNDS: SoundEntry[] = [
${soundIds.map(id => `  {
    id: '${id}',
    file: '${sounds.sounds[id].file}',
    category: '${sounds.sounds[id].category}',
    label: '${sounds.sounds[id].label || id}',
    description: '${sounds.sounds[id].description || ''}',
    url: '/sounds/${sounds.sounds[id].file}',
  },`).join('\n')}
];

export const SOUNDS_BY_CATEGORY: Record<SoundCategory, SoundEntry[]> = {
  game: SOUNDS.filter(s => s.category === 'game'),
  soundboard: SOUNDS.filter(s => s.category === 'soundboard'),
};

export const GAME_SOUNDS = SOUNDS_BY_CATEGORY.game;
export const SOUNDBOARD_SOUNDS = SOUNDS_BY_CATEGORY.soundboard;

export type SoundType = SoundId;
`;

const tsPath = path.join(__dirname, '..', 'src', 'types', 'sounds.ts');
fs.writeFileSync(tsPath, tsContent);
console.log('Generated types/sounds.ts');

// Generate CommonJS server/sounds.js
const cjsContent = `// Auto-generated from sounds.json - DO NOT EDIT MANUALLY
// Run: npm run generate:sounds

const SOUND_PATHS = {
${soundIds.map(id => `  '${id}': '/sounds/${sounds.sounds[id].file}',`).join('\n')}
};

const SOUND_CONFIGS = {
${soundIds.map(id => `  '${id}': {
    file: '${sounds.sounds[id].file}',
    category: '${sounds.sounds[id].category}',
    description: '${sounds.sounds[id].description || ''}',
  },`).join('\n')}
};

module.exports = {
  SOUND_PATHS,
  SOUND_CONFIGS,
  soundIds: ${JSON.stringify(soundIds)},
};
`;

const cjsPath = path.join(__dirname, '..', 'server', 'sounds.js');
fs.writeFileSync(cjsPath, cjsContent);
console.log('Generated server/sounds.js');

console.log('\\nSound generation complete!');
console.log(`Total sounds: ${soundIds.length}`);
