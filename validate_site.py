#!/usr/bin/env python3
"""Validate the generated production site before publishing."""
from __future__ import annotations

from html.parser import HTMLParser
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit
import os
import re
import sys

ROOT = Path(__file__).resolve().parent
# SITE_DIST optionally points the checks at another build folder.
DIST = Path(os.environ["SITE_DIST"]).resolve() if os.environ.get("SITE_DIST") else ROOT / "dist"
EXPECTED_ORIGIN = "https://spminteriorsdesign.com"


class PageAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.in_title = False
        self.h1_count = 0
        self.ids: set[str] = set()
        self.duplicate_ids: set[str] = set()
        self.images: list[str] = []
        self.missing_alt: list[str] = []
        self.media: list[str] = []
        self.videos: list[dict[str, str | None]] = []
        self.links: list[str] = []
        self.scripts: list[str] = []
        self.meta: dict[str, str] = {}
        self.canonical: str | None = None
        self.org_schema = False
        self.noindex = False
        self.in_h1 = False
        self.h1_text = ""
        self.form_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1
            self.in_h1 = True
            self.h1_text = ""
        if "id" in values and values["id"]:
            if values["id"] in self.ids:
                self.duplicate_ids.add(values["id"])
            self.ids.add(values["id"])
        if tag == "img":
            if values.get("src"):
                self.images.append(values["src"])
            if "alt" not in values:
                self.missing_alt.append(values.get("src") or "(image without src)")
        if tag == "video":
            self.videos.append(values)
            if values.get("src"):
                self.media.append(values["src"])
        if tag == "source" and values.get("src"):
            self.media.append(values["src"])
        if tag in {"a", "link"} and values.get("href"):
            self.links.append(values["href"])
        if tag == "script" and values.get("src"):
            self.scripts.append(values["src"])
        if tag == "meta":
            key = values.get("name") or values.get("property") or ""
            if key:
                self.meta[key] = values.get("content") or ""
        if tag == "link" and "canonical" in (values.get("rel") or ""):
            self.canonical = values.get("href")
        if tag == "script" and values.get("type") == "application/ld+json":
            self.org_schema = True
        if tag == "form":
            self.form_count += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag == "h1":
            self.in_h1 = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.h1_text += data


def route_file(path: str) -> Path | None:
    parsed = urlsplit(path)
    if parsed.scheme or parsed.netloc or not parsed.path.startswith("/"):
        return None
    route_path = parsed.path.lstrip("/")
    target = DIST / route_path
    if not route_path or parsed.path.endswith("/"):
        target = target / "index.html"
    elif target.is_dir():
        target = target / "index.html"
    return target


def main() -> None:
    if not DIST.is_dir():
        raise SystemExit("dist/ does not exist; run `npm run build` first.")
    pages = sorted(DIST.rglob("*.html"))
    errors: list[str] = []
    route_pages = [p for p in pages if p.name != "404.html"]
    if len(route_pages) != 29:
        errors.append(f"Expected 29 static routes, found {len(route_pages)}.")

    for file in pages:
        parser = PageAudit()
        text = file.read_text(encoding="utf-8")
        parser.feed(text)
        relative = file.relative_to(DIST).as_posix()
        if file.name != "404.html":
            if not parser.title or "SPM Interiors Design" not in parser.title:
                errors.append(f"{relative}: missing branded page title.")
            if len(parser.meta.get("description", "")) < 60:
                errors.append(f"{relative}: missing or short meta description.")
            if parser.h1_count != 1:
                errors.append(f"{relative}: expected one H1, found {parser.h1_count}.")
            if not parser.canonical or not parser.canonical.startswith(EXPECTED_ORIGIN):
                errors.append(f"{relative}: canonical URL missing or not on the requested production origin.")
            if not parser.meta.get("og:image") or not parser.meta.get("og:title") or not parser.meta.get("og:description"):
                errors.append(f"{relative}: incomplete Open Graph metadata.")
            if not parser.meta.get("twitter:title") or not parser.meta.get("twitter:description") or not parser.meta.get("twitter:image"):
                errors.append(f"{relative}: incomplete Twitter card metadata.")
        elif parser.meta.get("robots") != "noindex,follow":
            errors.append("404.html: expected noindex,follow.")
        if parser.duplicate_ids:
            errors.append(f"{relative}: duplicate IDs {sorted(parser.duplicate_ids)}.")
        if parser.missing_alt:
            errors.append(f"{relative}: images without alt attributes {parser.missing_alt}.")

        for image in parser.images:
            path = route_file(image)
            if path and not path.exists():
                errors.append(f"{relative}: missing image asset {image}.")
        for media in parser.media:
            path = route_file(media)
            if path and not path.exists():
                errors.append(f"{relative}: missing media asset {media}.")
        for script in parser.scripts:
            path = route_file(script)
            if path and not path.exists():
                errors.append(f"{relative}: missing script {script}.")
        for link in parser.links:
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc or not parsed.path.startswith("/"):
                continue
            target = route_file(link)
            if target and not target.exists():
                errors.append(f"{relative}: broken internal link {link}.")
            elif target and parsed.fragment and target.suffix == ".html":
                target_parser = PageAudit()
                target_parser.feed(target.read_text(encoding="utf-8"))
                if parsed.fragment not in target_parser.ids:
                    errors.append(f"{relative}: missing internal anchor {link}.")

    sitemap = DIST / "sitemap.xml"
    robots = DIST / "robots.txt"
    if not sitemap.exists() or sitemap.read_text(encoding="utf-8").count("<loc>") != len(route_pages):
        errors.append("sitemap.xml is missing or does not match the static route count.")
    elif EXPECTED_ORIGIN not in sitemap.read_text(encoding="utf-8"):
        errors.append("sitemap.xml does not use the requested canonical origin.")
    if not robots.exists() or f"Sitemap: {EXPECTED_ORIGIN}/sitemap.xml" not in robots.read_text(encoding="utf-8"):
        errors.append("robots.txt does not point to the canonical sitemap.")
    if not any((DIST / "static").glob("*.js")) or not any((DIST / "static").glob("*.css")):
        errors.append("Missing hashed JavaScript/CSS bundles in static/.")
    for asset in ("assets/mark.svg", "assets/spm-hero-bangalore.webp", "assets/interiorsvideo-poster.webp", "assets/interiorsvideo.mp4", "404.html"):
        if not (DIST / asset).exists():
            errors.append(f"Missing required production output: {asset}.")
    html_assets = set(re.findall(r"/assets/([^\"'\s<>]+\.webp)", "\n".join(p.read_text(encoding="utf-8") for p in pages)))
    for asset in html_assets:
        if not (DIST / "assets" / asset).exists():
            errors.append(f"Missing referenced production WebP asset: {asset}.")
    consultation = (DIST / "consultation" / "index.html").read_text(encoding="utf-8")
    for field in ("name", "phone", "email", "location", "service", "property_type", "home_size", "bedrooms", "budget", "style", "contact_time", "timeline", "message"):
        if f'name="{field}"' not in consultation:
            errors.append(f"Consultation page is missing the requested form field: {field}.")
    for label in ("Home Interiors", "Commercial Interiors", "Office Interiors", "Office Furniture", "Space-Saving Interiors", "Modular Kitchen", "Bedroom", "Living Room", "Wardrobe", "Custom Furniture", "Other"):
        if f">{label}</option>" not in consultation:
            errors.append(f"Consultation form is missing the service option: {label}.")
    for budget in ("Under ₹5 Lakhs", "₹5–10 Lakhs", "₹10–15 Lakhs", "₹15–20 Lakhs", "₹20 Lakhs+"):
        if budget not in unescape(consultation):
            errors.append(f"Consultation form is missing the INR budget choice: {budget}.")
    if "That page isn’t" not in (DIST / "404.html").read_text(encoding="utf-8"):
        errors.append("The custom 404 page content is missing.")

    visible_text = "\n".join(p.read_text(encoding="utf-8") for p in pages).lower()
    if not re.search(r"\bconcept study\b", visible_text) or not re.search(r"illustrative", visible_text):
        errors.append("Project concept disclosure is missing from production HTML.")
    if "localbusiness" in visible_text:
        errors.append("LocalBusiness/NAP structured data must wait for verified address/contact details.")
    home = (DIST / "index.html").read_text(encoding="utf-8")
    if '"@type":"Organization"' not in home:
        errors.append("Homepage Organization structured data is missing.")
    home_audit = PageAudit()
    home_audit.feed(home)
    expected_contact_meta = {
        "spm-contact-phone": "+91 9345633674,+91 7975049950",
        "spm-contact-email": "spminteriordesigns@gmail.com",
        "spm-whatsapp": "919345633674",
        "spm-office-address": "Chandapur, Bangalore-560099",
        "spm-instagram-url": "https://www.instagram.com/spm_interior_designs/",
    }
    for key, value in expected_contact_meta.items():
        if home_audit.meta.get(key) != value:
            errors.append(f"Homepage public contact metadata is missing or wrong for {key}.")
    stats_html = unescape(home).lower()
    for disclosure in ("illustrative placeholders", "not verified spm data"):
        if disclosure not in stats_html:
            errors.append(f"Homepage trust statistics are missing the disclosure: {disclosure}.")
    metric_values = re.findall(r'data-metric-value="([^"]+)"', home)
    if metric_values != ["500", "3", "7", "4.9"]:
        errors.append(f"Homepage does not contain the four configured placeholder metrics: {metric_values}.")
    service_pages = {
        "commercial-interiors": ("Commercial Interior Designers in Bangalore | SPM Interiors Design", ["Retail Interiors", "Showrooms", "Restaurants & Cafés", "Corporate Spaces", "Reception Areas", "Commercial Space Planning", "Custom Fixtures", "Lighting Design", "Turnkey Execution"]),
        "office-furniture": ("Office Furniture & Workstations in Bangalore | SPM Interiors Design", ["Office Workstations", "Modular Workstations", "Executive Desks", "Manager Tables", "Reception Desks", "Conference Tables", "Office Chairs", "Storage Units", "Filing Cabinets", "Pedestal Units", "Meeting Room Furniture", "Custom Office Furniture"]),
        "space-saving-interiors": ("Space-Saving Interiors in Bangalore | SPM Interiors Design", ["Compact Home Interiors", "Smart Storage Solutions", "Multi-Functional Furniture", "Foldable Furniture", "Convertible Furniture", "Space-Saving Wardrobes", "Compact Modular Kitchens", "Vertical Storage", "Custom Built-In Furniture", "Optimized Space Planning"]),
    }
    expected_service_images = {
        "commercial-interiors": "service-commercial.webp",
        "office-furniture": "service-office-furniture.webp",
        "space-saving-interiors": "service-space-saving.webp",
    }
    seo_titles: set[str] = set()
    for slug, (expected_title, required_terms) in service_pages.items():
        service_file = DIST / "services" / slug / "index.html"
        if not service_file.exists():
            errors.append(f"Missing dedicated service route: /services/{slug}/")
            continue
        service_html = service_file.read_text(encoding="utf-8")
        service_audit = PageAudit()
        service_audit.feed(service_html)
        if service_audit.title != expected_title:
            errors.append(f"/services/{slug}/ title is missing or not unique: {service_audit.title}")
        seo_titles.add(service_audit.title)
        if len(service_audit.meta.get("description", "")) < 90:
            errors.append(f"/services/{slug}/ needs a substantial service-specific meta description.")
        if f"/assets/{expected_service_images[slug]}" not in service_html:
            errors.append(f"/services/{slug}/ is missing its dedicated original service photograph.")
        plain_service = unescape(service_html).lower()
        for term in required_terms:
            if term.lower() not in plain_service:
                errors.append(f"/services/{slug}/ is missing required service detail: {term}.")
    if len(seo_titles) != 3:
        errors.append("The three new service pages do not have distinct SEO titles.")
    services_index = (DIST / "services" / "index.html").read_text(encoding="utf-8")
    if "/assets/service-commercial.webp" not in services_index:
        errors.append("The mixed services landing page is missing its commercial-specific hero image.")
    if len(home_audit.videos) != 1:
        errors.append(f"Homepage should contain one sample video, found {len(home_audit.videos)}.")
    else:
        video = home_audit.videos[0]
        for attr in ("controls", "playsinline"):
            if attr not in video:
                errors.append(f"Homepage video is missing the {attr} attribute.")
        if "autoplay" in video:
            errors.append("Homepage video must not autoplay.")
        if video.get("preload") != "metadata":
            errors.append("Homepage video should load metadata only before visitor interaction.")
        poster = route_file(video.get("poster") or "")
        if not poster or not poster.exists():
            errors.append("Homepage sample video poster is missing.")
    if errors:
        print("PRODUCTION VALIDATION FAILED:")
        print("\n".join(f"- {item}" for item in errors))
        raise SystemExit(1)
    print(f"PASS: {len(route_pages)} routes, SEO/OG metadata, sitemap/robots, links, images, Organization schema and concept-integrity checks.")
    print("PASS: all production image URLs resolve; provided contact settings, service details and explicitly disclosed sample metrics are present.")


if __name__ == "__main__":
    main()
