import { useEffect, useState, type CSSProperties } from 'react';
import { asset } from '../content';

interface CompareSliderProps {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  label: string;
  id?: string;
}

/** Native range input over two images: keyboard, mouse and touch all work without extra handlers. */
export function CompareSlider({ before, after, beforeAlt, afterAlt, label, id }: CompareSliderProps) {
  const [split, setSplit] = useState(50);
  useEffect(() => setSplit(50), [before, after]);
  return (
    <div className="compare-slider" data-compare id={id} style={{ '--split': `${split}%` } as CSSProperties}>
      <div className="compare-side compare-before">
        <img src={asset(before)} alt={beforeAlt} loading="lazy" />
        <span className="compare-label">Before</span>
      </div>
      <div className="compare-side compare-after">
        <img src={asset(after)} alt={afterAlt} loading="lazy" />
        <span className="compare-label">After</span>
      </div>
      <span className="compare-divider" aria-hidden="true"><span>↔</span></span>
      <input
        className="compare-range" type="range" min={0} max={100} value={split}
        aria-label={`Adjust the before and after comparison for ${label}`}
        aria-valuetext={`Before ${split} percent, after ${100 - split} percent`}
        onChange={(event) => setSplit(Number(event.target.value))}
      />
      <span className="compare-caption">Drag to compare</span>
    </div>
  );
}
