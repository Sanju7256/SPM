(() => {
  document.documentElement.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const quickCta = document.querySelector('.mobile-quick-cta');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  const setMenu = (open) => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    if (open) mobileNav.querySelector('a')?.focus();
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileNav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });

  const hasLeadForm = Boolean(document.querySelector('[data-lead-form]'));
  let lastScrollY = window.scrollY;
  const updateScrollState = () => {
    const y = window.scrollY;
    const scrolled = y > 36;
    const footerRect = document.querySelector('.site-footer')?.getBoundingClientRect();
    const footerInView = Boolean(footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0);
    header?.classList.toggle('is-scrolled', scrolled);
    const menuOpen = document.body.classList.contains('menu-open');
    const dropdownOpen = Boolean(document.querySelector('.primary-nav .services-dropdown[open]'));
    if (y > 320 && y > lastScrollY + 4 && !menuOpen && !dropdownOpen) header?.classList.add('is-hidden');
    else if (y < lastScrollY - 4 || y <= 320) header?.classList.remove('is-hidden');
    lastScrollY = y;
    quickCta?.classList.toggle('is-visible', scrolled && !hasLeadForm && window.innerWidth <= 768 && !footerInView);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) setMenu(false);
    updateScrollState();
  });

  const desktopDropdown = document.querySelector('.primary-nav .services-dropdown');
  if (desktopDropdown) {
    let closeTimer = 0;
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
    desktopDropdown.addEventListener('mouseenter', () => {
      if (!hoverCapable.matches) return;
      clearTimeout(closeTimer);
      desktopDropdown.open = true;
    });
    desktopDropdown.addEventListener('mouseleave', () => {
      if (!hoverCapable.matches) return;
      closeTimer = window.setTimeout(() => { desktopDropdown.open = false; }, 180);
    });
    document.addEventListener('click', (event) => {
      if (desktopDropdown.open && !desktopDropdown.contains(event.target)) desktopDropdown.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && desktopDropdown.open) {
        desktopDropdown.open = false;
        desktopDropdown.querySelector('summary')?.focus();
      }
    });
  }

  const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
    const active = href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`);
    if (active) link.setAttribute('aria-current', 'page');
  });
  if (currentPath === '/services' || currentPath.startsWith('/services/')) {
    document.querySelectorAll('.services-dropdown > summary').forEach((summary) => summary.setAttribute('aria-current', 'page'));
  }
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  const revealNodes = document.querySelectorAll('[data-reveal]');
  const gsapReady = Boolean(window.gsap && window.ScrollTrigger) && !reducedMotion;
  if (!gsapReady) document.documentElement.classList.add('no-gsap');
  if (gsapReady) {
    // Revealed by the scroll-motion section at the end of this file.
  } else if ('IntersectionObserver' in window && revealNodes.length && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealNodes.forEach((node) => revealObserver.observe(node));
  } else revealNodes.forEach((node) => node.classList.add('is-visible'));

  // Configured figures animate only on viewport entry; page copy states whether they are placeholders or verified.
  const metricNodes = document.querySelectorAll('[data-metric-value]');
  const animateMetric = (node) => {
    if (node.dataset.animated) return;
    node.dataset.animated = 'true';
    const end = Number(node.dataset.metricValue);
    if (!Number.isFinite(end)) return;
    const suffix = node.dataset.metricSuffix || '';
    const decimals = String(node.dataset.metricValue).includes('.') ? 1 : 0;
    if (reducedMotion) {
      node.textContent = `${end.toFixed(decimals)}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = end * eased;
      node.textContent = `${value.toFixed(progress === 1 ? decimals : 0)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && metricNodes.length) {
    const metricObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateMetric(entry.target);
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.45 });
    metricNodes.forEach((node) => metricObserver.observe(node));
  } else metricNodes.forEach(animateMetric);

  // Keyboard, mouse and touch are all supported by native range controls.
  document.querySelectorAll('[data-compare]').forEach((comparison) => {
    const range = comparison.querySelector('.compare-range');
    const update = () => {
      if (!range) return;
      comparison.style.setProperty('--split', `${range.value}%`);
      range.setAttribute('aria-valuetext', `Before ${range.value} percent, after ${100 - Number(range.value)} percent`);
    };
    range?.addEventListener('input', update);
    range?.addEventListener('change', update);
    update();
  });

  const transformStage = document.querySelector('[data-transform-image]');
  const transformTitle = document.querySelector('[data-transform-title]');
  const transformBefore = document.querySelector('[data-transform-before]');
  const transformAfter = document.querySelector('[data-transform-after]');
  document.querySelectorAll('[data-transform-select]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!transformStage || !transformBefore || !transformAfter) return;
      const key = button.dataset.transformSelect;
      const before = transformStage.dataset[`${key}Before`];
      const after = transformStage.dataset[`${key}After`];
      if (!before || !after) return;
      transformBefore.src = `/assets/${before}`;
      transformAfter.src = `/assets/${after}`;
      transformBefore.alt = transformStage.dataset[`${key}BeforeAlt`] || `${key} before concept`;
      transformAfter.alt = transformStage.dataset[`${key}AfterAlt`] || `${key} after concept`;
      document.querySelectorAll('[data-transform-select]').forEach((item) => {
        const active = item === button;
        item.setAttribute('aria-pressed', String(active));
      });
      const label = button.textContent.trim();
      if (transformTitle) transformTitle.textContent = label;
      const range = transformStage.querySelector('.compare-range');
      if (range) {
        range.setAttribute('aria-label', `Adjust the ${label.toLowerCase()} before and after comparison`);
        range.value = '50';
        transformStage.style.setProperty('--split', '50%');
      }
    });
  });

  // Portfolio category filters.
  const filterButtons = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('[data-project-grid] .project-card');
  const filterEmpty = document.querySelector('[data-filter-empty]');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      let visible = 0;
      projectCards.forEach((card) => {
        const tags = (card.dataset.tags || '').split(/\s+/);
        const show = filter === 'all' || tags.includes(filter);
        card.classList.toggle('is-hidden', !show);
        card.setAttribute('aria-hidden', String(!show));
        visible += show ? 1 : 0;
      });
      if (filterEmpty) filterEmpty.hidden = visible > 0;
    });
  });

  // Client-story carousel remains explicitly placeholder-labelled until real feedback is supplied.
  const slides = Array.from(document.querySelectorAll('[data-testimonial]'));
  const slideCount = document.querySelector('[data-slide-count]');
  if (slides.length) {
    let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    const showSlide = (index) => {
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === activeSlide;
        slide.hidden = !active;
        slide.classList.toggle('is-active', active);
      });
      if (slideCount) slideCount.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };
    document.querySelector('[data-slide="prev"]')?.addEventListener('click', () => showSlide(activeSlide - 1));
    document.querySelector('[data-slide="next"]')?.addEventListener('click', () => showSlide(activeSlide + 1));
    showSlide(activeSlide);
  }

  // Mark the process step currently being read.
  const processSteps = document.querySelectorAll('[data-process-step]');
  if ('IntersectionObserver' in window && processSteps.length) {
    const processObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        processSteps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
      }
    }), { threshold: 0.58 });
    processSteps.forEach((step) => processObserver.observe(step));
  }

  // Contact and social channels remain placeholders until the owner configures verified public details.
  const getMeta = (name) => document.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
  const email = getMeta('spm-contact-email');
  const phone = getMeta('spm-contact-phone');
  const officeAddress = getMeta('spm-office-address');
  const digits = (value) => value.replace(/\D/g, '');
  const waNumber = digits(getMeta('spm-whatsapp'));
  const hidePending = (channel) => document.querySelectorAll(`[data-${channel}-pending]`).forEach((node) => { node.hidden = true; });
  let hasContact = false;
  document.querySelectorAll('[data-email-link]').forEach((link) => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      link.href = `mailto:${email}`;
      link.textContent = email;
      link.hidden = false;
      hidePending('email');
      hasContact = true;
    }
  });
  const phoneNumbers = phone.split(/[,;\n]+/).map((number) => number.trim()).filter((number) => {
    const count = digits(number).length;
    return count >= 7 && count <= 15;
  });
  document.querySelectorAll('[data-phone-links]').forEach((container) => {
    if (!phoneNumbers.length) return;
    container.replaceChildren();
    phoneNumbers.forEach((number) => {
      const link = document.createElement('a');
      link.setAttribute('data-phone-link', '');
      link.classList.add(container.classList.contains('footer-phone-links') ? 'footer-contact-phone' : 'contact-configured');
      link.href = `tel:${digits(number)}`;
      link.textContent = number;
      link.setAttribute('aria-label', `Call SPM Interiors Design at ${number}`);
      container.appendChild(link);
    });
    container.hidden = false;
    hidePending('phone');
    hasContact = true;
  });
  if (waNumber.length >= 8 && waNumber.length <= 15) {
    const message = encodeURIComponent('Hello SPM Interiors Design, I would like to discuss my home interior project.');
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;
    document.querySelectorAll('[data-wa-link], [data-whatsapp-link]').forEach((link) => {
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.hidden = false;
      hasContact = true;
    });
    hidePending('whatsapp');
  }
  if (officeAddress) {
    document.querySelectorAll('[data-office-address]').forEach((node) => {
      node.textContent = officeAddress;
      node.hidden = false;
    });
    hidePending('office');
    hasContact = true;
  }

  const socialHosts = {
    instagram: new Set(['instagram.com', 'www.instagram.com']),
    facebook: new Set(['facebook.com', 'www.facebook.com']),
    youtube: new Set(['youtube.com', 'www.youtube.com', 'youtu.be'])
  };
  Object.entries(socialHosts).forEach(([platform, allowedHosts]) => {
    const rawUrl = getMeta(`spm-${platform}-url`);
    if (!rawUrl) return;
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname.toLowerCase()) || url.username || url.password) return;
      document.querySelectorAll(`[data-social-link="${platform}"]`).forEach((link) => {
        link.href = url.href;
        link.hidden = false;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      });
      document.querySelectorAll(`[data-social-pending="${platform}"]`).forEach((node) => { node.hidden = true; });
      hasContact = true;
    } catch (_) { /* Keep the placeholder for malformed official profile URLs. */ }
  });
  if (hasContact) document.querySelectorAll('[data-contact-empty]').forEach((node) => { node.hidden = true; });

  // Avoid placing the floating WhatsApp pill over long forms or footer contact/legal details.
  const whatsappFloat = document.querySelector('.whatsapp-float');
  const whatsappObstructions = [...document.querySelectorAll('[data-lead-form], .site-footer')];
  if (whatsappFloat && whatsappObstructions.length && 'IntersectionObserver' in window) {
    const intersecting = new Map(whatsappObstructions.map((node) => [node, false]));
    const obstructionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => intersecting.set(entry.target, entry.isIntersecting));
      whatsappFloat.classList.toggle('is-obscured', [...intersecting.values()].some(Boolean));
    }, { threshold: 0 });
    whatsappObstructions.forEach((node) => obstructionObserver.observe(node));
  }

  document.querySelectorAll('[data-future-date]').forEach((input) => {
    const today = new Date();
    input.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  });

  // This site deliberately does not fake a successful lead submission. A real HTTPS endpoint must be configured.
  const endpoint = getMeta('spm-lead-endpoint');
  const allowedEndpoint = (() => {
    try {
      const url = new URL(endpoint, window.location.href);
      return url.protocol === 'https:' || (url.hostname === 'localhost' && url.protocol === 'http:') ? url.href : '';
    } catch (_) { return ''; }
  })();
  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('[type="submit"]');
      if (!form.reportValidity()) {
        status.textContent = 'Please check the highlighted fields and try again.';
        status.classList.add('is-error');
        return;
      }
      const phoneInput = form.elements.namedItem('phone');
      if (phoneInput && digits(phoneInput.value).length < 7) {
        phoneInput.setCustomValidity('Please enter at least 7 digits for your phone number.');
        phoneInput.reportValidity();
        phoneInput.setCustomValidity('');
        status.textContent = 'Please enter a valid phone number.';
        status.classList.add('is-error');
        return;
      }
      if (form.elements.namedItem('website')?.value) {
        status.textContent = 'Your request could not be processed.';
        status.classList.add('is-error');
        return;
      }
      status.classList.remove('is-error');
      if (!allowedEndpoint) {
        status.textContent = 'This preview is not connected to a secure enquiry service. Your information has not been sent or stored.';
        status.classList.add('is-error');
        status.focus();
        return;
      }
      const payload = Object.fromEntries(new FormData(form).entries());
      delete payload.website;
      payload.page = window.location.pathname;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      status.textContent = 'Sending your enquiry…';
      try {
        const response = await fetch(allowedEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Enquiry endpoint returned ${response.status}`);
        form.reset();
        status.textContent = 'Thank you — the SPM Interiors Design team will contact you shortly.';
      } catch (error) {
        status.textContent = 'We could not send your enquiry just now. Please try again later or use a configured contact channel.';
        status.classList.add('is-error');
      } finally {
        submit.disabled = false;
        submit.removeAttribute('aria-busy');
        status.focus();
      }
    });
  });

  // Scroll motion: GSAP + ScrollTrigger (with Lenis smooth scrolling) when allowed; static, fully visible content otherwise.
  const root = document.documentElement;
  if (!gsapReady) {
    root.classList.add('is-loaded', 'motion-ready');
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'expo.out', duration: 1.1 });

  if (window.Lenis) {
    const lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
      link.addEventListener('click', (event) => {
        const id = link.getAttribute('href').slice(1);
        const target = id && document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -(header?.offsetHeight || 0) - 8 });
      });
    });
  }

  // Wrap each <br>-separated heading line in a mask so it can slide up into view.
  const splitLines = (heading) => {
    if (heading.querySelector('.line')) return heading.querySelectorAll('.line-inner');
    heading.innerHTML = heading.innerHTML.split(/<br\s*\/?>/i)
      .map((part) => `<span class="line"><span class="line-inner">${part.trim()}</span></span>`).join('');
    return heading.querySelectorAll('.line-inner');
  };

  // Home hero entrance and scroll-out parallax.
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroImage = hero.querySelector('.hero-image img');
    gsap.timeline({ defaults: { duration: 1.4 } })
      .fromTo(heroImage, { scale: 1.18 }, { scale: 1, duration: 2.4 }, 0)
      .to(hero.querySelectorAll('h1 .line-inner'), { y: 0, yPercent: 0, stagger: 0.12 }, 0.2)
      .to(hero.querySelector('.eyebrow'), { opacity: 1, duration: 1 }, 0.35)
      .fromTo([hero.querySelector('.hero-lede'), hero.querySelector('.hero-actions'), hero.querySelector('.hero-bottomline')],
        { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12 }, 0.6);
    gsap.to(heroImage.parentElement, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(hero.querySelector('.hero-copy'), { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'center center', end: 'bottom top', scrub: true } });
  }

  // Inner-page H1 lines rise in on load.
  document.querySelectorAll('main h1').forEach((heading) => {
    if (heading.closest('.hero')) return;
    gsap.fromTo(splitLines(heading), { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 1.3, delay: 0.15 });
  });

  // Section headings: line-by-line mask reveal as they enter.
  document.querySelectorAll('main h2').forEach((heading) => {
    if (heading.closest('.article-body, .legal-copy, .hero')) return;
    const lines = splitLines(heading);
    gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 1.2, scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
  });

  // Generic content reveal, batched so cards in a row stagger together.
  const showBatch = (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, overwrite: true });
  ScrollTrigger.batch('[data-reveal]', { start: 'top 90%', once: true, onEnter: showBatch });

  // Feature images drift slightly slower than the page.
  document.querySelectorAll('.inner-hero-image, .service-detail-image, .project-detail-image, .process-hero-art, .journal-hero-image, .contact-visual, .consultation-image, .materials-image, .article-hero-image').forEach((frame) => {
    const image = frame.querySelector('img');
    if (!image) return;
    gsap.fromTo(image, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Process timelines fill step by step while the list scrolls through.
  document.querySelectorAll('.process-steps').forEach((list) => {
    const steps = list.querySelectorAll('li');
    const timeline = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } });
    steps.forEach((step) => timeline.fromTo(step, { '--p': 0 }, { '--p': 1, ease: 'none', duration: 1 }));
  });

  // Turnkey stages and material chips cascade in.
  gsap.utils.toArray('.turnkey-flow li, .materials-list li, .included-list li').forEach((item) => {
    gsap.from(item, { opacity: 0, x: -24, duration: 0.9, scrollTrigger: { trigger: item, start: 'top 92%', once: true } });
  });

  // Marquee speeds up and reverses with scroll direction.
  const marqueeTrack = document.querySelector('[data-marquee]');
  if (marqueeTrack) {
    marqueeTrack.style.animation = 'none';
    const loop = gsap.to(marqueeTrack, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        gsap.to(loop, { timeScale: self.direction * Math.max(1, Math.abs(boost)), duration: 0.3, overwrite: true });
      },
    });
  }

  // Desktop: the homepage services row scrolls horizontally while the section is pinned.
  const media = gsap.matchMedia();
  media.add('(min-width: 1025px) and (min-height: 700px)', () => {
    const section = document.querySelector('.services-section');
    const track = section?.querySelector('.services-grid');
    if (!section || !track) return undefined;
    section.classList.add('is-horizontal');
    const distance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: () => (section.offsetHeight > window.innerHeight ? 'top top' : 'center center'),
        end: () => `+=${distance()}`,
        pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
      section.classList.remove('is-horizontal');
    };
  });

  // Footer wordmark rises as the page ends.
  const wordmark = document.querySelector('.footer-wordmark span');
  if (wordmark) {
    gsap.fromTo(wordmark, { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  root.classList.add('motion-ready');
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
