import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceDir = path.resolve(__dirname, '../../..');

function search(dir: string, term: string) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.claude' || file === '.gemini') {
        continue;
      }
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        search(fullPath, term);
      } else if (/\.(tsx?|jsx?|html|json|sql|txt|md|mjs|js)$/.test(file)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.toLowerCase().includes(term.toLowerCase())) {
          console.log(`FOUND "${term}" IN: ${fullPath}`);
        }
      }
    }
  } catch (err) {
    // Ignore read errors
  }
}

console.log(`Searching for "open wc26 hub" in workspace ${workspaceDir}...`);
search(workspaceDir, "open wc26 hub");
console.log(`Searching for "more from" in workspace ${workspaceDir}...`);
search(workspaceDir, "more from");
console.log(`Searching for "wc26 first" in workspace ${workspaceDir}...`);
search(workspaceDir, "wc26 first");
console.log("Search complete.");
