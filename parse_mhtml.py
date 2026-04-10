import email
import os
from bs4 import BeautifulSoup

d = 'scormstack'
for f in os.listdir(d):
    if not f.endswith('.mhtml'): continue
    path = os.path.join(d, f)
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        msg = email.message_from_file(fp)
        for part in msg.walk():
            if part.get_content_type() == 'text/html':
                html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                soup = BeautifulSoup(html, 'html.parser')
                
                # Remove scripts, styles
                for script in soup(["script", "style", "svg", "path", "img", "meta", "link"]):
                    script.extract()
                
                text = "\n".join([line.strip() for line in soup.get_text().splitlines() if line.strip()])
                out_path = path + '.txt'
                with open(out_path, 'w', encoding='utf-8') as out:
                    out.write(text)
                print(f"Parsed {f} -> {out_path}")
                break
