const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname);

fs.readdirSync(baseDir).forEach(folder => {
  const oldPath = path.join(baseDir, folder);

  if (fs.lstatSync(oldPath).isDirectory() && folder.endsWith('-converted')) {
    const newFolder = folder.replace(/-converted$/, '');
    const newPath = path.join(baseDir, newFolder);

    fs.renameSync(oldPath, newPath);
    console.log(`✅ Renamed: ${folder} ➜ ${newFolder}`);
  }
});

console.log('🎉 All converted folders renamed!');
