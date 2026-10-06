#!/usr/bin/env python3
"""Render the SPM Interiors Design static website from content/site.json."""
from __future__ import annotations

import json
import os
import shutil
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ASSETS = "/assets/"
CONTENT = json.loads((ROOT / "content" / "site.json").read_text(encoding="utf-8"))


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


load_local_env()


def public_value(name: str) -> str:
    return os.environ.get(name, "").strip()


ICON_PATHS = {
    "arrow": '<path d="M7 17 17 7M8 7h9v9"/>',
    "chevron": '<path d="m6 9 6 6 6-6"/>',
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "chat": '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    "instagram": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    "facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    "youtube": '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54z"/>',
}

WHATSAPP_GLYPH = '<svg class="icon icon-whatsapp" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>'


def icon(name: str) -> str:
    return f'<svg class="icon icon-{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{ICON_PATHS[name]}</svg>'


def whatsapp_url() -> str:
    number = "".join(ch for ch in public_value("PUBLIC_WHATSAPP_NUMBER") if ch.isdigit())
    if not 8 <= len(number) <= 15:
        return ""
    return f"https://wa.me/{number}?text=Hello%20SPM%20Interiors%20Design%2C%20I%20would%20like%20to%20discuss%20my%20interior%20project."


def logo(light: bool = False) -> str:
    theme = " brand-light" if light else ""
    return f'<a class="brand{theme}" href="/" aria-label="SPM Interiors Design home"><span class="brand-main">SPM</span><span class="brand-sub">Interiors Design</span></a>'


NAV_ITEMS = [
    ("Home", "/"), ("About", "/about/"), ("Services", "/services/"),
    ("Projects", "/projects/"), ("Process", "/process/"),
    ("Blog", "/journal/"), ("Contact", "/contact/"),
]


SERVICE_NAV_GROUPS = [
    ("Residential", [
        ("Complete Home Interiors", "/services/complete-home-interiors/"),
        ("Modular Kitchens", "/services/modular-kitchens/"),
        ("Living Room", "/services/living-rooms/"),
        ("Bedroom", "/services/bedrooms/"),
        ("Wardrobes", "/services/wardrobes-storage/"),
        ("Bathroom Interiors", "/services/bathrooms/"),
        ("False Ceiling & Lighting", "/services/lighting-ceilings/"),
        ("Custom Furniture", "/services/custom-furniture/"),
        ("Space-Saving Interiors", "/services/space-saving-interiors/"),
    ]),
    ("Commercial", [
        ("Commercial Interiors", "/services/commercial-interiors/"),
        ("Office Interiors", "/services/commercial-interiors/#office-interiors"),
        ("Office Furniture", "/services/office-furniture/"),
        ("Retail & Showrooms", "/services/commercial-interiors/#retail-showrooms"),
        ("Restaurants & Cafés", "/services/commercial-interiors/#restaurants-cafes"),
    ]),
]


def services_menu(mobile: bool = False) -> str:
    groups = "".join(
        f'<nav class="nav-services-group" aria-label="{escape(group)} services"><h3>{escape(group)}</h3>' +
        "".join(f'<a data-nav-link href="{escape(href, quote=True)}">{escape(label)}</a>' for label, href in items) +
        "</nav>"
        for group, items in SERVICE_NAV_GROUPS
    )
    expanded = " open" if mobile else ""
    return f'<details class="services-dropdown"{expanded}><summary class="services-trigger">Services {icon("chevron")}</summary><div class="nav-services-menu"><a class="nav-services-all" data-nav-link href="/services/">All services <span aria-hidden="true">↗</span></a><div class="nav-services-groups">{groups}</div></div></details>'


def nav_links(mobile: bool = False) -> str:
    links = []
    for label, href in NAV_ITEMS:
        if label == "Services":
            links.append(services_menu(mobile))
        else:
            links.append(f'<a data-nav-link href="{href}">{escape(label)}</a>')
    return "".join(links)


def header(home: bool = False) -> str:
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header{' is-over-hero' if home else ''}" data-header>
  <div class="header-inner">{logo()}
    <nav class="primary-nav" aria-label="Primary navigation">{nav_links()}</nav>
    <div class="header-actions">
      <a class="header-cta" href="/consultation/">Book a consultation <span aria-hidden="true">↗</span></a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span class="menu-toggle-label">Menu</span><span class="menu-toggle-lines" aria-hidden="true"><span></span><span></span></span></button>
    </div>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" data-lenis-prevent hidden><div class="mobile-nav-inner"><div class="mobile-nav-links">{nav_links(True)}</div><div class="mobile-nav-footer"><a class="mobile-nav-cta" href="/consultation/">Book a consultation <span aria-hidden="true">↗</span></a><div class="mobile-nav-contact"><a data-whatsapp-link href="#" hidden>{WHATSAPP_GLYPH}<span>WhatsApp</span></a><a data-email-link href="#" hidden></a></div></div></div></nav>'''


def social_item(platform: str, label: str) -> str:
    return (f'<a class="social-chip" data-social-link="{platform}" href="#" target="_blank" rel="noopener noreferrer" aria-label="SPM Interiors Design on {label}" hidden>{icon(platform)}</a>'
            f'<span class="social-chip is-pending" data-social-pending="{platform}" title="{label} profile to be confirmed">{icon(platform)}<span class="sr-only">{label} profile to be confirmed</span></span>')


def footer() -> str:
    wa_url = whatsapp_url()
    wa_attrs = f'href="{escape(wa_url, quote=True)}" target="_blank" rel="noopener noreferrer"' if wa_url else 'href="#" hidden'
    return f'''<footer class="site-footer">
  <div class="footer-main wrap">
    <div class="footer-brand">{logo(True)}<p>Thoughtful, functional interiors for homes and workplaces across Bangalore and South India.</p>
      <section class="footer-social-block" aria-labelledby="footer-social-heading"><h3 id="footer-social-heading" class="sr-only">Social</h3><nav class="footer-social-list" aria-label="Social media">{social_item("instagram", "Instagram")}{social_item("facebook", "Facebook")}{social_item("youtube", "YouTube")}</nav></section>
      <a class="button button-accent footer-start" href="/consultation/">Book a consultation <span aria-hidden="true">↗</span></a>
    </div>
    <nav class="footer-column footer-primary-nav" aria-label="Footer navigation"><h3>Explore</h3><a href="/">Home</a><a href="/about/">About</a><a href="/services/">Services</a><a href="/projects/">Projects</a><a href="/process/">Process</a><a href="/journal/">Blog</a><a href="/contact/">Contact</a></nav>
    <nav class="footer-column footer-services-nav" aria-label="Interior design services"><h3>Services</h3><a href="/services/complete-home-interiors/">Home Interiors</a><a href="/services/modular-kitchens/">Kitchens</a><a href="/services/living-rooms/">Living Rooms</a><a href="/services/bedrooms/">Bedrooms</a><a href="/services/wardrobes-storage/">Wardrobes</a><a href="/services/custom-furniture/">Custom Furniture</a></nav>
    <section class="footer-column footer-contact-block" aria-labelledby="footer-contact-heading"><h3 id="footer-contact-heading">Contact</h3><div class="footer-contact-list">
      <div class="footer-contact-row">{icon("phone")}<div><span class="footer-contact-label">Phone</span><div class="footer-phone-links" data-phone-links hidden></div><span class="footer-pending" data-phone-pending>Details to be confirmed</span></div></div>
      <div class="footer-contact-row">{icon("chat")}<div><span class="footer-contact-label">WhatsApp</span><a data-wa-link href="#" hidden>Message the studio <span aria-hidden="true">↗</span></a><span class="footer-pending" data-whatsapp-pending>Number to be confirmed</span></div></div>
      <div class="footer-contact-row">{icon("mail")}<div><span class="footer-contact-label">Email</span><a data-email-link href="#" hidden></a><span class="footer-pending" data-email-pending>Details to be confirmed</span></div></div>
      <div class="footer-contact-row">{icon("pin")}<div><span class="footer-contact-label">Office</span><span data-office-address hidden></span><span class="footer-pending" data-office-pending>Office details to be confirmed</span></div></div>
    </div></section>
  </div>
  <div class="footer-bottom wrap"><p class="footer-copyright">© <span data-year>2026</span> SPM Interiors Design. All Rights Reserved.</p><nav class="footer-legal" aria-label="Legal information"><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms &amp; Conditions</a></nav></div>
  <p class="footer-demo-note wrap">Concept imagery is illustrative. The trust figures are visibly marked as unverified placeholders; do not treat them as SPM results until confirmed. Testimonials and other claims require approval.</p>
  <div class="footer-wordmark" aria-hidden="true"><span>SPM Interiors</span></div>
</footer>
<a class="whatsapp-float" data-whatsapp-link {wa_attrs} aria-label="Chat with SPM Interiors Design on WhatsApp"><span class="whatsapp-float-icon">{WHATSAPP_GLYPH}</span><span class="whatsapp-float-label">Chat with us</span></a>
<div class="mobile-quick-cta"><a href="/consultation/">Book a consultation <span aria-hidden="true">↗</span></a></div>'''


def page(title: str, description: str, content: str, active: str = "", home: bool = False,
         keywords: str = "interior designers in Bangalore, home interiors Bangalore, South Indian interior design") -> str:
    html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <script>(function(d){{d.classList.add('js');if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){{d.classList.add('motion');setTimeout(function(){{if(!d.classList.contains('motion-ready'))d.classList.remove('motion');}},3500);}}}})(document.documentElement);</script>
  <meta name="theme-color" content="#F7F3EC"><meta name="description" content="{escape(description, quote=True)}">
  <meta name="keywords" content="{escape(keywords, quote=True)}"><meta property="og:type" content="website">
  <meta property="og:site_name" content="SPM Interiors Design"><meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="spm-whatsapp" content="{escape(public_value('PUBLIC_WHATSAPP_NUMBER'), quote=True)}"><meta name="spm-contact-email" content="{escape(public_value('PUBLIC_CONTACT_EMAIL'), quote=True)}"><meta name="spm-contact-phone" content="{escape(public_value('PUBLIC_CONTACT_PHONE'), quote=True)}"><meta name="spm-office-address" content="{escape(public_value('PUBLIC_OFFICE_ADDRESS'), quote=True)}"><meta name="spm-instagram-url" content="{escape(public_value('PUBLIC_INSTAGRAM_URL'), quote=True)}"><meta name="spm-facebook-url" content="{escape(public_value('PUBLIC_FACEBOOK_URL'), quote=True)}"><meta name="spm-youtube-url" content="{escape(public_value('PUBLIC_YOUTUBE_URL'), quote=True)}"><meta name="spm-lead-endpoint" content="{escape(public_value('PUBLIC_LEAD_ENDPOINT'), quote=True)}">
  <title>{escape(title)}</title>
  <link rel="icon" href="/assets/mark.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500&family=Manrope:wght@400..700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css"><!-- ORGANIZATION_SCHEMA -->
</head>
<body class="{'page-home' if home else 'page-inner'}" data-active="{escape(active)}">
{header(home)}
<main id="main">{content}</main>
{footer()}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js" defer></script>
<script src="/app.js" defer></script>
</body></html>'''
    # Text arrows render inconsistently across platforms; swap them for one crisp inline icon.
    return html.replace("↗", icon("arrow"))


def eyebrow(text: str, number: str = "") -> str:
    index = f'<span class="eyebrow-number">{escape(number)}</span>' if number else ""
    return f'<p class="eyebrow">{index}{escape(text)}</p>'


def breadcrumbs(items: list[tuple[str, str | None]]) -> str:
    parts = ['<nav class="breadcrumbs wrap" aria-label="Breadcrumb"><a href="/">Home</a>']
    for label, href in items:
        parts.append(f'<span aria-hidden="true">/</span>')
        parts.append(f'<a href="{escape(href)}">{escape(label)}</a>' if href else f'<span aria-current="page">{escape(label)}</span>')
    parts.append('</nav>')
    return "".join(parts)


def button(text: str, href: str, kind: str = "button-dark") -> str:
    return f'<a class="button {kind}" href="{escape(href)}">{escape(text)} <span aria-hidden="true">↗</span></a>'


def cta_band(kicker: str, title: str, copy: str, label: str = "Book a consultation") -> str:
    return f'''<section class="cta-band"><div class="cta-inner wrap" data-reveal>{eyebrow(kicker)}<h2>{title}</h2><p>{escape(copy)}</p><div class="cta-actions">{button(label, '/consultation/', 'button-dark')}</div></div></section>'''


def stat_value(name: str, label: str, suffix: str = "") -> str:
    raw = public_value(name)
    verified = public_value("PUBLIC_STATS_VERIFIED").lower() in {"1", "true", "yes"}
    if raw:
        value = escape(raw)
        if suffix and not value.endswith(suffix):
            value += escape(suffix)
        note = "Verified studio figure" if verified else "Illustrative placeholder — not verified"
    else:
        value = "—"
        note = "Awaiting verified SPM data"
    metric_attributes = f' data-metric-value="{escape(raw, quote=True)}" data-metric-suffix="{escape(suffix, quote=True)}"' if raw and raw.replace(".", "", 1).isdigit() else ""
    return f'<div class="metric"><strong{metric_attributes}>{value}</strong><span>{escape(label)}</span><small>{note}</small></div>'


def stats_band() -> str:
    verified = public_value("PUBLIC_STATS_VERIFIED").lower() in {"1", "true", "yes"}
    if verified:
        status = "SPM-supplied statistics"
        disclosure = "Figures marked as verified were supplied and approved by SPM."
    else:
        status = "Trust statistics / illustrative placeholders"
        disclosure = "ILLUSTRATIVE PLACEHOLDERS — not verified SPM data. Replace with confirmed figures before making public claims."
    return f'''<section class="metrics-band" aria-label="{escape(status)}"><p class="metrics-status">{escape(status)}</p><div class="metrics-grid wrap">{stat_value('PUBLIC_HOMES_DESIGNED','Homes designed','+')}{stat_value('PUBLIC_YEARS_EXPERIENCE','Years experience','+')}{stat_value('PUBLIC_DESIGN_TEAM','Design professionals','+')}{stat_value('PUBLIC_CLIENT_RATING','Customer rating','/5')}</div><p class="metrics-note">{escape(disclosure)}</p></section>'''


def service_card(item: dict, index: int) -> str:
    slug = escape(item["slug"])
    return f'''<article class="service-card" data-reveal data-cursor="EXPLORE"><a class="service-card-image" href="/services/{slug}/"><img src="{ASSETS}{escape(item['image'])}" alt="{escape(item['alt'], quote=True)}" loading="lazy"><span class="image-count">0{index + 1}</span><span class="service-hover-mark" aria-hidden="true">↗</span></a><div class="service-card-copy"><span class="service-category">{escape(item['category'].replace('-', ' '))}</span><h3><a href="/services/{slug}/">{escape(item['title'])}</a></h3><p>{escape(item['short'])}</p></div></article>'''


def project_card(item: dict, index: int) -> str:
    slug = escape(item["slug"])
    return f'''<article class="project-card" data-tags="{escape(item['category'])}" data-reveal data-cursor="EXPLORE"><a class="project-card-image" href="/projects/{slug}/"><img src="{ASSETS}{escape(item['image'])}" alt="{escape(item['alt'], quote=True)}" loading="lazy"><span class="project-status">Concept study</span><span class="project-overlay" aria-hidden="true"><strong>{escape(item['name'])}</strong><span>{escape(item['location'])}</span><span>Explore ↗</span></span><span class="project-open" aria-hidden="true">↗</span></a><div class="project-meta"><div><span class="project-kicker">0{index + 1} / {escape(item['typology'])}</span><h3><a href="/projects/{slug}/">{escape(item['name'])}</a></h3><p>{escape(item['location'])}</p></div><span class="project-style">{escape(item['style'])}</span></div></article>'''


def article_card(item: dict, index: int) -> str:
    slug = escape(item["slug"])
    return f'''<article class="journal-card" data-reveal><a class="journal-card-image" href="/journal/{slug}/"><img src="{ASSETS}{escape(item['image'])}" alt="{escape(item['alt'], quote=True)}" loading="lazy"><span aria-hidden="true">↗</span></a><div class="journal-meta"><span>{escape(item['category'])}</span><span>{escape(item['read_time'])}</span></div><h3><a href="/journal/{slug}/">{escape(item['title'])}</a></h3><p>{escape(item['excerpt'])}</p><a class="text-link" href="/journal/{slug}/">Read the article <span aria-hidden="true">↗</span></a></article>'''


def compare_slider(before: str, after: str, title: str, before_alt: str, after_alt: str, section_id: str = "") -> str:
    return f'''<div class="compare-slider" data-compare style="--split:50%" {f'id="{escape(section_id)}"' if section_id else ''}>
  <div class="compare-side compare-before"><img src="{ASSETS}{escape(before)}" alt="{escape(before_alt, quote=True)}" loading="lazy"><span class="compare-label">Before</span></div>
  <div class="compare-side compare-after"><img src="{ASSETS}{escape(after)}" alt="{escape(after_alt, quote=True)}" loading="lazy"><span class="compare-label">After</span></div>
  <span class="compare-divider" aria-hidden="true"><span>↔</span></span><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Adjust the before and after comparison for {escape(title, quote=True)}"><span class="compare-caption">Drag to compare</span>
</div>'''


def process_steps(compact: bool = False) -> str:
    items = [
        ("01", "Listen", "We begin with your routines, priorities, references and questions."),
        ("02", "Understand", "Plans, measurements and site context clarify the opportunity."),
        ("03", "Imagine", "Layouts, palette directions and visualisations make ideas tangible."),
        ("04", "Refine", "Materials, lighting and details are reviewed against the brief."),
        ("05", "Coordinate", "Approved information is organised for the agreed delivery scope."),
        ("06", "Settle in", "The final review brings the considered details together."),
    ]
    if compact:
        items = items[:4]
    return '<ol class="process-steps">' + "".join(
        f'<li data-process-step><span class="step-index">{n}</span><div><h3>{title}</h3><p>{copy}</p></div></li>' for n, title, copy in items
    ) + '</ol>'


def marquee() -> str:
    words = ["Complete homes", "Modular kitchens", "Living rooms", "Bedrooms", "Wardrobes", "Workplaces", "Custom furniture", "Lighting & ceilings"]
    run = "".join(f"<span>{escape(word)}</span>" for word in words)
    return f'<div class="marquee" aria-hidden="true"><div class="marquee-track" data-marquee>{run}{run}</div></div>'


def home() -> str:
    projects = CONTENT["projects"]
    services = CONTENT["services"]
    articles = CONTENT["articles"]
    transformations = [
        ("Living room", "living-before.jpg", "living-after.jpg", "Plain living room before design concept", "Warm layered living-room concept"),
        ("Bedroom", "bedroom-before.jpg", "bedroom-after.jpg", "Bedroom before concept study", "Restful bedroom concept with warm timber"),
        ("Kitchen", "kitchen-before.jpg", "kitchen-after.jpg", "Kitchen before concept study", "Warm ivory kitchen concept"),
        ("Whole home", "full-home-before.jpg", "full-home-after.jpg", "Open-plan home before concept study", "Whole-home concept with clear dining and living zones"),
    ]
    tabs = "".join(f'<button type="button" data-transform-select="{before.split("-")[0]}" aria-pressed="{"true" if i == 0 else "false"}">{escape(label)}</button>' for i, (label, before, after, _, _) in enumerate(transformations))
    tab_payload = " ".join(f'data-{before.split("-")[0]}-before="{escape(before)}" data-{before.split("-")[0]}-after="{escape(after)}" data-{before.split("-")[0]}-before-alt="{escape(ba, quote=True)}" data-{before.split("-")[0]}-after-alt="{escape(aa, quote=True)}"' for label, before, after, ba, aa in transformations)
    content = f'''<section class="hero" aria-labelledby="hero-title"><div class="hero-image" aria-hidden="true"><img src="{ASSETS}spm-hero-bangalore.jpg" alt="" fetchpriority="high"><span class="hero-shade"></span></div><div class="hero-copy wrap">{eyebrow('SPM INTERIORS DESIGN / BANGALORE')}
  <h1 id="hero-title"><span class="line"><span class="line-inner">We design homes</span></span><span class="line"><span class="line-inner">that <em>feel like you.</em></span></span></h1><p class="hero-lede">Thoughtful interiors for South Indian homes—planned around your routines, preferences and everyday needs.</p><div class="hero-actions">{button('Explore our work','/projects/','button-light')}{button('Book a design consultation','/consultation/','button-ghost-light')}</div><div class="hero-bottomline"><span>Residential &amp; commercial interiors · Bangalore · South India</span><a href="#discover"><span class="scroll-cue" aria-hidden="true"></span>Scroll to discover</a></div></div></section>
{stats_band()}
{marquee()}
<section class="manifesto section-pad wrap" id="discover"><div class="manifesto-aside" data-reveal>{eyebrow('A HOME, IN YOUR OWN WORDS','01')}<span class="vertical-rule"></span><p>YOUR HOME.<br>YOUR STORY.<br>OUR DESIGN.</p></div><div class="manifesto-copy" data-reveal><h2>A home isn’t a showroom.<br>It’s a <em>story in progress.</em></h2><p>SPM Interiors Design creates thoughtful, functional interiors that reflect your personality and make everyday living feel effortless. From discovery and planning to the details that make a room feel complete, each choice begins with you.</p><a class="text-link" href="/about/">Get to know SPM <span aria-hidden="true">↗</span></a></div><div class="manifesto-note" data-reveal><span>DESIGNED<br>AROUND YOU</span><b aria-hidden="true">SPM</b></div></section>
<section id="transformations" class="transformation-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('SEE THE POSSIBILITY','02')}<h2>From everyday<br>to <em>entirely yours.</em></h2></div><p>Explore illustrative room transformations. These generated visuals are design concepts, not completed client projects.</p></div><div class="transformation-layout"><div class="transformation-copy" data-reveal><span class="index-line">01 / TRANSFORMATION STUDY</span><h3 data-transform-title>Living room</h3><p>A clear starting point, a considered palette and useful details can change how a room supports daily life.</p><div class="transformation-tabs" role="group" aria-label="Choose a transformation example">{tabs}</div><p class="compare-hint">Move the divider to compare each illustrative concept.</p><a class="text-link transformation-more" href="/projects/">See more transformations <span aria-hidden="true">↗</span></a></div><div class="transformation-visual" {tab_payload} data-transform-image><div class="compare-slider" data-compare style="--split:50%"><div class="compare-side compare-before"><img data-transform-before src="{ASSETS}living-before.jpg" alt="Plain living room before design concept" loading="lazy"><span class="compare-label">Before</span></div><div class="compare-side compare-after"><img data-transform-after src="{ASSETS}living-after.jpg" alt="Warm layered living-room concept" loading="lazy"><span class="compare-label">After</span></div><span class="compare-divider" aria-hidden="true"><span>↔</span></span><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Adjust the living-room before and after comparison"><span class="compare-caption">Drag to compare</span></div></div></div></div></section>
<section class="sample-video-section section-pad" aria-labelledby="sample-video-heading"><div class="wrap sample-video-layout"><div class="sample-video-copy" data-reveal>{eyebrow('SPACES IN MOTION / SAMPLE VIDEO','03')}<h2 id="sample-video-heading">A closer look<br><em>in motion.</em></h2><p>A sample interior walkthrough, supplied for this website. It is presented as sample media, not as a verified completed SPM project.</p><span class="sample-video-note">32-SECOND INTERIOR WALKTHROUGH · AUDIO AVAILABLE</span></div><figure class="sample-video-card" data-reveal><video id="sample-interior-video" controls playsinline preload="metadata" poster="{ASSETS}interiorsvideo-poster.jpg" aria-labelledby="sample-video-heading" aria-describedby="sample-video-caption"><source src="{ASSETS}interiorsvideo.mp4" type="video/mp4"><p>Your browser does not support embedded video. <a href="{ASSETS}interiorsvideo.mp4">Open the sample video directly</a>.</p></video><figcaption id="sample-video-caption"><span>SPM INTERIORS DESIGN / SAMPLE</span><span>Press play when you are ready</span></figcaption></figure></div></section>
<section class="services-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('ROOM BY ROOM, OR ALL AT ONCE','04')}<h2>Considered from<br><em>threshold to home.</em></h2></div><a class="text-link" href="/services/">Explore every service <span aria-hidden="true">↗</span></a></div><div class="services-grid">{''.join(service_card(item, i) for i, item in enumerate(services[:6]))}</div></div></section>
<section class="projects-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('A DESIGN JOURNAL IN IMAGES','05')}<h2>Ideas with <em>room to breathe.</em></h2></div><a class="text-link" href="/projects/">View concept studies <span aria-hidden="true">↗</span></a></div><div class="projects-grid home-project-grid">{''.join(project_card(item, i) for i, item in enumerate(projects[:3]))}</div><p class="concept-note">Every image and project name shown here is an illustrative design concept—not a claim of completed client work.</p></div></section>
<section class="philosophy-section section-pad"><div class="wrap philosophy-layout"><div class="philosophy-heading" data-reveal>{eyebrow('THE SPM APPROACH','06')}<h2>Beautiful is only<br>the <em>beginning.</em></h2><p>We bring a point of view to the design—and keep the way you live at its centre.</p>{button('How we work','/process/','button-outline')}</div><div class="principle-list"><article data-reveal><span>01</span><div><h3>Listen before drawing</h3><p>Your needs and preferences set the direction.</p></div></article><article data-reveal><span>02</span><div><h3>Make the everyday work</h3><p>Storage, movement and light are part of the design from the start.</p></div></article><article data-reveal><span>03</span><div><h3>Choose materials with care</h3><p>Texture, maintenance and context matter as much as appearance.</p></div></article><article data-reveal><span>04</span><div><h3>Keep every decision clear</h3><p>A considered process helps ideas move forward with shared understanding.</p></div></article><article data-reveal><span>05</span><div><h3>Make choices understandable</h3><p>Options, assumptions and trade-offs deserve a clear conversation.</p></div></article><article data-reveal><span>06</span><div><h3>Finish with intention</h3><p>Proportion, edges and the details seen every day all matter.</p></div></article></div></div></section>
<section class="process-preview section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('A CLEAR, COLLABORATIVE PROCESS','07')}<h2>From first thought<br>to <em>feeling at home.</em></h2></div><p>Each project has its own needs. A clear sequence makes the next decision easier to see.</p></div>{process_steps(True)}<div class="process-more"><a class="text-link" href="/process/">See the full design journey <span aria-hidden="true">↗</span></a></div></div></section>
<section class="turnkey-section section-pad"><div class="wrap turnkey-layout"><div data-reveal>{eyebrow('FROM CONCEPT TO HANDOVER','08')}<h2>One vision.<br><em>A coordinated journey.</em></h2><p>Design, materials and next steps can be considered as one connected plan. Execution, quality checks and handover are included only when confirmed in the written project scope.</p><a class="text-link" href="/process/">Understand the process <span aria-hidden="true">↗</span></a></div><div class="turnkey-flow" data-reveal><ol><li>Concept</li><li>Design</li><li>Materials</li><li>Execution</li><li>Quality check</li><li>Handover</li></ol><p>Potential stages — final responsibilities depend on the signed agreement.</p></div></div></section>
<section class="materials-section"><div class="materials-image" data-reveal><img src="{ASSETS}materials-study.jpg" alt="Tactile interior material samples in ivory, stone, timber and terracotta" loading="lazy"></div><div class="materials-copy" data-reveal>{eyebrow('A PALETTE WITH PURPOSE','09')}<h2>Materials that feel<br><em>like home.</em></h2><p>Natural grain, quiet stone, tactile textiles and one carefully chosen accent can give a room depth without adding visual noise.</p><ul class="materials-list"><li>Wood</li><li>Marble &amp; stone</li><li>Veneer</li><li>Laminate</li><li>Fabric</li><li>Glass &amp; metal</li><li>Lighting</li></ul><a class="text-link" href="/journal/materials-for-south-indian-homes/">Read our material notes <span aria-hidden="true">↗</span></a></div></section>
<section class="testimonial-section section-pad"><div class="wrap testimonial-wrap"><div class="testimonial-heading" data-reveal>{eyebrow('CLIENT STORIES','10')}<h2>Good homes are<br><em>personal.</em></h2><p>Verified client words will appear here after the studio approves them.</p><div class="slider-controls"><button type="button" data-slide="prev" aria-label="Previous client story">←</button><button type="button" data-slide="next" aria-label="Next client story">→</button><span data-slide-count>01 / 03</span></div></div><div class="testimonial-stage" aria-live="polite"><article class="testimonial is-active" data-testimonial><span class="quote-mark" aria-hidden="true">“</span><blockquote>Approved client feedback will be added here when SPM supplies a verified testimonial.</blockquote><div class="reviewer"><span class="review-avatar" aria-hidden="true">SPM</span><div><strong>Client story pending</strong><span>Replace with an approved name and context</span></div></div></article><article class="testimonial" data-testimonial hidden><span class="quote-mark" aria-hidden="true">“</span><blockquote>A second verified client story can be featured here after review and permission.</blockquote><div class="reviewer"><span class="review-avatar" aria-hidden="true">SPM</span><div><strong>Client story pending</strong><span>No review, rating or identity is invented</span></div></div></article><article class="testimonial" data-testimonial hidden><span class="quote-mark" aria-hidden="true">“</span><blockquote>Use this space for real feedback shared with the client’s permission.</blockquote><div class="reviewer"><span class="review-avatar" aria-hidden="true">SPM</span><div><strong>Client story pending</strong><span>Verified testimonial placeholder</span></div></div></article></div></div></section>
<section class="journal-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('NOTES ON LIVING WELL','11')}<h2>From the design<br><em>journal.</em></h2></div><a class="text-link" href="/journal/">Read every article <span aria-hidden="true">↗</span></a></div><div class="journal-grid">{''.join(article_card(item, i) for i, item in enumerate(articles))}</div></div></section>
{cta_band('YOUR HOME, NEXT','Ready to make space<br>for <em>what matters?</em>','Tell us what you are imagining. We will begin with a conversation about the home and the way you want to live.')}
'''
    return page("Interior Designers in Bangalore | SPM Interiors Design", "SPM Interiors Design creates thoughtful home interiors in Bangalore and South India. Explore home design services, original concept studies and a considered design process.", content, "Home", True, "interior designers in Bangalore, home interiors Bangalore, interior design South India, home interior design, modular kitchen design, bedroom interiors")


def about() -> str:
    content = f'''{breadcrumbs([("About", None)])}<section class="inner-hero wrap"><div class="inner-hero-copy" data-reveal>{eyebrow('ABOUT SPM / DESIGN WITH INTENTION')}<h1>Good design begins<br>with <em>understanding.</em></h1><p class="hero-lede">We create thoughtful, functional interiors that reflect your personality and make everyday living feel effortless.</p>{button('Explore our process', '/process/')}</div><div class="inner-hero-image" data-reveal><img src="{ASSETS}spm-hero-bangalore.jpg" alt="Sunlit South Indian home concept with natural timber, cane and warm ivory finishes" fetchpriority="high"><span class="image-caption">SPM / INTERIORS DESIGN</span></div></section>
<section class="about-story section-pad"><div class="wrap story-layout"><div data-reveal>{eyebrow('OUR POINT OF VIEW','01')}<h2>A home should feel<br><em>like it belongs to you.</em></h2></div><div class="story-copy" data-reveal><p class="story-lede">SPM Interiors Design is built around one simple belief: a well-designed home should make the everyday feel more natural.</p><p>We bring the practical decisions—space, storage, movement and light—together with the materials, objects and details that give a home its own character. The result is not a style to copy, but a thoughtful design shaped by the people who live there.</p><p>From Bangalore to homes across South India, our focus is on clear conversations, considered choices and interiors that support the rhythm of real life.</p></div></div></section>
<section class="about-pillars section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('WHAT GUIDES THE WORK','02')}<h2>A thoughtful home,<br><em>from the inside out.</em></h2></div><p>We treat beauty, function and the process as parts of the same design conversation.</p></div><div class="pillar-grid"><article data-reveal><span>01 / PEOPLE</span><h3>Personal by nature</h3><p>Your routines, preferences and priorities belong in the brief—not as an afterthought.</p></article><article data-reveal><span>02 / SPACE</span><h3>Clear in its purpose</h3><p>Movement, storage and light help each room support the way it is used.</p></article><article data-reveal><span>03 / MATERIAL</span><h3>Considered in every layer</h3><p>Texture and finish are selected with appearance, maintenance and context in mind.</p></article><article data-reveal><span>04 / PROCESS</span><h3>Open at every step</h3><p>Shared information and clear next steps help the project move with intention.</p></article></div></div></section>
<section class="about-note"><div class="wrap about-note-inner" data-reveal><p class="eyebrow">A NOTE ON THIS SHOWCASE</p><p>Concept imagery illustrates the design direction. Verified company history, completed-project photography, team biographies, client stories and studio credentials will be added only when SPM supplies them.</p></div></section>
{cta_band('LET’S BEGIN WITH A CONVERSATION','Have a space in mind?','Tell us what you are looking for and we can start by understanding the brief.') }'''
    return page("About SPM Interiors Design | Home Design Studio in Bangalore", "Meet SPM Interiors Design, a thoughtful home-interior design studio focused on function, material warmth and daily life in Bangalore and South India.", content, "About")


def services_index() -> str:
    services = CONTENT["services"]
    residential = [item for item in services if item.get("audience", "residential") == "residential"]
    commercial = [item for item in services if item.get("audience", "residential") == "commercial"]
    residential_cards = "".join(service_card(item, i) for i, item in enumerate(residential))
    commercial_cards = "".join(service_card(item, i) for i, item in enumerate(commercial))
    content = f'''{breadcrumbs([("Services", None)])}<section class="inner-hero wrap"><div class="inner-hero-copy" data-reveal>{eyebrow('RESIDENTIAL & COMMERCIAL / SPM SERVICES')}<h1>Thoughtful design,<br><em>for every kind of space.</em></h1><p class="hero-lede">From a home to a workplace, we bring clarity and care to the decisions that shape the spaces people use every day.</p>{button('Tell us about your project', '/consultation/')}</div><div class="inner-hero-image" data-reveal><img src="{ASSETS}service-commercial.jpg" alt="Bangalore commercial workplace concept with reception joinery and professional office space" fetchpriority="high"><span class="image-caption">DESIGN THAT SUPPORTS DAILY LIFE</span></div></section>
<section class="service-catalog section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('01 / RESIDENTIAL')}<h2>Homes shaped<br><em>around you.</em></h2></div><p>Room-by-room expertise and whole-home thinking, brought together around the people who live in each space.</p></div><div class="services-grid services-grid-all">{residential_cards}</div></div></section>
<section class="service-catalog service-catalog-commercial section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('02 / COMMERCIAL')}<h2>Places for work,<br><em>welcome and discovery.</em></h2></div><p>Commercial interiors and workplace furniture planned for function, identity and the experience of the people who use them.</p></div><div class="services-grid services-grid-all">{commercial_cards}</div><nav class="commercial-subnav" aria-label="Commercial interior types"><a href="/services/commercial-interiors/#office-interiors">Office Interiors <span>↗</span></a><a href="/services/commercial-interiors/#retail-showrooms">Retail &amp; Showrooms <span>↗</span></a><a href="/services/commercial-interiors/#restaurants-cafes">Restaurants &amp; Cafés <span>↗</span></a></nav></div></section>
<section class="scope-note section-pad"><div class="wrap scope-note-grid" data-reveal><div>{eyebrow('ONE CONSIDERED PROCESS','03')}<h2>Different spaces.<br><em>Clear decisions.</em></h2></div><div><p>Services can be explored separately or brought together into a wider brief. Final deliverables, timelines, pricing and execution responsibility depend on the written agreement for each project.</p>{button('Discuss a project', '/consultation/', 'button-outline')}</div></div></section>
{cta_band('NOT SURE WHERE TO START?','Let’s find the right<br><em>first step.</em>','Share a little about your project. We can help you understand which design conversation to have first.') }'''
    return page("Interior Design Services in Bangalore | Residential & Commercial | SPM Interiors Design", "Explore residential and commercial interior design in Bangalore: complete homes, kitchens, compact spaces, workplaces, office furniture, retail, cafés and restaurants.", content, "Services", False, "residential interior design Bangalore, commercial interior designers Bangalore, office furniture, space-saving interiors")


def service_detail(item: dict) -> str:
    includes = "".join(f'<li><span aria-hidden="true">+</span>{escape(line)}</li>' for line in item["includes"])
    faqs = "".join(f'<details><summary>{escape(q)}</summary><p>{escape(a)}</p></details>' for q, a in item["faqs"])
    chapters = item.get("chapters", [])
    chapters_html = ""
    if chapters:
        chapter_cards = "".join(
            f'<article id="{escape(chapter["id"], quote=True)}" data-reveal><span class="service-chapter-index">0{i + 1} / SPM</span><h3>{escape(chapter["title"])}</h3><p>{escape(chapter["copy"])}</p></article>'
            for i, chapter in enumerate(chapters)
        )
        chapters_html = f'<section class="service-chapters section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow("SPACES, NEEDS & DETAIL","02")}<h2>Design begins<br><em>with how it works.</em></h2></div><p>Each space has its own rhythms, practical needs and moments of welcome. The brief shapes the response.</p></div><div class="service-chapter-grid">{chapter_cards}</div></div></section>'
    related = [x for x in CONTENT["services"] if x["slug"] != item["slug"] and x.get("audience", "residential") == item.get("audience", "residential")][:3]
    related_html = "".join(f'<a href="/services/{escape(x["slug"])}/"><span>{escape(x["title"])}</span><span aria-hidden="true">↗</span></a>' for x in related)
    audience = item.get("audience", "residential").upper()
    cta_label = item.get("cta_label", "Talk through your project")
    content = f'''{breadcrumbs([("Services", "/services/"), (item['title'], None)])}<section class="service-detail-hero wrap"><div class="service-detail-copy" data-reveal>{eyebrow(f'SPM / {audience} SERVICES')}<h1>{escape(item['title'])}</h1><p class="hero-lede">{escape(item['short'])}</p><p>{escape(item['intro'])}</p>{button(cta_label, '/consultation/')}</div><div class="service-detail-image" data-reveal><img src="{ASSETS}{escape(item['image'])}" alt="{escape(item['alt'], quote=True)}" fetchpriority="high"><span class="image-caption">{escape(item['category'].replace('-', ' ').upper())} / SPM</span></div></section>
<section id="service-includes" class="service-includes section-pad"><div class="wrap includes-grid"><div data-reveal>{eyebrow('WHAT WE CAN EXPLORE','01')}<h2>Every detail,<br><em>thought through.</em></h2><p>These are possible parts of the conversation. The final scope is confirmed with you in writing.</p></div><ul class="included-list" data-reveal>{includes}</ul></div></section>
{chapters_html}
<section class="service-detail-note"><div class="wrap" data-reveal><span>SPM / APPROACH</span><p>{escape(item['intro'])}</p><a class="text-link" href="/process/">See how the process works <span aria-hidden="true">↗</span></a></div></section>
<section class="faq-section section-pad"><div class="wrap faq-layout"><div data-reveal>{eyebrow('GOOD QUESTIONS','03')}<h2>Before we<br><em>get started.</em></h2><a class="text-link" href="/contact/">Ask about your brief <span aria-hidden="true">↗</span></a></div><div class="faq-list" data-reveal>{faqs}</div></div></section>
<section class="related-services section-pad"><div class="wrap"><div class="section-heading"><div>{eyebrow('YOU MAY ALSO EXPLORE','04')}<h2>More ways to<br><em>shape a space.</em></h2></div><a class="text-link" href="/services/">View all services <span aria-hidden="true">↗</span></a></div><div class="related-links">{related_html}</div></div></section>
{cta_band('A SPACE WITH ITS OWN BRIEF','Let’s make a plan<br><em>that feels considered.</em>','Start with a conversation about the space, the people who use it and the decisions ahead.', cta_label) }'''
    title = item.get("seo_title", f"{item['title']} | SPM Interiors Design Bangalore")
    description = item.get("seo_description", f"Explore {item['title'].lower()} with SPM Interiors Design. Thoughtful interior planning shaped around your needs in Bangalore and South India.")
    keywords = item.get("seo_keywords", "")
    return page(title, description, content, "Services", False, keywords)


def projects_index() -> str:
    projects = CONTENT["projects"]
    filters = [("all", "All concepts"), ("home", "Whole home"), ("kitchen", "Kitchens"), ("bedroom", "Bedrooms"), ("living", "Living rooms")]
    filter_html = "".join(f'<button type="button" data-filter="{slug}" aria-pressed="{"true" if i == 0 else "false"}" class="{"is-selected" if i == 0 else ""}">{label}</button>' for i, (slug, label) in enumerate(filters))
    content = f'''{breadcrumbs([("Projects", None)])}<section class="inner-hero wrap"><div class="inner-hero-copy" data-reveal>{eyebrow('PROJECTS / DESIGN CONCEPTS')}<h1>Ideas made<br><em>to feel like home.</em></h1><p class="hero-lede">Explore original design studies for rooms and homes shaped by warm materials, clear function and South Indian living.</p>{button('See a room transformation', '/#transformations', 'button-outline')}</div><div class="inner-hero-image" data-reveal><img src="{ASSETS}living-after.jpg" alt="Warm contemporary living-room design concept" fetchpriority="high"><span class="image-caption">ILLUSTRATIVE CONCEPT / SPM</span></div></section>
<section class="portfolio-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('THE CONCEPT PORTFOLIO','01')}<h2>Different ways to<br><em>live beautifully.</em></h2></div><p>All projects shown are illustrative concepts using original generated imagery, not claims of completed client commissions.</p></div><div class="project-filters" role="group" aria-label="Filter project concepts">{filter_html}</div><div class="projects-grid portfolio-grid" data-project-grid>{''.join(project_card(item, i) for i, item in enumerate(projects))}</div><p data-filter-empty hidden class="filter-empty">No concepts match this selection.</p></div></section>
{cta_band('YOUR HOME IS ITS OWN BRIEF','Have a room in mind?','Tell us what you would like the space to do. We will start with the details that make it yours.') }'''
    return page("Interior Design Projects & Concepts | SPM Interiors Design", "Browse original whole-home, kitchen, bedroom and living-room design concepts by SPM Interiors Design. Illustrative imagery is clearly labelled.", content, "Projects")


def project_detail(item: dict) -> str:
    compare = compare_slider(item["before_image"], item["image"], item["name"], f"Before: {item['alt']}", f"After: {item['alt']}")
    materials = "".join(f'<li>{escape(x)}</li>' for x in item["materials"])
    rooms = "".join(f'<li>{escape(x)}</li>' for x in item["rooms"])
    related = [x for x in CONTENT["projects"] if x["slug"] != item["slug"]][:2]
    gallery_by_category = {
        "home": [("Living room", "living-after.jpg", "Warm living-room concept"), ("Kitchen", "kitchen-after.jpg", "Kitchen design concept"), ("Bedroom", "bedroom-after.jpg", "Bedroom concept"), ("Wardrobe", "service-wardrobe.jpg", "Joinery and wardrobe concept"), ("Lighting", "service-lighting.jpg", "Layered lighting concept")],
        "kitchen": [("Kitchen", "kitchen-after.jpg", "Warm kitchen concept"), ("Dining", "service-dining.jpg", "Connected dining concept"), ("Materials", "materials-study.jpg", "Stone, timber and textile material study"), ("Lighting", "service-lighting.jpg", "Layered lighting concept")],
        "bedroom": [("Bedroom", "bedroom-after.jpg", "Calm bedroom concept"), ("Wardrobe", "service-wardrobe.jpg", "Joinery and wardrobe concept"), ("Materials", "materials-study.jpg", "Natural timber and tactile material study"), ("Lighting", "service-lighting.jpg", "Layered lighting concept")],
        "living": [("Living room", "living-after.jpg", "Layered living-room concept"), ("Dining", "service-dining.jpg", "Connected dining concept"), ("Materials", "materials-study.jpg", "Warm material palette study"), ("Lighting", "service-lighting.jpg", "Layered lighting concept")],
    }
    gallery = "".join(f'<figure data-reveal><img src="{ASSETS}{escape(image)}" alt="{escape(alt, quote=True)}" loading="lazy"><figcaption>{escape(label)} <span>ILLUSTRATIVE CONCEPT</span></figcaption></figure>' for label, image, alt in gallery_by_category.get(item["category"], []))
    content = f'''{breadcrumbs([("Projects", "/projects/"), (item['name'], None)])}<section class="project-detail-hero wrap"><div class="project-detail-copy" data-reveal>{eyebrow('ILLUSTRATIVE DESIGN STUDY / SPM')}<h1>{escape(item['name'])}</h1><p class="hero-lede">{escape(item['description'])}</p><div class="project-facts"><div><span>PROPERTY TYPE</span><strong>{escape(item['typology'])}</strong></div><div><span>LOCATION</span><strong>{escape(item['location'])}</strong></div><div><span>AREA</span><strong>Not measured — illustrative concept</strong></div><div><span>DESIGN STYLE</span><strong>{escape(item['style'])}</strong></div></div></div><div class="project-detail-image" data-reveal><img src="{ASSETS}{escape(item['image'])}" alt="{escape(item['alt'], quote=True)}" fetchpriority="high"><span class="concept-stamp">CONCEPT<br>STUDY</span></div></section>
<section class="project-compare-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('A ROOM, REIMAGINED','01')}<h2>Before the idea.<br><em>After the thought.</em></h2></div><p>Use the comparison control to explore an illustrative before-and-after design study.</p></div>{compare}<p class="concept-note">Generated concept imagery for design exploration. It does not depict a completed client project.</p></div></section>
<section class="project-vignettes section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('ROOMS IN THE CONCEPT','02')}<h2>One palette,<br><em>many moments.</em></h2></div><p>Swipe through original illustrative room vignettes. These images explore a design direction; they do not document a measured or completed home.</p></div><div class="room-gallery-grid" role="region" aria-label="Illustrative room concept gallery" tabindex="0">{gallery}</div></div></section>
<section class="project-detail-body section-pad"><div class="wrap project-body-grid"><div data-reveal>{eyebrow('THE DESIGN NOTES','02')}<h2>What makes<br><em>the concept work.</em></h2><p>{escape(item['description'])}</p></div><div class="project-specs" data-reveal><div><h3>Material direction</h3><ul>{materials}</ul></div><div><h3>Spaces explored</h3><ul>{rooms}</ul></div></div></div></section>
<section class="related-projects section-pad"><div class="wrap"><div class="section-heading"><div>{eyebrow('MORE DESIGN STUDIES','03')}<h2>Continue <em>exploring.</em></h2></div><a class="text-link" href="/projects/">All concepts <span aria-hidden="true">↗</span></a></div><div class="projects-grid">{''.join(project_card(p, i) for i, p in enumerate(related))}</div></div></section>
{cta_band('YOUR HOME HAS ITS OWN STORY','Let’s begin with<br><em>your brief.</em>','Share the space, the routines and the feeling you are hoping to create.') }'''
    return page(f"{item['name']} — Interior Design Concept | SPM Interiors Design", f"Explore {item['name']}, an illustrative {item['typology'].lower()} by SPM Interiors Design. Original concept imagery, materials and design notes.", content, "Projects")


def process_page() -> str:
    content = f'''{breadcrumbs([("Process", None)])}<section class="process-hero wrap"><div data-reveal>{eyebrow('THE SPM DESIGN JOURNEY')}<h1>Good work begins<br>with <em>good questions.</em></h1><p class="hero-lede">A clear, collaborative process gives the ideas, decisions and details room to come together.</p>{button('Start with a conversation', '/consultation/')}</div><div class="process-hero-art" data-reveal><img src="{ASSETS}materials-study.jpg" alt="A considered selection of timber, stone, textile and terracotta materials" fetchpriority="high"><span>SPM / MATERIAL STUDY</span></div></section>
<section class="process-detail section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('SIX CONSIDERED STEPS','01')}<h2>One clear next step<br><em>at a time.</em></h2></div><p>Project scope and sequence depend on the brief and final agreement; this is a guide to the design conversation.</p></div>{process_steps()}</div></section>
<section class="process-expectations section-pad"><div class="wrap expectations-grid"><div data-reveal>{eyebrow('CLARITY IS PART OF THE DESIGN','02')}<h2>Shared decisions.<br><em>Better direction.</em></h2></div><div data-reveal><p>At each stage, the aim is to make decisions visible: what is being explored, what needs your input and what comes next. Deliverables, costs, approvals, procurement and construction responsibility should be confirmed in writing before work proceeds.</p><a class="text-link" href="/services/">Explore services <span aria-hidden="true">↗</span></a></div></div></section>
{cta_band('READY WHEN YOU ARE','Start with the<br><em>space you have.</em>','Tell us what is changing, what matters most and how you would like the home to feel.') }'''
    return page("Interior Design Process | SPM Interiors Design Bangalore", "Learn about the SPM Interiors Design journey: discovery, site understanding, concept development, material refinement, coordination and handover.", content, "Process")


def journal_index() -> str:
    articles = CONTENT["articles"]
    content = f'''{breadcrumbs([("Journal", None)])}<section class="journal-hero wrap"><div data-reveal>{eyebrow('THE SPM DESIGN JOURNAL')}<h1>Ideas for living<br><em>with intention.</em></h1><p class="hero-lede">Notes on home planning, material choices and the details that make everyday spaces feel considered.</p></div><div class="journal-hero-image" data-reveal><img src="{ASSETS}materials-study.jpg" alt="Tactile interior materials selected for a warm South Indian home concept" fetchpriority="high"></div></section>
<section class="journal-list-section section-pad"><div class="wrap"><div class="section-heading" data-reveal><div>{eyebrow('NOTES FROM THE STUDIO','01')}<h2>Design that starts<br><em>with everyday life.</em></h2></div><p>Original editorial articles from SPM Interiors Design.</p></div><div class="journal-grid">{''.join(article_card(item, i) for i, item in enumerate(articles))}</div></div></section>
{cta_band('A QUESTION ABOUT YOUR HOME?','Make the next decision<br><em>with more clarity.</em>','Get in touch to discuss the space and the decisions you are working through.') }'''
    return page("Interior Design Journal | SPM Interiors Design", "Read SPM Interiors Design notes on home planning, materials, lighting and thoughtful interiors for South Indian homes.", content, "Journal")


def article_page(item: dict) -> str:
    sections = "".join(f'<section><h2>{escape(heading)}</h2><p>{escape(copy)}</p></section>' for heading, copy in item["sections"])
    related = [x for x in CONTENT["articles"] if x["slug"] != item["slug"]][:2]
    content = f'''{breadcrumbs([("Journal", "/journal/"), (item['title'], None)])}<article class="article-page wrap"><header class="article-header" data-reveal>{eyebrow(f"{item['category']} / {item['read_time']}")}<h1>{escape(item['title'])}</h1><p class="hero-lede">{escape(item['excerpt'])}</p><div class="article-meta"><span>SPM INTERIORS DESIGN</span><time datetime="{escape(item['date'])}">{escape(item['date'])}</time></div></header><figure class="article-hero-image" data-reveal><img src="{ASSETS}{escape(item['image'])}" alt="{escape(item['alt'], quote=True)}" fetchpriority="high"></figure><div class="article-content"><aside class="article-side-note"><span>SPM / JOURNAL</span><p>Thoughtful homes begin with the questions that matter to the people who live there.</p></aside><div class="article-body">{sections}<p class="article-caveat">This article offers general design considerations. Confirm final materials, specifications and installation requirements for the project and product in question.</p></div></div></article>
<section class="related-journal section-pad"><div class="wrap"><div class="section-heading"><div>{eyebrow('MORE FROM THE JOURNAL')}<h2>Keep <em>reading.</em></h2></div><a class="text-link" href="/journal/">All articles <span aria-hidden="true">↗</span></a></div><div class="journal-grid">{''.join(article_card(x, i) for i, x in enumerate(related))}</div></div></section>
{cta_band('MAKE IT YOUR OWN','Have a home question<br><em>of your own?</em>','Tell us what you are thinking about. We will start by listening.') }'''
    return page(f"{item['title']} | SPM Interiors Design Journal", item["excerpt"], content, "Journal", False, f"{item['category']}, South Indian interior design, home interiors Bangalore")


def lead_form(form_id: str = "consultation-form") -> str:
    service_options = [
        "Home Interiors", "Commercial Interiors", "Office Interiors", "Office Furniture",
        "Space-Saving Interiors", "Modular Kitchen", "Bedroom", "Living Room",
        "Wardrobe", "Custom Furniture", "Other",
    ]
    service_select = "".join(f'<option value="{escape(value, quote=True)}">{escape(value)}</option>' for value in service_options)
    budgets = ["Under ₹5 Lakhs", "₹5–10 Lakhs", "₹10–15 Lakhs", "₹15–20 Lakhs", "₹20 Lakhs+"]
    budget_options = "".join(
        f'<label class="budget-chip"><input type="radio" name="budget" value="{escape(value, quote=True)}"><span>{escape(value)}</span></label>'
        for value in budgets
    )
    return f'''<form class="lead-form" id="{escape(form_id)}" data-lead-form novalidate>
  <div class="form-grid">
    <label>Your name *<input name="name" autocomplete="name" required maxlength="100" placeholder="Name"></label>
    <label>Phone number *<input name="phone" type="tel" autocomplete="tel" required inputmode="tel" maxlength="24" placeholder="+91"></label>
    <label>Email address<input name="email" type="email" autocomplete="email" maxlength="160" placeholder="name@example.com"></label>
    <label>City / project location *<input name="location" autocomplete="address-level2" required maxlength="120" placeholder="City / locality"></label>
    <label class="form-full">What service are you looking for?<select name="service"><option value="">Choose a service</option>{service_select}</select></label>
    <label>Property / space type<select name="property_type"><option value="">Choose one</option><option>Apartment</option><option>Independent home</option><option>Villa</option><option>Office / workspace</option><option>Retail / showroom</option><option>Restaurant / café</option><option>Other</option><option>Still exploring</option></select></label>
    <label>Approximate space size<select name="home_size"><option value="">Choose one</option><option>Compact space</option><option>1–2 bedroom home</option><option>3 bedroom home</option><option>4+ bedroom home</option><option>Not sure yet</option></select></label>
    <label>Number of bedrooms<select name="bedrooms"><option value="">Choose one</option><option>Studio / 1 bedroom</option><option>2 bedrooms</option><option>3 bedrooms</option><option>4+ bedrooms</option><option>Not sure yet</option></select></label>
    <fieldset class="budget-fieldset form-full"><legend>Estimated Budget</legend><div class="budget-options">{budget_options}</div></fieldset>
    <label>Preferred design style<select name="style"><option value="">Choose one</option><option>Warm minimal</option><option>Contemporary</option><option>Modern Indian</option><option>Classic</option><option>Not sure yet</option></select></label>
    <label>Preferred contact time<select name="contact_time"><option value="">Choose one</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Any time</option></select></label>
    <label>Preferred consultation date<input name="date" type="date" data-future-date></label>
    <label>Project timeline<select name="timeline"><option value="">Choose one</option><option>As soon as practical</option><option>Within 1–3 months</option><option>Within 3–6 months</option><option>More than 6 months away</option><option>Still exploring</option></select></label>
    <label class="form-full">Tell us a little about the project<textarea name="message" rows="4" maxlength="2000" placeholder="What would you like your space to feel like?"></textarea></label>
  </div>
  <label class="form-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label>
  <p class="form-consent">By submitting, you are asking SPM Interiors Design to respond to this enquiry. Do not include sensitive personal information. Details are sent only if a secure endpoint is configured.</p>
  <button class="button button-dark form-submit" type="submit">Send my enquiry <span aria-hidden="true">↗</span></button><p class="form-status" data-form-status role="status" aria-live="polite" tabindex="-1"></p>
</form>'''


def contact_page() -> str:
    content = f'''{breadcrumbs([("Contact", None)])}<section class="contact-hero wrap"><div data-reveal>{eyebrow('CONTACT / START A CONVERSATION')}<h1>Let’s talk about<br><em>your home.</em></h1><p class="hero-lede">Tell us what you are imagining, what feels unclear or where you would like to begin.</p><div class="contact-links"><a class="contact-configured" data-email-link href="#" hidden></a><div class="contact-phone-links" data-phone-links hidden></div><a class="contact-configured" data-wa-link href="#" hidden>Message on WhatsApp ↗</a><p class="contact-unconfigured" data-contact-empty>Public studio contact details will appear here once confirmed.</p></div><a class="map-search" href="https://www.google.com/maps/search/?api=1&amp;query=Chandapur%2C%20Bangalore-560099" target="_blank" rel="noopener">Explore Chandapur, Bangalore-560099 on Google Maps <span aria-hidden="true">↗</span></a><p class="contact-map-note">This opens a general map search; contact the studio to confirm the exact office pin before visiting.</p></div><div class="contact-visual" data-reveal><img src="{ASSETS}spm-hero-bangalore.jpg" alt="Quiet contemporary home concept with a courtyard, natural teak and warm daylight" fetchpriority="high"><span>BANGALORE / SOUTH INDIA</span></div></section>
<section class="contact-form-section section-pad"><div class="wrap contact-layout"><div data-reveal>{eyebrow('A FEW DETAILS HELP','01')}<h2>Share the<br><em>starting point.</em></h2><p>Use the form to describe the home and the kind of support you are looking for. The form will confirm whether enquiry delivery is configured before any details are sent.</p><div class="contact-note"><span>SPM / RESPONSE</span><p>Response times and project availability will be confirmed directly by the studio.</p></div></div><div class="contact-form-panel">{lead_form('contact-form')}</div></div></section>
{cta_band('PREFER A FIRST CHAT?','Begin with a<br><em>simple question.</em>','Book a consultation request or share a note through the enquiry form.') }'''
    return page("Contact SPM Interiors Design | Bangalore Home Interiors", "Contact SPM Interiors Design about home interior design in Bangalore and South India. Share your project details through the enquiry form.", content, "Contact", False, "contact interior designers Bangalore, home interiors contact, SPM Interiors Design")


def consultation_page() -> str:
    content = f'''{breadcrumbs([("Consultation", None)])}<section class="consultation-hero wrap"><div data-reveal>{eyebrow('A GOOD PLACE TO START')}<h1>Let’s make room<br>for <em>what matters.</em></h1><p class="hero-lede">A first conversation is a chance to share your ideas, understand the possibilities and see what a useful next step might be.</p><div class="consult-points"><p><span>01</span> Tell us about the space</p><p><span>02</span> Share what matters to you</p><p><span>03</span> Outline the next decision</p></div></div><div class="consultation-image" data-reveal><img src="{ASSETS}spm-hero-bangalore.jpg" alt="A warm South Indian home interior concept with natural timber and quiet daylight" fetchpriority="high"></div></section>
<section class="consultation-form-section section-pad"><div class="wrap consultation-layout"><div data-reveal>{eyebrow('BOOK A DESIGN CONSULTATION','01')}<h2>Tell us a little<br><em>about your project.</em></h2><p>Fields marked * are required. Your information is not sent unless a secure form endpoint has been configured for the site.</p><a class="text-link" href="/process/">See the design process <span aria-hidden="true">↗</span></a></div><div class="consult-form-panel">{lead_form()}</div></div></section>'''
    return page("Book an Interior Design Consultation | SPM Interiors Design", "Request a home interior design consultation with SPM Interiors Design in Bangalore. Share your location, home type, budget and preferred style.", content, "Consultation")


def legal_page(kind: str) -> str:
    if kind == "privacy":
        title = "Privacy Notice"
        body = """<h2>About this website</h2><p>This site is a design showcase for SPM Interiors Design. Replace this sample notice with an accurate, reviewed policy before collecting enquiries from the public.</p><h2>Enquiry information</h2><p>The website only transmits enquiry form fields when a public lead endpoint is configured. The endpoint owner must explain the information collected, purpose, lawful basis, retention, processors and contact route. Never place server secrets in browser code.</p><h2>Analytics and external services</h2><p>No analytics service is configured in this static project. External links, fonts and any future embedded services may process technical data under their own terms.</p><h2>Before launch</h2><p>Confirm the data controller, business contact details, applicable jurisdiction, form processor and retention practices, then have the production notice reviewed by a qualified professional. This sample is not legal advice.</p>"""
    else:
        title = "Terms & Conditions"
        body = """<h2>Illustrative design concepts</h2><p>Concept imagery, example project studies and placeholder elements on this site are illustrative and do not claim completed client work, measured outcomes or guaranteed results.</p><h2>Project scope</h2><p>Services, fees, timelines, deliverables, procurement, execution responsibility, warranties and handover arrangements must be agreed in a separate written contract before work begins.</p><h2>Materials and installation</h2><p>Final product selection and installation requirements depend on the actual site, manufacturer specifications and qualified professional advice.</p><h2>Using this website</h2><p>This sample page should be replaced with production terms appropriate to the real business and jurisdiction, reviewed by a qualified professional. It is not legal advice.</p>"""
    content = f'''{breadcrumbs([(title, None)])}<section class="legal-page wrap"><div class="legal-heading">{eyebrow('SPM INTERIORS DESIGN / INFORMATION')}<h1>{escape(title)}</h1><p class="hero-lede">A clear starting point for understanding this showcase.</p></div><div class="legal-copy">{body}<p class="legal-updated">Sample copy · Confirm and review before public launch.</p></div></section>'''
    return page(f"{title} | SPM Interiors Design", f"Read the {title.lower()} for the SPM Interiors Design website.", content)


def all_pages() -> dict[str, str]:
    pages: dict[str, str] = {"index.html": home(), "about/index.html": about(), "services/index.html": services_index(), "projects/index.html": projects_index(), "process/index.html": process_page(), "journal/index.html": journal_index(), "contact/index.html": contact_page(), "consultation/index.html": consultation_page(), "privacy/index.html": legal_page("privacy"), "terms/index.html": legal_page("terms")}
    for item in CONTENT["services"]:
        pages[f"services/{item['slug']}/index.html"] = service_detail(item)
    for item in CONTENT["projects"]:
        pages[f"projects/{item['slug']}/index.html"] = project_detail(item)
    for item in CONTENT["articles"]:
        pages[f"journal/{item['slug']}/index.html"] = article_page(item)
    return pages


def main() -> None:
    # Clear only previously generated route folders so renamed/removed pages cannot leak into the sitemap.
    for name in ("about", "services", "projects", "process", "journal", "contact", "consultation", "privacy", "terms"):
        target = ROOT / name
        if target.exists() and target.is_dir():
            shutil.rmtree(target)
    home_index = ROOT / "index.html"
    if home_index.exists():
        home_index.unlink()
    for relative, html in all_pages().items():
        destination = ROOT / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(html, encoding="utf-8")
    (ROOT / ".nojekyll").write_text("", encoding="utf-8")
    print(f"Generated {len(all_pages())} static HTML routes from content/site.json")


if __name__ == "__main__":
    main()
