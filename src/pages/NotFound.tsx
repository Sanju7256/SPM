import { Button, Eyebrow, Lines, TextLink } from '../components/ui';

export default function NotFound() {
  return (
    <section className="legal-page wrap">
      <div className="legal-heading">
        <Eyebrow text="SPM INTERIORS DESIGN / 404" />
        <h1><Lines lines={[<>That page isn’t <em>here.</em></>]} /></h1>
      </div>
      <div className="legal-copy">
        <p className="hero-lede">The address may have changed, or the page may no longer exist.</p>
        <p><Button href="/">Return to the homepage</Button></p>
        <p><TextLink href="/projects/">Explore design concepts</TextLink></p>
      </div>
    </section>
  );
}
