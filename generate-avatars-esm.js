// Скрипт для генерации 25 аватарок (ES modules)
// Запусти: node generate-avatars.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, 'public', 'avatars');

// Создаем папку если её нет
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const colors = [
  '#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB',
  '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784',
  '#AED581', '#FF8A65', '#A1887F', '#90A4AE', '#FFD54F',
  '#EF5EAB', '#AC86EC', '#42A5F5', '#26C6DA', '#26A069',
  '#66BB6A', '#C5E1A5', '#FFB74D', '#FF915A', '#A776BA'
];

const icons = [
  '🚀', '⭐', '🎯', '💡', '🔥', 
  '⚡', '🌟', '🎨', '🏆', '💪', 
  '🎪', '🌈', '🎭', '🎬', '🎮', 
  '🎲', '🎸', '🎹', '🎤', '🎧',
  '📚', '✨', '🌺', '🦋', '🎀'
];

// Генерируем 25 SVG файлов
for (let i = 0; i < 25; i++) {
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${colors[i]}"/>
  <text x="50" y="50" text-anchor="middle" dy=".35em" font-size="45">${icons[i]}</text>
</svg>`;

  const filename = `avatar-${i + 1}.svg`;
  fs.writeFileSync(path.join(avatarsDir, filename), svg);
  console.log(`✅ Создан ${filename}`);
}

console.log('\n🎉 Все 25 аватарок созданы в папке public/avatars/');
