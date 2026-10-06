import { useEffect, useRef, useState } from 'react';

const STEPS = [
  ['01', 'Listen', 'We begin with your routines, priorities, references and questions.'],
  ['02', 'Understand', 'Plans, measurements and site context clarify the opportunity.'],
  ['03', 'Imagine', 'Layouts, palette directions and visualisations make ideas tangible.'],
  ['04', 'Refine', 'Materials, lighting and details are reviewed against the brief.'],
  ['05', 'Coordinate', 'Approved information is organised for the agreed delivery scope.'],
  ['06', 'Settle in', 'The final review brings the considered details together.'],
];

export function ProcessSteps({ compact = false }: { compact?: boolean }) {
  const items = compact ? STEPS.slice(0, 4) : STEPS;
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);

  // Marks the step currently being read (used when GSAP scroll motion is unavailable).
  useEffect(() => {
    const list = listRef.current;
    if (!list || !('IntersectionObserver' in window)) return undefined;
    const steps = Array.from(list.children);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(steps.indexOf(entry.target));
    }), { threshold: 0.58 });
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <ol className="process-steps" ref={listRef}>
      {items.map(([number, title, copy], index) => (
        <li key={number} data-process-step className={index === active ? 'is-active' : undefined}>
          <span className="step-index">{number}</span>
          <div><h3>{title}</h3><p>{copy}</p></div>
        </li>
      ))}
    </ol>
  );
}
