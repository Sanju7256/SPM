import { Link, useParams } from 'react-router-dom';
import { ServiceCard } from '../components/Cards';
import { Arrow } from '../components/Icons';
import { Breadcrumbs, Button, CtaBand, Eyebrow, Lines, SectionHeading, TextLink } from '../components/ui';
import { asset, audienceOf, services, highPriority } from '../content';
import NotFound from './NotFound';

export function ServicesIndex() {
  const residential = services.filter((s) => audienceOf(s) === 'residential');
  const commercial = services.filter((s) => audienceOf(s) === 'commercial');
  return (
    <>
      <Breadcrumbs items={[['Services', null]]} />
      <section className="inner-hero wrap">
        <div className="inner-hero-copy" data-reveal>
          <Eyebrow text="RESIDENTIAL & COMMERCIAL / SPM SERVICES" />
          <h1><Lines lines={['Thoughtful design,', <em key="e">for every kind of space.</em>]} /></h1>
          <p className="hero-lede">From a home to a workplace, we bring clarity and care to the decisions that shape the spaces people use every day.</p>
          <Button href="/consultation/">Tell us about your project</Button>
        </div>
        <div className="inner-hero-image" data-reveal>
          <img src={asset('service-commercial.jpg')} alt="Bangalore commercial workplace concept with reception joinery and professional office space" {...highPriority} />
          <span className="image-caption">DESIGN THAT SUPPORTS DAILY LIFE</span>
        </div>
      </section>
      <section className="service-catalog section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="01 / RESIDENTIAL" title={['Homes shaped', <em key="e">around you.</em>]}>
            <p>Room-by-room expertise and whole-home thinking, brought together around the people who live in each space.</p>
          </SectionHeading>
          <div className="services-grid services-grid-all">{residential.map((item, i) => <ServiceCard key={item.slug} item={item} index={i} />)}</div>
        </div>
      </section>
      <section className="service-catalog service-catalog-commercial section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="02 / COMMERCIAL" title={['Places for work,', <em key="e">welcome and discovery.</em>]}>
            <p>Commercial interiors and workplace furniture planned for function, identity and the experience of the people who use them.</p>
          </SectionHeading>
          <div className="services-grid services-grid-all">{commercial.map((item, i) => <ServiceCard key={item.slug} item={item} index={i} />)}</div>
          <nav className="commercial-subnav" aria-label="Commercial interior types">
            <Link to="/services/commercial-interiors/#office-interiors">Office Interiors <Arrow /></Link>
            <Link to="/services/commercial-interiors/#retail-showrooms">Retail &amp; Showrooms <Arrow /></Link>
            <Link to="/services/commercial-interiors/#restaurants-cafes">Restaurants &amp; Cafés <Arrow /></Link>
          </nav>
        </div>
      </section>
      <section className="scope-note section-pad">
        <div className="wrap scope-note-grid" data-reveal>
          <div>
            <Eyebrow text="ONE CONSIDERED PROCESS" number="03" />
            <h2><Lines lines={['Different spaces.', <em key="e">Clear decisions.</em>]} /></h2>
          </div>
          <div>
            <p>Services can be explored separately or brought together into a wider brief. Final deliverables, timelines, pricing and execution responsibility depend on the written agreement for each project.</p>
            <Button href="/consultation/" kind="button-outline">Discuss a project</Button>
          </div>
        </div>
      </section>
      <CtaBand kicker="NOT SURE WHERE TO START?" title={['Let’s find the right', <em key="e">first step.</em>]} copy="Share a little about your project. We can help you understand which design conversation to have first." />
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const item = services.find((s) => s.slug === slug);
  if (!item) return <NotFound />;
  const chapters = item.chapters ?? [];
  const related = services.filter((s) => s.slug !== item.slug && audienceOf(s) === audienceOf(item)).slice(0, 3);
  const ctaLabel = item.cta_label ?? 'Talk through your project';
  return (
    <>
      <Breadcrumbs items={[['Services', '/services/'], [item.title, null]]} />
      <section className="service-detail-hero wrap">
        <div className="service-detail-copy" data-reveal>
          <Eyebrow text={`SPM / ${audienceOf(item).toUpperCase()} SERVICES`} />
          <h1><Lines lines={[item.title]} /></h1>
          <p className="hero-lede">{item.short}</p>
          <p>{item.intro}</p>
          <Button href="/consultation/">{ctaLabel}</Button>
        </div>
        <div className="service-detail-image" data-reveal>
          <img src={asset(item.image)} alt={item.alt} {...highPriority} />
          <span className="image-caption">{item.category.replace(/-/g, ' ').toUpperCase()} / SPM</span>
        </div>
      </section>
      <section id="service-includes" className="service-includes section-pad">
        <div className="wrap includes-grid">
          <div data-reveal>
            <Eyebrow text="WHAT WE CAN EXPLORE" number="01" />
            <h2><Lines lines={['Every detail,', <em key="e">thought through.</em>]} /></h2>
            <p>These are possible parts of the conversation. The final scope is confirmed with you in writing.</p>
          </div>
          <ul className="included-list" data-reveal>{item.includes.map((line) => <li key={line}><span aria-hidden="true">+</span>{line}</li>)}</ul>
        </div>
      </section>
      {chapters.length ? (
        <section className="service-chapters section-pad">
          <div className="wrap">
            <SectionHeading eyebrow="SPACES, NEEDS & DETAIL" number="02" title={['Design begins', <em key="e">with how it works.</em>]}>
              <p>Each space has its own rhythms, practical needs and moments of welcome. The brief shapes the response.</p>
            </SectionHeading>
            <div className="service-chapter-grid">
              {chapters.map((chapter, i) => (
                <article id={chapter.id} key={chapter.id} data-reveal><span className="service-chapter-index">0{i + 1} / SPM</span><h3>{chapter.title}</h3><p>{chapter.copy}</p></article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="service-detail-note">
        <div className="wrap" data-reveal><span>SPM / APPROACH</span><p>{item.intro}</p><TextLink href="/process/">See how the process works</TextLink></div>
      </section>
      <section className="faq-section section-pad">
        <div className="wrap faq-layout">
          <div data-reveal>
            <Eyebrow text="GOOD QUESTIONS" number="03" />
            <h2><Lines lines={['Before we', <em key="e">get started.</em>]} /></h2>
            <TextLink href="/contact/">Ask about your brief</TextLink>
          </div>
          <div className="faq-list" data-reveal>{item.faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div>
      </section>
      <section className="related-services section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="YOU MAY ALSO EXPLORE" number="04" title={['More ways to', <em key="e">shape a space.</em>]}>
            <TextLink href="/services/">View all services</TextLink>
          </SectionHeading>
          <div className="related-links">{related.map((x) => <Link key={x.slug} to={`/services/${x.slug}/`}><span>{x.title}</span><Arrow /></Link>)}</div>
        </div>
      </section>
      <CtaBand kicker="A SPACE WITH ITS OWN BRIEF" title={['Let’s make a plan', <em key="e">that feels considered.</em>]}
        copy="Start with a conversation about the space, the people who use it and the decisions ahead." label={ctaLabel} />
    </>
  );
}
