const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
console.log(` Building for Plant: ${plant.toUpperCase()}`);
console.log(` Copying ${envSrc} -> ${envDest}`);
console.log(`========================================\n`);

fs.copyFileSync(envSrc, envDest);

try {
  execSync('react-scripts build', { stdio: 'inherit', cwd: frontendDir });
  
  const buildDir = path.join(frontendDir, 'build');
  const targetBuildDir = path.join(frontendDir, `build-${plant}`);

  if (fs.existsSync(targetBuildDir)) {
    console.log(`Cleaning previous output: ${targetBuildDir}`);
    fs.rmSync(targetBuildDir, { recursive: true, force: true });
  }

  // Copy build to build-<plant>
  fs.cpSync(buildDir, targetBuildDir, { recursive: true });

  console.log(`\n========================================`);
  console.log(` SUCCESS! Build for ${plant.toUpperCase()} generated at:`);
  console.log(` ${targetBuildDir}`);
  console.log(`========================================\n`);
} catch (err) {
  console.error(`Build failed for ${plant.toUpperCase()}:`, err);
  process.exit(1);
}
