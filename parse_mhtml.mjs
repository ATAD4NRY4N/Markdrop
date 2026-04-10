import fs from 'fs';
import { parse } from 'node-html-parser';

const files = fs.readdirSync('scormstack');
for (const f of files) {
  if (!f.endsWith('.mhtml')) continue;
  const content = fs.readFileSync('scormstack/' + f, 'utf8');
  
  // Extract HTML base64 or quoted-printable
  let html = '';
  const lines = content.split('\n');
  let inHtml = false;
  let buffer = [];
  
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
    if (inHtml && !line.includes('Content-Transfer-Encoding') && !line.includes('Content-Location')) {
      buffer.push(line.replace(/=$/, '').trim());
    }
  }
  
  const rawHtml = buffer.join('').replace(/=([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16)));
  
  const outPath = 'scormstack/' + f + '.txt';
  fs.writeFileSync(outPath, rawHtml);
  console.log('Saved raw HTML for', f);
}
