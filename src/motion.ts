// GSAP + ScrollTrigger scroll motion with Lenis smooth scrolling.
// Everything here only animates transforms/opacity/styles: React-owned nodes are never moved or rewrapped,
// and each page's animations are reverted through a gsap.context when the route changes.
import type Lenis from 'lenis';

type GsapModule = typeof import('gsap');
type Motion = { gsap: GsapModule['gsap']; ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger']; lenis: Lenis | null };

let setup: Promise<Motion | null> | null = null;

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function getMotion(): Promise<Motion | null> {
  if (setup) return setup;
  setup = (async () => {
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      root.classList.add('no-gsap', 'motion-ready');
      return null;
    }
    try {
      const [{ gsap }, { ScrollTrigger }, { default: LenisClass }] = await Promise.all([
        import('gsap'), import('gsap/ScrollTrigger'), import('lenis'),
      ]);
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ ease: 'expo.out', duration: 1.1 });
      const lenis = new LenisClass({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.addEventListener('load', () => ScrollTrigger.refresh());
      return { gsap, ScrollTrigger, lenis };
    } catch {
      // Without the motion libraries every element is simply shown.
      root.classList.remove('motion');
      root.classList.add('no-gsap', 'motion-ready');
      return null;
    }
  })();
  return setup;
}

/** Builds the scroll animations for the page currently rendered inside `scope`. Returns a cleanup. */
export function animatePage(motion: Motion, scope: HTMLElement): () => void {
  const { gsap, ScrollTrigger } = motion;
  const cleanups: (() => void)[] = [];

  const ctx = gsap.context(() => {
    // Home hero entrance and scroll-out parallax.
    const hero = scope.querySelector<HTMLElement>('.hero');
    if (hero) {
      const heroImage = hero.querySelector('.hero-image img');
      gsap.timeline({ defaults: { duration: 1.4 } })
        .fromTo(heroImage, { scale: 1.18 }, { scale: 1, duration: 2.4 }, 0)
        .fromTo(hero.querySelectorAll('h1 .line-inner'), { yPercent: 110 }, { yPercent: 0, y: 0, stagger: 0.12 }, 0.2)
        .fromTo(hero.querySelector('.eyebrow'), { opacity: 0 }, { opacity: 1, duration: 1 }, 0.35)
        .fromTo(hero.querySelectorAll('.hero-lede, .hero-actions, .hero-bottomline'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.12 }, 0.6);
      gsap.to(hero.querySelector('.hero-image'), { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(hero.querySelector('.hero-copy'), { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'center center', end: 'bottom top', scrub: true } });
    }

    // Inner-page H1 lines rise in on load; section headings reveal line by line on scroll.
    scope.querySelectorAll('main h1').forEach((heading) => {
      if (heading.closest('.hero')) return;
      gsap.fromTo(heading.querySelectorAll('.line-inner'), { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 1.3, delay: 0.15 });
    });
    scope.querySelectorAll('main h2').forEach((heading) => {
      const lines = heading.querySelectorAll('.line-inner');
      if (!lines.length) return;
      gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, stagger: 0.1, duration: 1.2, scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
    });

    // Generic content reveal, batched so cards in a row stagger together.
    ScrollTrigger.batch(scope.querySelectorAll('[data-reveal]'), {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, overwrite: true }),
    });

    // Feature images drift slightly slower than the page.
    scope.querySelectorAll('.inner-hero-image, .service-detail-image, .project-detail-image, .process-hero-art, .journal-hero-image, .contact-visual, .consultation-image, .materials-image, .article-hero-image').forEach((frame) => {
      const image = frame.querySelector('img');
      if (!image) return;
      gsap.fromTo(image, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Process timelines fill step by step while the list scrolls through.
    scope.querySelectorAll('.process-steps').forEach((list) => {
      const timeline = gsap.timeline({ scrollTrigger: { trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } });
      list.querySelectorAll('li').forEach((step) => timeline.fromTo(step, { '--p': 0 }, { '--p': 1, ease: 'none', duration: 1 }));
    });

    // Turnkey stages, material chips and inclusion lists cascade in.
    gsap.utils.toArray<HTMLElement>(scope.querySelectorAll('.turnkey-flow li, .materials-list li, .included-list li')).forEach((item) => {
      gsap.from(item, { opacity: 0, x: -24, duration: 0.9, scrollTrigger: { trigger: item, start: 'top 92%', once: true } });
    });

    // Marquee loops continuously and speeds up / reverses with scroll velocity.
    const marqueeTrack = scope.querySelector<HTMLElement>('[data-marquee]');
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
      cleanups.push(() => { marqueeTrack.style.animation = ''; });
    }

    // Footer wordmark rises as the page ends.
    const wordmark = document.querySelector('.footer-wordmark span');
    if (wordmark) {
      gsap.fromTo(wordmark, { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    }
  }, scope);

  // Desktop: homepage services scroll sideways inside a sticky frame (no DOM-wrapping pin needed).
  const media = gsap.matchMedia();
  media.add('(min-width: 1025px) and (min-height: 700px)', () => {
    const section = scope.querySelector<HTMLElement>('.services-section');
    const sticky = section?.querySelector<HTMLElement>('.services-sticky');
    const track = section?.querySelector<HTMLElement>('.services-grid');
    if (!section || !sticky || !track) return undefined;
    section.classList.add('is-horizontal');
    const distance = () => Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? 0));
    const size = () => { section.style.height = `${window.innerHeight + distance()}px`; };
    size();
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true, onRefreshInit: size },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
      section.style.height = '';
      section.classList.remove('is-horizontal');
    };
  });

  document.documentElement.classList.add('motion-ready');
  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);

  return () => {
    window.clearTimeout(refresh);
    media.revert();
    ctx.revert();
    cleanups.forEach((fn) => fn());
  };
}
