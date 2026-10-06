import { useEffect, useRef, useState } from 'react';
import { config } from '../config';

const isNumeric = (raw: string) => /^\d+(\.\d+)?$/.test(raw);

function Metric({ raw, label, suffix, verified }: { raw: string; label: string; suffix: string; verified: boolean }) {
  const finalText = raw ? (raw.endsWith(suffix) ? raw : `${raw}${suffix}`) : '—';
  const numeric = Boolean(raw) && isNumeric(raw);
  const [text, setText] = useState(finalText);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Figures count up only once they enter the viewport; reduced motion shows the final value immediately.
  useEffect(() => {
    const node = ref.current;
    if (!node || !numeric) return undefined;
    const end = Number(raw);
    const decimals = raw.includes('.') ? 1 : 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const run = () => {
      setAnimated(true);
      if (reduced) {
        setText(`${end.toFixed(decimals)}${suffix}`);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1100);
        const eased = 1 - Math.pow(1 - progress, 3);
        setText(`${(end * eased).toFixed(progress === 1 ? decimals : 0)}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) {
      run();
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        run();
      }
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [numeric, raw, suffix]);

  const note = raw ? (verified ? 'Verified studio figure' : 'Illustrative placeholder — not verified') : 'Awaiting verified SPM data';
  return (
    <div className="metric">
      <strong ref={ref} data-metric-value={numeric ? raw : undefined} data-metric-suffix={numeric ? suffix : undefined} data-animated={animated ? 'true' : undefined}>{text}</strong>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}

export function StatsBand() {
  const { stats } = config;
  const status = stats.verified ? 'SPM-supplied statistics' : 'Trust statistics / illustrative placeholders';
  const disclosure = stats.verified
    ? 'Figures marked as verified were supplied and approved by SPM.'
    : 'ILLUSTRATIVE PLACEHOLDERS — not verified SPM data. Replace with confirmed figures before making public claims.';
  return (
    <section className="metrics-band" aria-label={status}>
      <p className="metrics-status">{status}</p>
      <div className="metrics-grid wrap">
        <Metric raw={stats.homes} label="Homes designed" suffix="+" verified={stats.verified} />
        <Metric raw={stats.years} label="Years experience" suffix="+" verified={stats.verified} />
        <Metric raw={stats.team} label="Design professionals" suffix="+" verified={stats.verified} />
        <Metric raw={stats.rating} label="Customer rating" suffix="/5" verified={stats.verified} />
      </div>
      <p className="metrics-note">{disclosure}</p>
    </section>
  );
}
