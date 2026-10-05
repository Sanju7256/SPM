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

  const updateScrollState = () => {
    const scrolled = window.scrollY > 36;
    const footerRect = document.querySelector('.site-footer')?.getBoundingClientRect();
    const footerInView = Boolean(footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0);
    header?.classList.toggle('is-scrolled', scrolled);
    quickCta?.classList.toggle('is-visible', scrolled && window.innerWidth <= 820 && !footerInView);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setMenu(false);
    updateScrollState();
  });

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
  if ('IntersectionObserver' in window && revealNodes.length && !reducedMotion) {
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

  // The custom cursor is a desktop-only decorative enhancement.
  const cursor = document.querySelector('[data-cursor-orb]');
  const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (pointerFine && !reducedMotion) {
    document.querySelectorAll('.service-card-image, .project-card-image').forEach((target) => {
      const image = target.querySelector('img');
      if (!image) return;
      target.addEventListener('pointermove', (event) => {
        const bounds = target.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        image.style.setProperty('--follow-x', `${(x * 8).toFixed(1)}px`);
        image.style.setProperty('--follow-y', `${(y * 8).toFixed(1)}px`);
      }, { passive: true });
      target.addEventListener('pointerleave', () => {
        image.style.setProperty('--follow-x', '0px');
        image.style.setProperty('--follow-y', '0px');
      });
    });
  }
  if (cursor && pointerFine && !reducedMotion) {
    let cursorX = 0;
    let cursorY = 0;
    let frame = 0;
    document.addEventListener('pointermove', (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (!frame) frame = requestAnimationFrame(() => {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        frame = 0;
      });
    }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach((target) => {
      target.addEventListener('pointerenter', () => {
        cursor.textContent = target.dataset.cursor || 'VIEW';
        cursor.classList.add('is-visible');
      });
      target.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    });
  }
})();
