import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { config, telHref, type SocialPlatform } from '../config';
import { animatePage, getMotion } from '../motion';
import { getMeta } from '../seo';
import { Arrow, Icon, WhatsAppGlyph } from './Icons';

const NAV_ITEMS: [string, string][] = [
  ['Home', '/'], ['About', '/about/'], ['Services', '/services/'],
  ['Projects', '/projects/'], ['Process', '/process/'], ['Blog', '/journal/'], ['Contact', '/contact/'],
];

const SERVICE_NAV_GROUPS: [string, [string, string][]][] = [
  ['Residential', [
    ['Complete Home Interiors', '/services/complete-home-interiors/'],
    ['Modular Kitchens', '/services/modular-kitchens/'],
    ['Living Room', '/services/living-rooms/'],
    ['Bedroom', '/services/bedrooms/'],
    ['Wardrobes', '/services/wardrobes-storage/'],
    ['Bathroom Interiors', '/services/bathrooms/'],
    ['False Ceiling & Lighting', '/services/lighting-ceilings/'],
    ['Custom Furniture', '/services/custom-furniture/'],
    ['Space-Saving Interiors', '/services/space-saving-interiors/'],
  ]],
  ['Commercial', [
    ['Commercial Interiors', '/services/commercial-interiors/'],
    ['Office Interiors', '/services/commercial-interiors/#office-interiors'],
    ['Office Furniture', '/services/office-furniture/'],
    ['Retail & Showrooms', '/services/commercial-interiors/#retail-showrooms'],
    ['Restaurants & Cafés', '/services/commercial-interiors/#restaurants-cafes'],
  ]],
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label="SPM Interiors Design home">
      <span className="brand-main">SPM</span><span className="brand-sub">Interiors Design</span>
    </Link>
  );
}

function ServicesMenu({ mobile = false, pathname }: { mobile?: boolean; pathname: string }) {
  const [open, setOpen] = useState(mobile);
  const closeTimer = useRef(0);
  const ref = useRef<HTMLDetailsElement>(null);
  const hover = (next: boolean) => {
    if (mobile || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    window.clearTimeout(closeTimer.current);
    if (next) setOpen(true);
    else closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => { if (!mobile) setOpen(false); }, [pathname, mobile]);
  useEffect(() => {
    if (mobile) return undefined;
    const onClick = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && ref.current?.open) {
        setOpen(false);
        ref.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [mobile]);

  const inServices = pathname.startsWith('/services');
  return (
    <details className="services-dropdown" open={open} ref={ref} onMouseEnter={() => hover(true)} onMouseLeave={() => hover(false)}
      onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="services-trigger" aria-current={inServices ? 'page' : undefined}>Services <Icon name="chevron" /></summary>
      <div className="nav-services-menu">
        <NavLink className="nav-services-all" to="/services/" end>All services <Arrow /></NavLink>
        <div className="nav-services-groups">
          {SERVICE_NAV_GROUPS.map(([group, items]) => (
            <nav className="nav-services-group" aria-label={`${group} services`} key={group}>
              <h3>{group}</h3>
              {items.map(([label, href]) => <Link key={label} to={href} aria-current={!href.includes('#') && pathname === href ? 'page' : undefined}>{label}</Link>)}
            </nav>
          ))}
        </div>
      </div>
    </details>
  );
}

function NavLinks({ mobile = false, pathname }: { mobile?: boolean; pathname: string }) {
  return (
    <>
      {NAV_ITEMS.map(([label, href]) => label === 'Services'
        ? <ServicesMenu key={label} mobile={mobile} pathname={pathname} />
        : <NavLink key={label} to={href} end={href === '/'}>{label}</NavLink>)}
    </>
  );
}

function SocialItem({ platform, label }: { platform: SocialPlatform; label: string }) {
  const url = config.social[platform];
  if (url) {
    return <a className="social-chip" data-social-link={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={`SPM Interiors Design on ${label}`}><Icon name={platform} /></a>;
  }
  return (
    <span className="social-chip is-pending" data-social-pending={platform} title={`${label} profile to be confirmed`}>
      <Icon name={platform} /><span className="sr-only">{label} profile to be confirmed</span>
    </span>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main wrap">
        <div className="footer-brand">
          <Logo light />
          <p>Thoughtful, functional interiors for homes and workplaces across Bangalore and South India.</p>
          <section className="footer-social-block" aria-labelledby="footer-social-heading">
            <h3 id="footer-social-heading" className="sr-only">Social</h3>
            <nav className="footer-social-list" aria-label="Social media">
              <SocialItem platform="instagram" label="Instagram" />
              <SocialItem platform="facebook" label="Facebook" />
              <SocialItem platform="youtube" label="YouTube" />
            </nav>
          </section>
          <Link className="button button-accent footer-start" to="/consultation/">Book a consultation <Arrow /></Link>
        </div>
        <nav className="footer-column footer-primary-nav" aria-label="Footer navigation">
          <h3>Explore</h3>
          {NAV_ITEMS.map(([label, href]) => <Link key={label} to={href}>{label}</Link>)}
        </nav>
        <nav className="footer-column footer-services-nav" aria-label="Interior design services">
          <h3>Services</h3>
          <Link to="/services/complete-home-interiors/">Home Interiors</Link>
          <Link to="/services/modular-kitchens/">Kitchens</Link>
          <Link to="/services/living-rooms/">Living Rooms</Link>
          <Link to="/services/bedrooms/">Bedrooms</Link>
          <Link to="/services/wardrobes-storage/">Wardrobes</Link>
          <Link to="/services/custom-furniture/">Custom Furniture</Link>
        </nav>
        <section className="footer-column footer-contact-block" aria-labelledby="footer-contact-heading">
          <h3 id="footer-contact-heading">Contact</h3>
          <div className="footer-contact-list">
            <div className="footer-contact-row"><Icon name="phone" /><div>
              <span className="footer-contact-label">Phone</span>
              {config.phones.length
                ? <div className="footer-phone-links">{config.phones.map((n) => <a key={n} className="footer-contact-phone" data-phone-link href={telHref(n)} aria-label={`Call SPM Interiors Design at ${n}`}>{n}</a>)}</div>
                : <span className="footer-pending" data-phone-pending>Details to be confirmed</span>}
            </div></div>
            <div className="footer-contact-row"><Icon name="chat" /><div>
              <span className="footer-contact-label">WhatsApp</span>
              {config.whatsappUrl
                ? <a data-wa-link href={config.whatsappUrl} target="_blank" rel="noopener noreferrer">Message the studio <Arrow /></a>
                : <span className="footer-pending" data-whatsapp-pending>Number to be confirmed</span>}
            </div></div>
            <div className="footer-contact-row"><Icon name="mail" /><div>
              <span className="footer-contact-label">Email</span>
              {config.email
                ? <a data-email-link href={`mailto:${config.email}`}>{config.email}</a>
                : <span className="footer-pending" data-email-pending>Details to be confirmed</span>}
            </div></div>
            <div className="footer-contact-row"><Icon name="pin" /><div>
              <span className="footer-contact-label">Office</span>
              {config.office
                ? <span data-office-address>{config.office}</span>
                : <span className="footer-pending" data-office-pending>Office details to be confirmed</span>}
            </div></div>
          </div>
        </section>
      </div>
      <div className="footer-bottom wrap">
        <p className="footer-copyright">© <FooterYear /> SPM Interiors Design. All Rights Reserved.</p>
        <nav className="footer-legal" aria-label="Legal information"><Link to="/privacy/">Privacy Policy</Link><Link to="/terms/">Terms &amp; Conditions</Link></nav>
      </div>
      <p className="footer-demo-note wrap">Concept imagery is illustrative. The trust figures are visibly marked as unverified placeholders; do not treat them as SPM results until confirmed. Testimonials and other claims require approval.</p>
      <div className="footer-wordmark" aria-hidden="true"><span>SPM Interiors</span></div>
    </footer>
  );
}

function FooterYear() {
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span data-year>{year}</span>;
}

export function Layout() {
  const { pathname, hash } = useLocation();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [quickCta, setQuickCta] = useState(false);
  const [waObscured, setWaObscured] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const motionRef = useRef<Awaited<ReturnType<typeof getMotion>>>(null);

  // Document title and description follow client-side navigation.
  useEffect(() => {
    const meta = getMeta(pathname);
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  }, [pathname]);

  // New page: close the menu, then jump to the top or to the requested anchor.
  useIsomorphicLayoutEffect(() => {
    setMenuOpen(false);
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    const lenis = motionRef.current?.lenis;
    if (target) {
      window.setTimeout(() => {
        const offset = (document.querySelector('.site-header') as HTMLElement | null)?.offsetHeight ?? 0;
        if (lenis) lenis.scrollTo(target, { offset: -offset - 8 });
        else target.scrollIntoView();
      }, 60);
    } else if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Scroll motion is rebuilt for each page and reverted before the next.
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    getMotion().then((motion) => {
      motionRef.current = motion;
      if (cancelled || !motion || !mainRef.current) return;
      cleanup = animatePage(motion, mainRef.current);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  // Header: transparent over the home hero, hides on scroll down, returns on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const footer = document.querySelector('.site-footer')?.getBoundingClientRect();
      const footerInView = Boolean(footer && footer.top < window.innerHeight && footer.bottom > 0);
      const dropdownOpen = Boolean(document.querySelector('.primary-nav .services-dropdown[open]'));
      setScrolled(y > 36);
      if (y > 320 && y > last + 4 && !document.body.classList.contains('menu-open') && !dropdownOpen) setHeaderHidden(true);
      else if (y < last - 4 || y <= 320) setHeaderHidden(false);
      last = y;
      setQuickCta(y > 36 && !document.querySelector('[data-lead-form]') && window.innerWidth <= 768 && !footerInView);
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false);
      update();
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
    };
  }, [pathname]);

  // Menu: lock page scroll, move focus in, close on Escape.
  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
    const lenis = motionRef.current?.lenis;
    if (lenis) {
      if (menuOpen) lenis.stop();
      else lenis.start();
    }
    if (menuOpen) mobileNav.current?.querySelector('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Keep the floating WhatsApp button off forms and the footer contact/legal details.
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-lead-form], .site-footer'));
    if (!targets.length || !('IntersectionObserver' in window)) return undefined;
    const state = new Map(targets.map((node) => [node, false]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => state.set(entry.target, entry.isIntersecting));
      setWaObscured([...state.values()].some(Boolean));
    });
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  const headerClass = ['site-header', isHome && 'is-over-hero', scrolled && 'is-scrolled', headerHidden && !menuOpen && 'is-hidden'].filter(Boolean).join(' ');

  return (
    <div className={isHome ? 'page-home' : 'page-inner'}>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className={headerClass} data-header>
        <div className="header-inner">
          <Logo />
          <nav className="primary-nav" aria-label="Primary navigation"><NavLinks pathname={pathname} /></nav>
          <div className="header-actions">
            <Link className="header-cta" to="/consultation/">Book a consultation <Arrow /></Link>
            <button ref={menuButton} className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen((open) => !open)}>
              <span className="menu-toggle-label">{menuOpen ? 'Close' : 'Menu'}</span>
              <span className="menu-toggle-lines" aria-hidden="true"><span /><span /></span>
            </button>
          </div>
        </div>
      </header>
      <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" data-lenis-prevent hidden={!menuOpen} ref={mobileNav}
        onClick={(event) => { if ((event.target as HTMLElement).closest('a')) setMenuOpen(false); }}>
        <div className="mobile-nav-inner">
          <div className="mobile-nav-links"><NavLinks mobile pathname={pathname} /></div>
          <div className="mobile-nav-footer">
            <Link className="mobile-nav-cta" to="/consultation/">Book a consultation <Arrow /></Link>
            <div className="mobile-nav-contact">
              {config.whatsappUrl ? <a href={config.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppGlyph /><span>WhatsApp</span></a> : null}
              {config.email ? <a href={`mailto:${config.email}`}>{config.email}</a> : null}
            </div>
          </div>
        </div>
      </nav>
      <main id="main" ref={mainRef}><Outlet /></main>
      <Footer />
      {config.whatsappUrl ? (
        <a className={`whatsapp-float${waObscured ? ' is-obscured' : ''}`} data-whatsapp-link href={config.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with SPM Interiors Design on WhatsApp">
          <span className="whatsapp-float-icon"><WhatsAppGlyph /></span><span className="whatsapp-float-label">Chat with us</span>
        </a>
      ) : null}
      <div className={`mobile-quick-cta${quickCta ? ' is-visible' : ''}${config.whatsappUrl ? '' : ' is-solo'}`}><Link to="/consultation/">Book a consultation <Arrow /></Link></div>
    </div>
  );
}
