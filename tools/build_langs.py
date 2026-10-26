#!/usr/bin/env python3
"""Génère les versions /pl/ et /en/ du site à partir des pages françaises.

Utilisation (depuis la racine du dépôt) :
    python3 tools/build_langs.py

Les traductions viennent de js/i18n.js (dictionnaire D) et de tools/meta.json
(titres et descriptions pour Google). Après avoir modifié un texte français,
ajoute sa traduction dans js/i18n.js puis relance ce script.
"""
import json, os, re, sys, copy
from bs4 import BeautifulSoup, NavigableString, Comment

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://gocha-web.com/"
LANGS = ["fr", "pl", "en"]
IDX = {"pl": 0, "en": 1}
LOCALE = {"fr": "fr_FR", "pl": "pl_PL", "en": "en_GB"}
ATTR = ["alt", "aria-label", "title", "placeholder", "data-cap"]
ASSET_DIRS = ("css/", "js/", "images/", "videos/")
OLD_BASES = ["https://20301050.github.io/developpement-web/", "https://gocha-web.com/"]

src = open(os.path.join(ROOT, "js/i18n.js"), encoding="utf-8").read()
a = src.index("var D=") + 6
b = src.index("};\nvar IDX") + 1
D = json.loads(src[a:b])
META = json.load(open(os.path.join(ROOT, "tools/meta.json"), encoding="utf-8"))
R = {}
for k, v in D.items():
    R[v[0]] = k
    R[v[1]] = k

def norm(s):
    return re.sub(r"\s+", " ", s).strip()

def tr(s, lang):
    t = D.get(norm(s))
    return None if t is None else t[IDX[lang]]

def swap(s, lang):
    t = tr(s, lang)
    if t is None:
        return s
    m = re.match(r"^\s*", s).group(0)
    n = re.search(r"\s*$", s).group(0)
    return m + t + n

def tr_title(t, lang):
    w = R.get(t, t)
    w = " · ".join(R.get(p, p) for p in w.split(" · "))
    x = tr(w, lang)
    if x is not None:
        return x
    return " · ".join((tr(p, lang) or p) for p in w.split(" · "))

def page_url(lang, name):
    path = "" if name == "index.html" else name
    return BASE + ("" if lang == "fr" else lang + "/") + path

def pages():
    return sorted(f for f in os.listdir(ROOT) if f.endswith(".html"))

missing = {}

def translate_body(soup, lang, fname):
    for node in soup.body.find_all(string=True):
        if isinstance(node, Comment):
            continue
        p = node.parent
        if p.name in ("script", "style"):
            continue
        if any(("typer" in (x.get("class") or [])) or ("lang" in (x.get("class") or [])) for x in [p] + list(p.parents) if getattr(x, "get", None)):
            continue
        txt = str(node)
        if not norm(txt):
            continue
        new = swap(txt, lang)
        if new == txt and re.search(r"[A-Za-zÀ-ÿ]{3,}", txt):
            missing.setdefault(norm(txt), set()).add(fname)
        if new != txt:
            node.replace_with(NavigableString(new))
    for el in soup.body.find_all(True):
        for at in ATTR:
            v = el.get(at)
            if v and isinstance(v, str):
                el[at] = swap(v, lang)
    # bouton menu (texte initial)
    bg = soup.select_one(".burger")
    if bg and bg.get("aria-label"):
        bg["aria-label"] = swap(bg["aria-label"], lang)

def fix_paths(soup):
    for el in soup.find_all(True):
        for at in ("src", "href", "poster"):
            v = el.get(at)
            if isinstance(v, str) and v.startswith(ASSET_DIRS):
                el[at] = "../" + v
        ss = el.get("srcset")
        if isinstance(ss, str):
            el["srcset"] = ", ".join(("../" + p.strip()) if p.strip().startswith(ASSET_DIRS) else p.strip() for p in ss.split(","))

def set_head(soup, lang, name):
    head = soup.head
    soup.html["lang"] = lang
    # titre
    if lang != "fr" and soup.title and soup.title.string:
        soup.title.string = META.get(name, {}).get(lang, {}).get("title") or tr_title(soup.title.string, lang)
    title = soup.title.string if soup.title else ""
    # description
    desc_tag = head.find("meta", attrs={"name": "description"})
    if lang != "fr" and desc_tag:
        d = META.get(name, {}).get(lang, {}).get("description")
        if d:
            desc_tag["content"] = d
        else:
            print("  ! description non traduite :", lang, name)
    desc = desc_tag["content"] if desc_tag else ""
    for prop, val in (("og:title", title), ("og:description", desc), ("og:url", page_url(lang, name)), ("og:locale", LOCALE[lang])):
        t = head.find("meta", attrs={"property": prop})
        if t:
            t["content"] = val
    for t in head.find_all("meta", attrs={"property": "og:image"}):
        for ob in OLD_BASES:
            t["content"] = t["content"].replace(ob, BASE)
    can = head.find("link", rel="canonical")
    if can:
        can["href"] = page_url(lang, name)
    # hreflang
    for l in head.find_all("link", attrs={"hreflang": True}):
        l.decompose()
    anchor = can or head.find("meta", attrs={"name": "robots"})
    tags = []
    for l2 in LANGS:
        t = soup.new_tag("link", rel="alternate", hreflang=l2, href=page_url(l2, name))
        tags.append(t)
    tags.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=page_url("fr", name)))
    prev = anchor
    for t in tags:
        prev.insert_after(t)
        prev = t
    # JSON-LD
    for s in head.find_all("script", type="application/ld+json"):
        txt = s.string or ""
        for ob in OLD_BASES:
            txt = txt.replace(ob, BASE)
        s.string = txt

def set_switcher(soup, lang, name):
    box = soup.select_one(".lang")
    if not box:
        return
    labels = {"fr": ("FR", "Français"), "pl": ("PL", "Polski"), "en": ("EN", "English")}
    box.clear()
    for l2 in LANGS:
        rel = name if name != "index.html" else "./"
        if lang == "fr":
            href = (l2 + "/" + ("" if name == "index.html" else name)) if l2 != "fr" else rel
        else:
            if l2 == "fr":
                href = "../" + ("" if name == "index.html" else name)
            elif l2 == lang:
                href = rel
            else:
                href = "../" + l2 + "/" + ("" if name == "index.html" else name)
        a = soup.new_tag("a", href=href, hreflang=l2, lang=l2)
        a["data-lang"] = l2
        a["title"] = labels[l2][1]
        if l2 == lang:
            a["aria-current"] = "true"
        a.string = labels[l2][0]
        box.append(a)

def set_scripts(soup):
    for s in soup.find_all("script", src=True):
        if s["src"].endswith("i18n.js"):
            s["src"] = s["src"].replace("i18n.js", "lang.js")

def fix_form(soup, lang):
    nxt = soup.find("input", attrs={"name": "_next"})
    if nxt:
        nxt["value"] = page_url(lang, "merci.html")

def fix_internal_absolute(soup):
    for el in soup.find_all(href=True):
        v = el["href"]
        for ob in OLD_BASES:
            if isinstance(v, str) and v.startswith(ob):
                pass  # liens absolus vers le site : laissés tels quels

def write(soup, path):
    html = str(soup)
    if not html.lstrip().lower().startswith("<!doctype"):
        html = "<!doctype html>\n" + html
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(html)

def main():
    names = pages()
    for name in names:
        raw = open(os.path.join(ROOT, name), encoding="utf-8").read()
        base_soup = BeautifulSoup(raw, "html.parser")
        set_scripts(base_soup)
        # français (racine)
        fr = copy.copy(base_soup)
        set_head(fr, "fr", name)
        set_switcher(fr, "fr", name)
        fix_form(fr, "fr")
        write(fr, os.path.join(ROOT, name))
        for lang in ("pl", "en"):
            s = BeautifulSoup(raw, "html.parser")
            set_scripts(s)
            translate_body(s, lang, name)
            fix_paths(s)
            set_head(s, lang, name)
            set_switcher(s, lang, name)
            fix_form(s, lang)
            write(s, os.path.join(ROOT, lang, name))
    # sitemap
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for name in names:
        if name == "merci.html":
            continue
        for lang in LANGS:
            lines.append("  <url><loc>%s</loc>" % page_url(lang, name))
            for l2 in LANGS:
                lines.append('    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (l2, page_url(l2, name)))
            lines.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % page_url("fr", name))
            lines.append("  </url>")
    lines.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write("User-agent: *\nAllow: /\n\nSitemap: %ssitemap.xml\n" % BASE)
    if missing:
        print("Textes sans traduction (%d) :" % len(missing))
        for k, v in sorted(missing.items()):
            print("  -", k[:90], "|", ",".join(sorted(v))[:60])

if __name__ == "__main__":
    main()
