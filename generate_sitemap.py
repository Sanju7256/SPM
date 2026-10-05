#!/usr/bin/env python3
"""Generate sitemap.xml using a real public origin, e.g. python3 generate_sitemap.py https://www.example.com"""
from pathlib import Path
from urllib.parse import urljoin
from html import escape
import sys

ROOT = Path(__file__).resolve().parent
if len(sys.argv) != 2 or not sys.argv[1].startswith(("https://", "http://")):
    raise SystemExit("Usage: python3 generate_sitemap.py https://your-real-domain.example")
origin = sys.argv[1].rstrip("/") + "/"
routes = ["", "about/", "services/", "services/complete-home-interiors/", "services/modular-kitchens/", "services/living-rooms/", "services/bedrooms/", "services/wardrobes/", "services/lighting-false-ceiling/", "services/bathrooms/", "services/custom-furniture/", "projects/", "projects/the-still-house/", "projects/courtyard-light/", "projects/earth-and-line/", "projects/canopy-house/", "contact/", "consultation/", "privacy/", "terms/"]
urls = "\n".join(f"  <url><loc>{escape(urljoin(origin, route))}</loc></url>" for route in routes)
xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n'
(ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")
robots = f"User-agent: *\nAllow: /\nSitemap: {urljoin(origin, 'sitemap.xml')}\n"
(ROOT / "robots.txt").write_text(robots, encoding="utf-8")
print(f"Generated sitemap.xml and robots.txt for {origin}")
