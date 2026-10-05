#!/usr/bin/env python3
"""Build a provider-neutral static release in dist/ from PUBLIC_SITE_URL."""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from html import escape, unescape
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
ASSETS = ROOT / "assets"


def load_local_env() -> None:
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for raw in env_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def route_for_index(relative: str) -> str:
    if relative == "index.html":
        return "/"
    return "/" + relative.removesuffix("index.html")


def organization_schema(public_url: str) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SPM Interiors Design",
        "url": public_url,
        "logo": f"{public_url}/assets/mark.svg",
        "description": "Thoughtful home interior design for Bangalore and South India.",
    }
    payload = json.dumps(schema, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return f'<script type="application/ld+json">{payload}</script>'


def make_404() -> str:
    return '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,follow"><meta name="description" content="The page could not be found. Explore SPM Interiors Design.">
<meta property="og:type" content="website"><meta property="og:site_name" content="SPM Interiors Design">
<title>Page not found | SPM Interiors Design</title><link rel="stylesheet" href="/styles.css"><link rel="icon" href="/assets/mark.svg" type="image/svg+xml"></head>
<body class="page-inner"><header class="site-header"><div class="header-inner"><a class="brand" href="/" aria-label="SPM Interiors Design home"><span class="brand-main">SPM</span><span class="brand-sub">INTERIORS DESIGN</span></a><a class="header-cta" href="/consultation/">Book a consultation <span aria-hidden="true">↗</span></a></div></header>
<main id="main" class="legal-page wrap"><div class="legal-heading"><p class="eyebrow">SPM INTERIORS DESIGN / 404</p><h1>That page isn’t <em>here.</em></h1></div><div class="legal-copy"><p class="hero-lede">The address may have changed, or the page may no longer exist.</p><p><a class="button button-dark" href="/">Return to the homepage <span aria-hidden="true">↗</span></a></p><p><a class="text-link" href="/projects/">Explore design concepts <span aria-hidden="true">↗</span></a></p></div></main></body></html>\n'''


def copy_production_assets() -> None:
    destination = DIST / "assets"
    destination.mkdir(parents=True, exist_ok=True)
    for item in ASSETS.iterdir():
        if item.is_dir():
            # High-resolution generation originals are kept in the project source, not duplicated in the deploy payload.
            continue
        if "unsplash" in item.name.lower() or "diptych" in item.name.lower():
            continue
        if item.suffix.lower() not in {".webp", ".svg", ".mp4"}:
            continue
        shutil.copy2(item, destination / item.name)


def main() -> None:
    load_local_env()
    public_url = os.environ.get("PUBLIC_SITE_URL", "").strip().rstrip("/")
    parsed = urlsplit(public_url)
    if parsed.scheme != "https" or not parsed.netloc or parsed.path not in ("", "/") or parsed.query or parsed.fragment:
        raise SystemExit("Set PUBLIC_SITE_URL to the production HTTPS origin, such as https://spminteriorsdesign.com")

    subprocess.run([sys.executable, str(ROOT / "prepare_assets.py")], cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(ROOT / "build_site.py")], cwd=ROOT, check=True)

    if DIST.exists():
        if DIST.resolve() != (ROOT / "dist").resolve():
            raise SystemExit("Refusing to clean an unexpected output directory")
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    sources = sorted(
        path for path in ROOT.rglob("index.html")
        if DIST not in path.parents and "__pycache__" not in path.parts and "assets" not in path.parts
    )
    routes: list[str] = []
    for source in sources:
        relative = source.relative_to(ROOT).as_posix()
        route = route_for_index(relative)
        routes.append(route)
        html = source.read_text(encoding="utf-8")
        canonical = f"{public_url}{route}"
        og_image = f"{public_url}/assets/spm-hero-bangalore.webp"
        title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        description_match = re.search(r'<meta name="description" content="([^"]*)"', html, re.IGNORECASE)
        social_title = unescape(title_match.group(1)).strip() if title_match else "SPM Interiors Design"
        social_description = unescape(description_match.group(1)).strip() if description_match else "Thoughtful home interiors for Bangalore and South India."
        metadata = (
            f'<link rel="canonical" href="{escape(canonical, quote=True)}">\n'
            f'<meta property="og:url" content="{escape(canonical, quote=True)}">\n'
            f'<meta property="og:image" content="{escape(og_image, quote=True)}">\n'
            f'<meta property="og:image:alt" content="Warm contemporary South Indian home interior concept by SPM Interiors Design">\n'
            f'<meta property="og:image:type" content="image/webp">\n'
            f'<meta name="twitter:title" content="{escape(social_title, quote=True)}">\n'
            f'<meta name="twitter:description" content="{escape(social_description, quote=True)}">\n'
            f'<meta name="twitter:image" content="{escape(og_image, quote=True)}">\n'
        )
        html = html.replace("<!-- ORGANIZATION_SCHEMA -->", organization_schema(public_url) if relative == "index.html" else "", 1)
        html = html.replace("</head>", metadata + "</head>", 1)
        html = re.sub(r'\.jpg(?=["\s])', '.webp', html)
        target = DIST / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding="utf-8")

    (DIST / "404.html").write_text(make_404(), encoding="utf-8")
    copy_production_assets()
    shutil.copy2(ROOT / "styles.css", DIST / "styles.css")
    shutil.copy2(ROOT / "app.js", DIST / "app.js")

    entries = "\n".join(f"  <url><loc>{escape(public_url + route)}</loc></url>" for route in routes)
    sitemap = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{entries}\n</urlset>\n'
    (DIST / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {public_url}/sitemap.xml\n", encoding="utf-8")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

    print(f"Built {len(routes)} indexable HTML routes plus 404.html in {DIST}")
    print(f"Canonical origin: {public_url}")
    print(f"Public contact configured: {bool(os.environ.get('PUBLIC_CONTACT_EMAIL') or os.environ.get('PUBLIC_CONTACT_PHONE') or os.environ.get('PUBLIC_WHATSAPP_NUMBER'))}")
    print(f"Lead endpoint configured: {bool(os.environ.get('PUBLIC_LEAD_ENDPOINT'))}")


if __name__ == "__main__":
    main()
