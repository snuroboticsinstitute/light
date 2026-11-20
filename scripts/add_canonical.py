"""Mark every light page as a copy of the main site (canonical link).

Usage: python3 scripts/add_canonical.py dist
The main site is a single page per language, so Korean pages point to its
Korean address and English pages to its English address.
"""
import sys
from pathlib import Path

MAIN = 'https://snuroboticsinstitute.github.io'

root = Path(sys.argv[1])
for page in root.rglob('index.html'):
    html = page.read_text(encoding='utf-8')
    if 'rel="canonical"' in html or '</title>' not in html:
        continue
    target = MAIN + ('/en/' if page.relative_to(root).parts[0] == 'en' else '/')
    html = html.replace('</title>', f'</title>\n<link rel="canonical" href="{target}">', 1)
    page.write_text(html, encoding='utf-8')
    print(page)
