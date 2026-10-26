const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const plant = (process.argv[2] || 'tnga').toLowerCase();
const validPlants = ['tnga', 'gd'];

if (!validPlants.includes(plant)) {
  console.error(`Invalid plant "${plant}". Supported options: tnga, gd`);
  process.exit(1);
}

const frontendDir = path.resolve(__dirname, '..');
const envSrc = path.join(frontendDir, `.env.${plant}`);
const envDest = path.join(frontendDir, '.env');

if (!fs.existsSync(envSrc)) {
  console.error(`Environment file not found: ${envSrc}`);
  process.exit(1);
}

console.log(`\n========================================`);
console.log(` Starting Dev Server for Plant: ${plant.toUpperCase()}`);
console.log(` Active Config: ${envSrc}`);
console.log(` Port: ${plant === 'tnga' ? '3001' : '3000'}`);
console.log(`========================================\n`);

fs.copyFileSync(envSrc, envDest);

const isWindows = process.platform === 'win32';
const cmd = isWindows ? 'npx.cmd' : 'npx';
const child = spawn(cmd, ['react-scripts', 'start'], {
  stdio: 'inherit',
  cwd: frontendDir,
  shell: true,
});

child.on('close', (code) => {
  process.exit(code);
});
