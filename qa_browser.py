#!/usr/bin/env python3
"""Real-browser smoke tests for the production static site on desktop, tablet and mobile."""
from __future__ import annotations

import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4174"
ROOT = Path(__file__).resolve().parent
ROUTES = [
    "/", "/about/", "/services/", "/services/complete-home-interiors/",
    "/services/modular-kitchens/", "/services/living-rooms/", "/services/bedrooms/",
    "/services/dining-areas/", "/services/wardrobes-storage/", "/services/lighting-ceilings/",
    "/services/bathrooms/", "/services/custom-furniture/", "/services/commercial-interiors/",
    "/services/office-furniture/", "/services/space-saving-interiors/", "/projects/",
    "/projects/the-quiet-courtyard/", "/projects/the-sunday-kitchen/",
    "/projects/a-room-to-exhale/", "/projects/living-in-layers/", "/process/",
    "/journal/", "/journal/planning-a-warm-minimal-home/",
    "/journal/materials-for-south-indian-homes/", "/journal/layered-lighting-for-everyday-living/",
    "/contact/", "/consultation/", "/privacy/", "/terms/",
]


def check_routes(page, width_name: str, errors: list[str]) -> None:
    for route in ROUTES:
        response = page.goto(BASE + route, wait_until="domcontentloaded")
        if not response or response.status != 200:
            errors.append(f"{width_name}: route failed: {route}")
            continue
        if page.locator("h1").count() != 1:
            errors.append(f"{width_name}: route should have one H1: {route}")
        if page.evaluate("document.documentElement.scrollWidth > window.innerWidth"):
            errors.append(f"{width_name}: horizontal overflow on {route}")
        broken = page.locator("img").evaluate_all("imgs => imgs.filter(i => i.complete && !i.naturalWidth).map(i => i.src)")
        if broken:
            errors.append(f"{width_name}: broken visible images on {route}: {broken}")
        check_footer(page, width_name, errors)
        if route == "/contact/":
            phones = page.locator(".contact-phone-links [data-phone-link]:visible")
            if [link.inner_text() for link in phones.all()] != ["+91 9345633674", "+91 7975049950"]:
                errors.append(f"{width_name}: contact page is missing one or both supplied phone links.")
            map_href = page.locator(".map-search").get_attribute("href") or ""
            if "Chandapur%2C%20Bangalore-560099" not in map_href:
                errors.append(f"{width_name}: contact map search does not use the supplied Chandapur postal address.")


def check_footer(page, width_name: str, errors: list[str]) -> None:
    footer = page.locator(".site-footer")
    if not footer.count():
        errors.append(f"{width_name}: premium footer is missing.")
        return
    expected_navigation = ["Home", "About", "Services", "Projects", "Process", "Blog", "Contact"]
    if footer.locator(".footer-primary-nav a").all_inner_texts() != expected_navigation:
        errors.append(f"{width_name}: footer navigation does not match the requested labels/order.")
    expected_services = ["Home Interiors", "Kitchens", "Living Rooms", "Bedrooms", "Wardrobes", "Custom Furniture"]
    if footer.locator(".footer-services-nav a").all_inner_texts() != expected_services:
        errors.append(f"{width_name}: footer service links do not match the requested labels/order.")
    expected_contacts = ["Phone", "WhatsApp", "Email", "Office"]
    if [label.lower() for label in footer.locator(".footer-contact-label").all_inner_texts()] != [label.lower() for label in expected_contacts]:
        errors.append(f"{width_name}: footer contact channels are incomplete or out of order.")
    active_selectors = {
        "phone": "[data-phone-link]:visible",
        "whatsapp": "[data-wa-link]:visible",
        "email": "[data-email-link]:visible",
        "office": "[data-office-address]:visible",
    }
    for channel, active_selector in active_selectors.items():
        active = footer.locator(active_selector)
        pending = footer.locator(f"[data-{channel}-pending]")
        if not active.count() and not pending.is_visible():
            errors.append(f"{width_name}: footer {channel} needs either a configured value or a pending note.")
    for social in ("instagram", "facebook", "youtube"):
        if not footer.locator(f'[data-social-link="{social}"]:visible, [data-social-pending="{social}"]:visible').count():
            errors.append(f"{width_name}: footer {social} needs an official link or a pending label.")
    copyright = " ".join(footer.locator(".footer-copyright").inner_text().split())
    if copyright != "© 2026 SPM Interiors Design. All Rights Reserved.":
        errors.append(f"{width_name}: footer copyright is incorrect: {copyright}")
    legal = {a.inner_text(): a.get_attribute("href") for a in footer.locator(".footer-legal a").all()}
    if legal != {"Privacy Policy": "/privacy/", "Terms & Conditions": "/terms/"}:
        errors.append(f"{width_name}: footer legal links are incomplete or incorrect.")


def test_configured_footer(browser, errors: list[str]) -> None:
    """Exercise optional settings with in-memory fixture values, never writing them to the project."""
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    values = {
        "spm-contact-phone": "+91 9345633674,+91 7975049950",
        "spm-contact-email": "preview@example.test",
        "spm-whatsapp": "919345633674",
        "spm-office-address": "Chandapur, Bangalore-560099",
        "spm-instagram-url": "https://www.instagram.com/spm_qa/",
        "spm-facebook-url": "https://www.facebook.com/spm_qa/",
        "spm-youtube-url": "https://youtu.be/spm-qa",
    }
    source = (ROOT / "app.js").read_text(encoding="utf-8")
    def serve_app(route):
        fixture = "const v=" + json.dumps(values) + "; for (const [k,x] of Object.entries(v)) { const m=document.querySelector('meta[name=\\\"'+k+'\\\"]'); if(m) m.content=x; }\n"
        route.fulfill(status=200, content_type="application/javascript", body=fixture + source)
    page.route("**/app.js", serve_app)
    page.goto(BASE + "/", wait_until="domcontentloaded")
    page.locator(".site-footer").wait_for()
    phone_links = page.locator(".footer-phone-links [data-phone-link]:visible")
    if [link.inner_text() for link in phone_links.all()] != ["+91 9345633674", "+91 7975049950"]:
        errors.append("Footer did not render separate tap-to-call links for both phone numbers in the QA fixture.")
    phone_hrefs = [link.get_attribute("href") for link in phone_links.all()]
    if phone_hrefs != ["tel:919345633674", "tel:917975049950"]:
        errors.append(f"Footer phone targets are incorrect in the QA fixture: {phone_hrefs}")
    if not page.locator("[data-email-link]:visible").count():
        errors.append("Footer did not activate the configured email in the QA fixture.")
    office = page.locator("[data-office-address]:visible")
    if not page.locator("[data-wa-link]:visible").count() or not office.count() or office.inner_text() != "Chandapur, Bangalore-560099":
        errors.append("Footer did not activate configured WhatsApp/office values in the QA fixture.")
    for social in ("instagram", "facebook", "youtube"):
        link = page.locator(f'[data-social-link="{social}"]:visible')
        if not link.count() or not link.get_attribute("href", timeout=1000).startswith("https://"):
            errors.append(f"Footer did not activate the configured {social} profile in the QA fixture.")
    values["spm-instagram-url"] = "https://not-instagram.example/forged"
    page.reload(wait_until="domcontentloaded")
    if page.locator('[data-social-link="instagram"]:visible').count() or not page.locator('[data-social-pending="instagram"]:visible').count():
        errors.append("Footer accepted an unapproved Instagram host instead of retaining its pending label.")
    context.close()


def main() -> None:
    errors: list[str] = []
    console_errors: list[str] = []
    posts: list[str] = []
    metrics: dict[str, float] = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/bin/chromium", headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"])
        desktop = browser.new_context(viewport={"width": 1440, "height": 960}, device_scale_factor=1)
        page = desktop.new_page()
        page.add_init_script("""(() => { window.__qaVitals = {lcp: 0, cls: 0}; try { new PerformanceObserver(list => list.getEntries().forEach(e => window.__qaVitals.lcp = e.startTime)).observe({type:'largest-contentful-paint', buffered:true}); new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.__qaVitals.cls += e.value; })).observe({type:'layout-shift', buffered:true}); } catch (_) {} })();""")
        page.on("pageerror", lambda error: errors.append(f"desktop page error: {error}"))
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

        response = page.goto(BASE + "/", wait_until="domcontentloaded")
        if not response or response.status != 200:
            errors.append("Home page did not return HTTP 200.")
        page.evaluate("async () => { await document.fonts.ready; return true; }")
        page.wait_for_timeout(1050)
        if page.title() != "Interior Designers in Bangalore | SPM Interiors Design":
            errors.append(f"Unexpected homepage title: {page.title()}")
        expected_phones = ["+91 9345633674", "+91 7975049950"]
        actual_phones = [link.inner_text() for link in page.locator(".footer-phone-links [data-phone-link]:visible").all()]
        if actual_phones != expected_phones:
            errors.append(f"Homepage footer phone values do not match: {actual_phones}")
        email_link = page.locator(".site-footer [data-email-link]:visible")
        if not email_link.count() or email_link.get_attribute("href") != "mailto:spminteriordesigns@gmail.com":
            errors.append("Homepage footer email is missing or incorrect.")
        office = page.locator(".site-footer [data-office-address]:visible")
        if not office.count() or office.inner_text() != "Chandapur, Bangalore-560099":
            errors.append("Homepage footer office location is missing or incorrect.")
        instagram = page.locator('.site-footer [data-social-link="instagram"]:visible')
        if not instagram.count() or instagram.get_attribute("href") != "https://www.instagram.com/spm_interior_designs/":
            errors.append("Homepage footer Instagram profile is missing or incorrect.")
        metrics_band = page.locator(".metrics-band")
        metrics_text = metrics_band.inner_text().lower()
        if "illustrative placeholders" not in metrics_text or "not verified spm data" not in metrics_text:
            errors.append("Trust statistics are missing the clear unverified-placeholder disclosure.")
        expected_metric_labels = ["homes designed", "years experience", "design professionals", "customer rating"]
        if [x.strip().lower() for x in metrics_band.locator(".metric > span").all_inner_texts()] != expected_metric_labels:
            errors.append("Homepage trust-stat labels do not match the requested four metrics.")
        if metrics_band.locator("[data-metric-value]").count() != 4:
            errors.append("Homepage trust-stat values are not configured for viewport animation.")
        service_menu = page.locator(".primary-nav .services-dropdown")
        service_menu.locator("summary").click()
        group_names = [x.strip() for x in service_menu.locator(".nav-services-group h3").all_inner_texts()]
        if [name.lower() for name in group_names] != ["residential", "commercial"]:
            errors.append(f"Services menu groups are incorrect: {group_names}")
        for label in ("Commercial Interiors", "Office Interiors", "Office Furniture", "Retail & Showrooms", "Restaurants & Cafés", "Space-Saving Interiors"):
            if not service_menu.get_by_text(label, exact=True).count():
                errors.append(f"Services menu is missing {label}.")
        service_menu.locator("summary").click()
        counter_context = browser.new_context(viewport={"width": 1280, "height": 600})
        counter_page = counter_context.new_page()
        counter_page.goto(BASE + "/", wait_until="domcontentloaded")
        initially_animated = counter_page.locator(".metrics-band [data-metric-value]").evaluate_all("nodes => nodes.some(n => n.dataset.animated === 'true')")
        if initially_animated:
            errors.append("Trust metrics started animating before entering the viewport.")
        counter_page.locator(".metrics-band").scroll_into_view_if_needed()
        try:
            counter_page.wait_for_function("(() => { const n=[...document.querySelectorAll('.metrics-band [data-metric-value]')]; return n.length===4 && n.every(x=>x.dataset.animated==='true' && ['500+','3+','7+','4.9/5'].includes(x.textContent)); })()", timeout=4000)
        except Exception:
            errors.append("Trust metrics did not animate to the configured sample values after viewport entry.")
        counter_context.close()
        video = page.locator("#sample-interior-video")
        if video.count() != 1:
            errors.append("Homepage sample video is missing.")
        else:
            has_controls = video.evaluate("e => e.hasAttribute('controls') && e.hasAttribute('playsinline')")
            if not has_controls or video.evaluate("e => e.hasAttribute('autoplay') || !e.paused"):
                errors.append("Sample video should have native inline controls and remain paused until visitor interaction.")
            if not video.locator("source[type='video/mp4']").get_attribute("src").endswith("interiorsvideo.mp4"):
                errors.append("Sample video is not using the supplied MP4 asset.")
            if not video.get_attribute("poster").endswith("interiorsvideo-poster.webp"):
                errors.append("Sample video poster is not using the optimized WebP image.")
            try:
                page.wait_for_function("document.querySelector('#sample-interior-video').readyState >= 1", timeout=10000)
                duration = video.evaluate("e => e.duration")
                if not 32.0 <= duration <= 33.5:
                    errors.append(f"Unexpected sample video duration: {duration}")
                video.evaluate("v => { v.muted = true; return v.play(); }")
                page.wait_for_function("document.querySelector('#sample-interior-video').currentTime > 0.1", timeout=4000)
                video.evaluate("v => v.pause()")
                if not video.evaluate("v => v.paused"):
                    errors.append("Sample video did not pause after the playback smoke test.")
            except Exception as error:
                errors.append(f"Sample video metadata did not load: {error}")
        if page.locator("h1").count() != 1:
            errors.append("Homepage should contain exactly one H1.")
        if page.locator("img").evaluate_all("imgs => imgs.filter(i => i.complete && !i.naturalWidth).map(i => i.src)"):
            errors.append("One or more homepage images failed to load.")
        if page.evaluate("document.documentElement.scrollWidth > window.innerWidth"):
            errors.append("Desktop homepage has horizontal overflow.")
        page.screenshot(path=str(ROOT / "qa-desktop.png"), full_page=False)
        metrics = page.evaluate("window.__qaVitals || {}")
        if float(metrics.get("cls", 0)) > 0.10:
            errors.append(f"Desktop homepage CLS exceeded 0.10: {metrics['cls']:.3f}")

        # Comparison tabs must switch both image formats/alt text and the keyboard-operable range.
        page.locator('[data-transform-select="bedroom"]').click()
        if not page.locator("[data-transform-before]").get_attribute("src").endswith("bedroom-before.webp"):
            errors.append("Transformation tabs do not update to the production WebP image.")
        compare = page.locator("[data-compare] .compare-range").first
        compare.evaluate("el => { el.value = '37'; el.dispatchEvent(new Event('input', { bubbles: true })); }")
        if page.locator("[data-compare]").first.evaluate("e => getComputedStyle(e).getPropertyValue('--split').trim()") != "37%":
            errors.append("Before/after slider does not update its split position.")

        # Portfolio filters must leave one category visible and report the selected state.
        page.goto(BASE + "/projects/", wait_until="domcontentloaded")
        page.locator('[data-filter="kitchen"]').click()
        visible = page.locator('[data-project-grid] .project-card:not(.is-hidden)').count()
        total = page.locator('[data-project-grid] .project-card').count()
        if not visible or visible >= total:
            errors.append("Portfolio kitchen filter does not filter concepts correctly.")
        if not page.locator('[data-filter="kitchen"]').get_attribute("aria-pressed") == "true":
            errors.append("Portfolio filter state is not exposed accessibly.")

        # Every static route is checked at desktop, tablet and mobile widths.
        check_routes(page, "desktop", errors)
        tablet = browser.new_context(viewport={"width": 768, "height": 1024}, device_scale_factor=1, is_mobile=True, has_touch=True)
        tablet_page = tablet.new_page()
        tablet_page.on("pageerror", lambda error: errors.append(f"tablet page error: {error}"))
        check_routes(tablet_page, "tablet", errors)
        if not tablet_page.locator(".menu-toggle").is_visible():
            errors.append("Tablet navigation toggle is not visible at 768px.")
        tablet.close()

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        mobile_page = mobile.new_page()
        mobile_page.on("pageerror", lambda error: errors.append(f"mobile page error: {error}"))
        mobile_page.on("request", lambda request: posts.append(request.url) if request.method == "POST" else None)
        mobile_page.goto(BASE + "/", wait_until="domcontentloaded")
        mobile_page.evaluate("async () => { await document.fonts.ready; return true; }")
        mobile_page.wait_for_timeout(1050)
        if mobile_page.evaluate("document.documentElement.scrollWidth > window.innerWidth"):
            errors.append("Mobile homepage has horizontal overflow.")
        if not mobile_page.locator(".menu-toggle").is_visible():
            errors.append("Mobile navigation toggle is not visible.")
        mobile_page.screenshot(path=str(ROOT / "qa-mobile.png"), full_page=False)
        mobile_page.locator(".menu-toggle").click()
        if mobile_page.locator(".mobile-nav").is_hidden() or mobile_page.locator(".menu-toggle").get_attribute("aria-expanded") != "true":
            errors.append("Mobile menu did not open with accessible state.")
        mobile_page.locator('.mobile-nav a[href="/services/"]').click()
        if not mobile_page.url.endswith("/services/"):
            errors.append("Mobile navigation link did not navigate.")
        check_routes(mobile_page, "mobile", errors)
        mobile_page.goto(BASE + "/", wait_until="domcontentloaded")
        mobile_video = mobile_page.locator("#sample-interior-video")
        mobile_video.scroll_into_view_if_needed()
        video_box = mobile_video.bounding_box()
        quick_cta = mobile_page.locator(".mobile-quick-cta")
        if video_box and quick_cta.is_visible():
            cta_box = quick_cta.bounding_box()
            if cta_box and min(video_box["y"] + video_box["height"], cta_box["y"] + cta_box["height"]) > max(video_box["y"], cta_box["y"]):
                errors.append("Mobile fixed consultation CTA overlaps the sample-video controls area.")
        mobile_page.evaluate("window.scrollTo(0, document.querySelector('.site-footer').getBoundingClientRect().top + window.scrollY)")
        mobile_page.wait_for_timeout(150)
        if quick_cta.evaluate("e => e.classList.contains('is-visible')"):
            errors.append("Mobile consultation CTA should hide while the footer is onscreen so it cannot obscure contact/legal details.")
        if mobile_page.locator(".whatsapp-float:visible").count():
            errors.append("Floating WhatsApp should hide while the footer is onscreen so it cannot obscure contact/legal details.")

        # Both enquiry routes must include the service dropdown and selectable INR budget chips.
        service_choices = ["Home Interiors", "Commercial Interiors", "Office Interiors", "Office Furniture", "Space-Saving Interiors", "Modular Kitchen", "Bedroom", "Living Room", "Wardrobe", "Custom Furniture", "Other"]
        budget_choices = ["Under ₹5 Lakhs", "₹5–10 Lakhs", "₹10–15 Lakhs", "₹15–20 Lakhs", "₹20 Lakhs+"]
        form = None
        for form_route in ("/contact/", "/consultation/"):
            mobile_page.goto(BASE + form_route, wait_until="domcontentloaded")
            current_form = mobile_page.locator("[data-lead-form]")
            if current_form.count() != 1:
                errors.append(f"{form_route} should contain exactly one enquiry form.")
                continue
            if current_form.locator('[name="service"] option').all_inner_texts()[1:] != service_choices:
                errors.append(f"{form_route} is missing one or more requested service choices.")
            if current_form.locator(".budget-chip span").all_inner_texts() != budget_choices:
                errors.append(f"{form_route} budget chips do not match the five requested INR ranges.")
            current_form.locator('[name="service"]').select_option(label="Commercial Interiors")
            current_form.locator(".budget-chip").nth(1).click()
            if current_form.locator('[name="service"]').input_value() != "Commercial Interiors" or not current_form.locator('[name="budget"]:checked').count():
                errors.append(f"{form_route} service/budget choices are not interactively selectable.")
            form = current_form
        if not form:
            errors.append("No working enquiry form was found for the no-endpoint submission test.")
            mobile_page.goto(BASE + "/contact/", wait_until="domcontentloaded")
            form = mobile_page.locator("[data-lead-form]")
        required_fields = ["name", "phone", "location", "bedrooms", "timeline"]
        for field in required_fields:
            if form.locator(f'[name="{field}"]').count() != 1:
                errors.append(f"Consultation form is missing field: {field}")
        whatsapp_link = mobile_page.locator(".site-footer [data-wa-link]:visible")
        if not whatsapp_link.count() or not (whatsapp_link.first.get_attribute("href") or "").startswith("https://wa.me/919345633674"):
            errors.append("The contact footer WhatsApp link does not use the configured +91 9345633674 number.")
        if mobile_page.locator(".whatsapp-float:visible").count():
            errors.append("The fixed WhatsApp pill should not cover fields on enquiry pages.")
        if mobile_page.locator(".mobile-quick-cta:visible").count():
            errors.append("The fixed mobile consultation bar should not cover enquiry form fields.")
        form.locator('[name="name"]').fill("Test Enquiry")
        form.locator('[name="phone"]').fill("+91 98765 43210")
        form.locator('[name="location"]').fill("Bangalore")
        form.locator('[type="submit"]').click()
        status = form.locator("[data-form-status]")
        status.wait_for()
        if "not been sent or stored" not in status.inner_text():
            errors.append("Form did not clearly explain that no configured endpoint received the submission.")
        if posts:
            errors.append(f"Unconfigured form unexpectedly issued POST requests: {posts}")

        # Reduced-motion preference should suppress long entrance/loop animations and reveal content immediately.
        reduce_context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", is_mobile=True, has_touch=True)
        reduce_page = reduce_context.new_page()
        reduce_page.goto(BASE + "/", wait_until="domcontentloaded")
        reduce_page.wait_for_timeout(100)
        reveal_opacity = float(reduce_page.locator(".manifesto-copy").evaluate("e => getComputedStyle(e).opacity"))
        duration = reduce_page.locator(".hero-image img").evaluate("e => { const s=getComputedStyle(e).animationDuration; const n=parseFloat(s)||0; return s.endsWith('ms') ? n/1000 : n; }")
        if reveal_opacity < 0.99:
            errors.append("Reduced-motion content was not immediately visible.")
        if duration > 0.001:
            errors.append(f"Reduced-motion hero animation remains active for {duration}s.")
        reduce_page.locator(".metrics-band").scroll_into_view_if_needed()
        try:
            reduce_page.wait_for_function("[...document.querySelectorAll('.metrics-band [data-metric-value]')].every(n => n.dataset.animated === 'true' && ['500+','3+','7+','4.9/5'].includes(n.textContent))", timeout=1000)
        except Exception:
            errors.append("Reduced-motion preference did not present the final trust figures immediately on viewport entry.")
        reduce_context.close()
        test_configured_footer(browser, errors)
        mobile.close()
        desktop.close()
        browser.close()

    if console_errors:
        errors.extend(f"browser console: {msg}" for msg in console_errors if "fonts.googleapis.com" not in msg and "fonts.gstatic.com" not in msg)
    if errors:
        print("BROWSER QA FAILED:")
        for error in errors:
            print("-", error)
        raise SystemExit(1)
    print(f"PASS: {len(ROUTES)} routes checked at desktop, tablet and mobile sizes; images, navigation, galleries, filters, comparisons and sample video.")
    print("PASS: reduced-motion preference and the no-endpoint consultation form behave honestly; no lead POST was sent.")
    print("PASS: footer configuration activates verified contact/social values and rejects an unapproved profile host.")
    print(f"Home-page lab vitals (local preview): LCP={metrics.get('lcp', 0):.0f} ms, CLS={metrics.get('cls', 0):.3f}; lab results are environment-specific.")
    print(f"Screenshots: {ROOT / 'qa-desktop.png'} and {ROOT / 'qa-mobile.png'}")


if __name__ == "__main__":
    main()
