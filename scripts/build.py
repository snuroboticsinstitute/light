"""Build the light site from the main site's dist/.

Usage: python3 scripts/build.py <main-site dist> <output dir>

Copies only the pages listed in PAGES, keeps the main site's design, rebuilds
the main menu (소개 · 사람들 · 국가연구소 · 교육 · 소식), unwraps links to pages that
are not part of the light site, and prefixes absolute paths with BASE because
the site is served from /light/.
"""
import json
import re
import shutil
import sys
from pathlib import Path

BASE = '/light'
PAGES = ['', 'about/director-message/', 'about/vision/', 'about/history/', 'about/directions/',
         'people/', 'research/nrl/', 'research/nrl/faculty/',
         'education/', 'education/creative-engineering-design/', 'education/talent-development/', 'updates/', 'updates/newsletter-01/', 'search/']
ALLOWED = set('/' + p for p in PAGES) | set('/en/' + p for p in PAGES)
MENU = {
    'ko': [('about', 'about/director-message/', '소개'), ('people', 'people/', '사람들'),
           ('nrl', 'research/nrl/', '국가연구소'), ('education', 'education/', '교육'), ('updates', 'updates/', '소식')],
    'en': [('about', 'about/director-message/', 'About'), ('people', 'people/', 'People'),
           ('nrl', 'research/nrl/', 'NRL'), ('education', 'education/', 'Education'), ('updates', 'updates/', 'Updates')],
}


def section(page):
    for key, prefix in (('about', 'about/'), ('people', 'people/'), ('nrl', 'research/nrl/'), ('education', 'education/'), ('updates', 'updates/')):
        if page.startswith(prefix):
            return key
    return None


def build_menu(lang, current):
    def build(match):
        indent = re.search(r'\n(\s*)<a ', match.group(0))
        pad = indent.group(1) if indent else '      '
        pre = '/en/' if lang == 'en' else '/'
        items = ''.join(f'\n{pad}<a class="{key}-nav" href="{pre}{href}"'
                        + (' aria-current="page"' if key == current else '') + f'>{label}</a>'
                        for key, href, label in MENU[lang])
        return match.group(1) + items + '\n' + pad[:-2] + '</nav>'
    return build


def allowed(path):
    path = re.split(r'[?#]', path)[0]
    if path.startswith('/assets/') or path.startswith('//'):
        return True
    if not path.endswith('/') and '.' not in path.rsplit('/', 1)[-1]:
        path += '/'
    return path in ALLOWED


def unwrap_excluded(html):
    # Links to pages outside the light site keep their text but lose the link.
    def repl(match):
        return match.group(2) if not allowed(match.group(1)) else match.group(0)
    return re.sub(r'<a\b[^>]*?\bhref="(/[^"]*)"[^>]*>(.*?)</a>', repl, html, flags=re.S)


def prefix_paths(text):
    text = re.sub(r'((?:href|src|action|content|poster|data-[\w-]+)=")/(?!/)', r'\1' + BASE + '/', text)
    text = re.sub(r'(srcset="[^"]*)', lambda m: re.sub(r'(^|,\s*|")/(?!/)', r'\1' + BASE + '/', m.group(1)), text)
    text = re.sub(r"url\((['\"]?)/(?!/)", r'url(\1' + BASE + '/', text)
    return text


def main(src, out):
    src, out = Path(src), Path(out)
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(src / 'assets', out / 'assets')
    for lang, pre in (('ko', ''), ('en', 'en/')):
        for page in PAGES:
            html = (src / pre / page / 'index.html').read_text()
            menu = build_menu(lang, section(page))
            html = re.sub(r'(<nav class="side-nav"[^>]*>).*?</nav>', menu, html, flags=re.S)
            html = re.sub(r'(<nav class="mobile-nav" id="mobile-nav"[^>]*>).*?</nav>', menu, html, flags=re.S)
            # The English version exists at /light/en/ but is not linked from the pages
            html = re.sub(r'<nav class="language-switch"[^>]*>.*?</nav>', '', html, flags=re.S)
            html = prefix_paths(unwrap_excluded(html))
            target = out / pre / page / 'index.html'
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(html)
    # Scripts and the search index carry absolute paths of their own
    for js in (out / 'assets').glob('*.js'):
        text = js.read_text()
        new = re.sub(r"(['\"`])/assets/", r'\1' + BASE + '/assets/', text)
        if new != text:
            js.write_text(new)
    for lang in ('ko', 'en'):
        index = out / 'assets' / f'search-index-{lang}.json'
        entries = [e for e in json.loads(index.read_text()) if allowed(e['url'])]
        for e in entries:
            e['url'] = BASE + e['url']
        index.write_text(json.dumps(entries, ensure_ascii=False, separators=(',', ':')))
    for css in [*(out / 'assets').glob('*.css'), *(out / 'assets').glob('*.html')]:
        text = css.read_text()
        new = prefix_paths(text)
        if new != text:
            css.write_text(new)


if __name__ == '__main__':
    main(*sys.argv[1:3])
