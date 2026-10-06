import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectCard } from '../components/Cards';
import { CompareSlider } from '../components/CompareSlider';
import { Breadcrumbs, Button, CtaBand, Eyebrow, Lines, SectionHeading, TextLink } from '../components/ui';
import { asset, projects, highPriority } from '../content';
import NotFound from './NotFound';

const FILTERS: [string, string][] = [['all', 'All concepts'], ['home', 'Whole home'], ['kitchen', 'Kitchens'], ['bedroom', 'Bedrooms'], ['living', 'Living rooms']];

const GALLERY: Record<string, [string, string, string][]> = {
  home: [['Living room', 'living-after.jpg', 'Warm living-room concept'], ['Kitchen', 'kitchen-after.jpg', 'Kitchen design concept'], ['Bedroom', 'bedroom-after.jpg', 'Bedroom concept'], ['Wardrobe', 'service-wardrobe.jpg', 'Joinery and wardrobe concept'], ['Lighting', 'service-lighting.jpg', 'Layered lighting concept']],
  kitchen: [['Kitchen', 'kitchen-after.jpg', 'Warm kitchen concept'], ['Dining', 'service-dining.jpg', 'Connected dining concept'], ['Materials', 'materials-study.jpg', 'Stone, timber and textile material study'], ['Lighting', 'service-lighting.jpg', 'Layered lighting concept']],
  bedroom: [['Bedroom', 'bedroom-after.jpg', 'Calm bedroom concept'], ['Wardrobe', 'service-wardrobe.jpg', 'Joinery and wardrobe concept'], ['Materials', 'materials-study.jpg', 'Natural timber and tactile material study'], ['Lighting', 'service-lighting.jpg', 'Layered lighting concept']],
  living: [['Living room', 'living-after.jpg', 'Layered living-room concept'], ['Dining', 'service-dining.jpg', 'Connected dining concept'], ['Materials', 'materials-study.jpg', 'Warm material palette study'], ['Lighting', 'service-lighting.jpg', 'Layered lighting concept']],
};

export function ProjectsIndex() {
  const [filter, setFilter] = useState('all');
  const matches = (category: string) => filter === 'all' || category.split(/\s+/).includes(filter);
  const visible = projects.filter((p) => matches(p.category)).length;
  return (
    <>
      <Breadcrumbs items={[['Projects', null]]} />
      <section className="inner-hero wrap">
        <div className="inner-hero-copy" data-reveal>
          <Eyebrow text="PROJECTS / DESIGN CONCEPTS" />
          <h1><Lines lines={['Ideas made', <em key="e">to feel like home.</em>]} /></h1>
          <p className="hero-lede">Explore original design studies for rooms and homes shaped by warm materials, clear function and South Indian living.</p>
          <Button href="/#transformations" kind="button-outline">See a room transformation</Button>
        </div>
        <div className="inner-hero-image" data-reveal>
          <img src={asset('living-after.jpg')} alt="Warm contemporary living-room design concept" {...highPriority} />
          <span className="image-caption">ILLUSTRATIVE CONCEPT / SPM</span>
        </div>
      </section>
      <section className="portfolio-section section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="THE CONCEPT PORTFOLIO" number="01" title={['Different ways to', <em key="e">live beautifully.</em>]}>
            <p>All projects shown are illustrative concepts using original generated imagery, not claims of completed client commissions.</p>
          </SectionHeading>
          <div className="project-filters" role="group" aria-label="Filter project concepts">
            {FILTERS.map(([slug, label]) => (
              <button key={slug} type="button" data-filter={slug} aria-pressed={filter === slug} className={filter === slug ? 'is-selected' : undefined} onClick={() => setFilter(slug)}>{label}</button>
            ))}
          </div>
          <div className="projects-grid portfolio-grid" data-project-grid>
            {projects.map((item, i) => <ProjectCard key={item.slug} item={item} index={i} hidden={!matches(item.category)} />)}
          </div>
          <p data-filter-empty hidden={visible > 0} className="filter-empty">No concepts match this selection.</p>
        </div>
      </section>
      <CtaBand kicker="YOUR HOME IS ITS OWN BRIEF" title={['Have a room in mind?']} copy="Tell us what you would like the space to do. We will start with the details that make it yours." />
    </>
  );
}

export function ProjectDetail() {
  const { slug } = useParams();
  const item = projects.find((p) => p.slug === slug);
  if (!item) return <NotFound />;
  const related = projects.filter((p) => p.slug !== item.slug).slice(0, 2);
  return (
    <>
      <Breadcrumbs items={[['Projects', '/projects/'], [item.name, null]]} />
      <section className="project-detail-hero wrap">
        <div className="project-detail-copy" data-reveal>
          <Eyebrow text="ILLUSTRATIVE DESIGN STUDY / SPM" />
          <h1><Lines lines={[item.name]} /></h1>
          <p className="hero-lede">{item.description}</p>
          <div className="project-facts">
            <div><span>PROPERTY TYPE</span><strong>{item.typology}</strong></div>
            <div><span>LOCATION</span><strong>{item.location}</strong></div>
            <div><span>AREA</span><strong>Not measured — illustrative concept</strong></div>
            <div><span>DESIGN STYLE</span><strong>{item.style}</strong></div>
          </div>
        </div>
        <div className="project-detail-image" data-reveal>
          <img src={asset(item.image)} alt={item.alt} {...highPriority} />
          <span className="concept-stamp">CONCEPT<br />STUDY</span>
        </div>
      </section>
      <section className="project-compare-section section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="A ROOM, REIMAGINED" number="01" title={['Before the idea.', <em key="e">After the thought.</em>]}>
            <p>Use the comparison control to explore an illustrative before-and-after design study.</p>
          </SectionHeading>
          <CompareSlider before={item.before_image} after={item.image} beforeAlt={`Before: ${item.alt}`} afterAlt={`After: ${item.alt}`} label={item.name} />
          <p className="concept-note">Generated concept imagery for design exploration. It does not depict a completed client project.</p>
        </div>
      </section>
      <section className="project-vignettes section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="ROOMS IN THE CONCEPT" number="02" title={['One palette,', <em key="e">many moments.</em>]}>
            <p>Swipe through original illustrative room vignettes. These images explore a design direction; they do not document a measured or completed home.</p>
          </SectionHeading>
          <div className="room-gallery-grid" role="region" aria-label="Illustrative room concept gallery" tabIndex={0}>
            {(GALLERY[item.category] ?? []).map(([label, image, alt]) => (
              <figure key={label} data-reveal><img src={asset(image)} alt={alt} loading="lazy" /><figcaption>{label} <span>ILLUSTRATIVE CONCEPT</span></figcaption></figure>
            ))}
          </div>
        </div>
      </section>
      <section className="project-detail-body section-pad">
        <div className="wrap project-body-grid">
          <div data-reveal>
            <Eyebrow text="THE DESIGN NOTES" number="03" />
            <h2><Lines lines={['What makes', <em key="e">the concept work.</em>]} /></h2>
            <p>{item.description}</p>
          </div>
          <div className="project-specs" data-reveal>
            <div><h3>Material direction</h3><ul>{item.materials.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h3>Spaces explored</h3><ul>{item.rooms.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </div>
      </section>
      <section className="related-projects section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="MORE DESIGN STUDIES" number="04" title={[<>Continue <em>exploring.</em></>]}>
            <TextLink href="/projects/">All concepts</TextLink>
          </SectionHeading>
          <div className="projects-grid">{related.map((p, i) => <ProjectCard key={p.slug} item={p} index={i} />)}</div>
        </div>
      </section>
      <CtaBand kicker="YOUR HOME HAS ITS OWN STORY" title={['Let’s begin with', <em key="e">your brief.</em>]} copy="Share the space, the routines and the feeling you are hoping to create." />
    </>
  );
}
