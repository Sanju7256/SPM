import { Fragment, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Arrow } from './Icons';

type SmartLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Client-side navigation for internal paths, a normal anchor for everything else. */
export function SmartLink({ href, children, ...rest }: SmartLinkProps) {
  if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/assets/')) {
    return <Link to={href} {...rest}>{children}</Link>;
  }
  return <a href={href} {...rest}>{children}</a>;
}

export function Eyebrow({ text, number }: { text: string; number?: string }) {
  return <p className="eyebrow">{number ? <span className="eyebrow-number">{number}</span> : null}{text}</p>;
}

export function Button({ href, kind = 'button-dark', children }: { href: string; kind?: string; children: ReactNode }) {
  return <SmartLink className={`button ${kind}`} href={href}>{children} <Arrow /></SmartLink>;
}

export function TextLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <SmartLink className={`text-link ${className}`.trim()} href={href}>{children} <Arrow /></SmartLink>;
}

/** Each entry is one visual line wrapped in a mask, so the scroll motion can slide it into view. */
export function Lines({ lines }: { lines: ReactNode[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span className="line" key={index}><span className="line-inner">{line}</span></span>
      ))}
    </>
  );
}

export function Breadcrumbs({ items }: { items: [string, string | null][] }) {
  return (
    <nav className="breadcrumbs wrap" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map(([label, href]) => (
        <Fragment key={label}>
          <span aria-hidden="true">/</span>
          {href ? <Link to={href}>{label}</Link> : <span aria-current="page">{label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}

export function CtaBand({ kicker, title, copy, label = 'Book a consultation' }: { kicker: string; title: ReactNode[]; copy: string; label?: string }) {
  return (
    <section className="cta-band">
      <div className="cta-inner wrap" data-reveal>
        <Eyebrow text={kicker} />
        <h2><Lines lines={title} /></h2>
        <p>{copy}</p>
        <div className="cta-actions"><Button href="/consultation/">{label}</Button></div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, number, title, children }: { eyebrow: string; number?: string; title: ReactNode[]; children?: ReactNode }) {
  return (
    <div className="section-heading" data-reveal>
      <div>
        <Eyebrow text={eyebrow} number={number} />
        <h2><Lines lines={title} /></h2>
      </div>
      {children}
    </div>
  );
}
