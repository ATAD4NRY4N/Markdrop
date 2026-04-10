import fs from 'fs';
import { parse } from 'node-html-parser';

const files = fs.readdirSync('scormstack');
for (const f of files) {
  if (!f.endsWith('.mhtml')) continue;
  const content = fs.readFileSync('scormstack/' + f, 'utf8');
  
  let inHtml = false;
  let buffer = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('Content-Type: text/html')) {
      inHtml = true;
      buffer = [];
      continue;
    }
    if (inHtml && line.startsWith('------MultipartBoundary')) {
      inHtml = false;
      break;
    }
    if (inHtml && !line.includes('title') && !line.includes('Content-Transfer-Encoding') && !line.includes('Content-Location')) {
      buffer.push(line.replace(/=$/, '').trim());
    }
  }
  
  const rawHtml = buffer.join('').replace(/=([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
  const root = parse(rawHtml);
  
  // Remove scripts, styles, svgs
  [...root.querySelectorAll('script, style, svg, path, link, meta, img')].forEach(el => el.remove());
  
  let text = root.text.split('\n').map(l => l.trim()).filter(l => l).join('\n');
  let structure = [...root.querySelectorAll('h1, h2, h3, button, a, div[class], section')].map(el => `<${el.tagName}> ${el.text.substring(0, 50)}`).join('\n');
  
  const outPath = 'scormstack/' + f + '.txt';
  fs.writeFileSync(outPath, "=== TEXT ===\n" + text + "\n\n=== STRUCTURE ===\n" + structure);
  console.log('Saved text for', f);
}
