import fs from 'fs';

let content = fs.readFileSync('./src/store/furnitureSlice.js', 'utf8');

// Ensure unique asset items
const lines = content.split(/\r?\n/);
let inAssetList = false;
let cleanedLines = [];
let seenIds = new Set();
let currentAssetLines = [];
let currentAssetId = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('export const initialAssets = [')) {
    inAssetList = true;
    cleanedLines.push(line);
    continue;
  }
  if (inAssetList && line.startsWith('];')) {
    if (currentAssetLines.length > 0 && currentAssetId) {
      if (!seenIds.has(currentAssetId)) {
        seenIds.add(currentAssetId);
        cleanedLines.push(...currentAssetLines);
      }
    }
    inAssetList = false;
    cleanedLines.push(line);
    continue;
  }

  if (inAssetList) {
    if (line.trim().startsWith('{')) {
      if (currentAssetLines.length > 0 && currentAssetId) {
        if (!seenIds.has(currentAssetId)) {
          seenIds.add(currentAssetId);
          cleanedLines.push(...currentAssetLines);
        }
      }
      currentAssetLines = [line];
      currentAssetId = null;
    } else {
      currentAssetLines.push(line);
      const match = line.match(/id:\s*'(.*?)'/);
      if (match) {
        currentAssetId = match[1];
      }
    }
  } else {
    cleanedLines.push(line);
  }
}

fs.writeFileSync('./src/store/furnitureSlice.js', cleanedLines.join('\n'), 'utf8');
console.log('Unique deduplication complete! Total unique assets:', seenIds.size);
