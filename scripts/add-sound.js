#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const soundsJsonPath = path.join(__dirname, '..', 'src', 'lib', 'sounds', 'sounds.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n=== Add New Sound ===\n');

  const sounds = JSON.parse(fs.readFileSync(soundsJsonPath, 'utf8'));

  const id = await askQuestion('Sound ID (e.g., "my-sound"): ');
  if (!id) {
    console.log('Error: Sound ID is required');
    rl.close();
    process.exit(1);
  }

  if (sounds.sounds[id]) {
    console.log(`Error: Sound "${id}" already exists`);
    rl.close();
    process.exit(1);
  }

  const file = await askQuestion('Filename in public/sounds/ (e.g., "my-sound.mp3"): ');
  if (!file) {
    console.log('Error: Filename is required');
    rl.close();
    process.exit(1);
  }

  console.log('\nCategories:');
  console.log('  1. game (sounds triggered by game events)');
  console.log('  2. soundboard (manual sound triggers)');
  const categoryChoice = await askQuestion('Category (1 or 2): ');
  const category = categoryChoice === '1' ? 'game' : 'soundboard';

  const description = await askQuestion('Description (optional): ');

  const label = id.toUpperCase().replace(/-/g, ' ');

  sounds.sounds[id] = {
    file,
    category,
    label: label || id.toUpperCase(),
    description: description || `Soundboard sound`
  };

  fs.writeFileSync(soundsJsonPath, JSON.stringify(sounds, null, 2));

  console.log('\n--- Running npm run generate:sounds ---\n');

  const generateScript = path.join(__dirname, '..', 'scripts', 'generate-sounds.js');
  require(generateScript);

  console.log(`\n✓ Sound "${id}" added successfully!`);
  console.log(`  File: ${file}`);
  console.log(`  Category: ${category}`);
  console.log('\nNext steps:');
  console.log(`  1. Place your audio file in public/sounds/${file}`);
  console.log('  2. Restart the dev server if running');
  console.log('  3. Run: npm run generate:sounds (already done)');

  rl.close();
}

main();
