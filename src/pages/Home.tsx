import { useState } from 'react';
import { ArticleCard, ProjectCard, ServiceCard } from '../components/Cards';
import { CompareSlider } from '../components/CompareSlider';
import { ProcessSteps } from '../components/ProcessSteps';
import { StatsBand } from '../components/StatsBand';
import { Button, CtaBand, Eyebrow, Lines, SectionHeading, TextLink } from '../components/ui';
import { articles, asset, projects, services, highPriority } from '../content';

const TRANSFORMATIONS = [
  { key: 'living', label: 'Living room', before: 'living-before.jpg', after: 'living-after.jpg', beforeAlt: 'Plain living room before design concept', afterAlt: 'Warm layered living-room concept' },
  { key: 'bedroom', label: 'Bedroom', before: 'bedroom-before.jpg', after: 'bedroom-after.jpg', beforeAlt: 'Bedroom before concept study', afterAlt: 'Restful bedroom concept with warm timber' },
  { key: 'kitchen', label: 'Kitchen', before: 'kitchen-before.jpg', after: 'kitchen-after.jpg', beforeAlt: 'Kitchen before concept study', afterAlt: 'Warm ivory kitchen concept' },
  { key: 'full', label: 'Whole home', before: 'full-home-before.jpg', after: 'full-home-after.jpg', beforeAlt: 'Open-plan home before concept study', afterAlt: 'Whole-home concept with clear dining and living zones' },
];

const MARQUEE = ['Complete homes', 'Modular kitchens', 'Living rooms', 'Bedrooms', 'Wardrobes', 'Workplaces', 'Custom furniture', 'Lighting & ceilings'];

const PRINCIPLES = [
  ['Listen before drawing', 'Your needs and preferences set the direction.'],
  ['Make the everyday work', 'Storage, movement and light are part of the design from the start.'],
  ['Choose materials with care', 'Texture, maintenance and context matter as much as appearance.'],
  ['Keep every decision clear', 'A considered process helps ideas move forward with shared understanding.'],
  ['Make choices understandable', 'Options, assumptions and trade-offs deserve a clear conversation.'],
  ['Finish with intention', 'Proportion, edges and the details seen every day all matter.'],
];

const TESTIMONIALS = [
  ['Approved client feedback will be added here when SPM supplies a verified testimonial.', 'Replace with an approved name and context'],
  ['A second verified client story can be featured here after review and permission.', 'No review, rating or identity is invented'],
  ['Use this space for real feedback shared with the client’s permission.', 'Verified testimonial placeholder'],
];

function Transformations() {
  const [active, setActive] = useState(TRANSFORMATIONS[0]);
  return (
    <section id="transformations" className="transformation-section section-pad">
      <div className="wrap">
        <SectionHeading eyebrow="SEE THE POSSIBILITY" number="02" title={['From everyday', <>to <em>entirely yours.</em></>]}>
          <p>Explore illustrative room transformations. These generated visuals are design concepts, not completed client projects.</p>
        </SectionHeading>
        <div className="transformation-layout">
          <div className="transformation-copy" data-reveal>
            <span className="index-line">01 / TRANSFORMATION STUDY</span>
            <h3 data-transform-title>{active.label}</h3>
            <p>A clear starting point, a considered palette and useful details can change how a room supports daily life.</p>
            <div className="transformation-tabs" role="group" aria-label="Choose a transformation example">
              {TRANSFORMATIONS.map((item) => (
                <button key={item.key} type="button" data-transform-select={item.key} aria-pressed={item.key === active.key} onClick={() => setActive(item)}>{item.label}</button>
              ))}
            </div>
            <p className="compare-hint">Move the divider to compare each illustrative concept.</p>
            <TextLink className="transformation-more" href="/projects/">See more transformations</TextLink>
          </div>
          <div className="transformation-visual" data-transform-image>
            <CompareSlider before={active.before} after={active.after} beforeAlt={active.beforeAlt} afterAlt={active.afterAlt} label={active.label.toLowerCase()} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [index, setIndex] = useState(0);
  const go = (next: number) => setIndex((next + TESTIMONIALS.length) % TESTIMONIALS.length);
  return (
    <section className="testimonial-section section-pad">
      <div className="wrap testimonial-wrap">
        <div className="testimonial-heading" data-reveal>
          <Eyebrow text="CLIENT STORIES" number="10" />
          <h2><Lines lines={['Good homes are', <em key="e">personal.</em>]} /></h2>
          <p>Verified client words will appear here after the studio approves them.</p>
          <div className="slider-controls">
            <button type="button" aria-label="Previous client story" onClick={() => go(index - 1)}>←</button>
            <button type="button" aria-label="Next client story" onClick={() => go(index + 1)}>→</button>
            <span data-slide-count>{String(index + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="testimonial-stage" aria-live="polite">
          {TESTIMONIALS.map(([quote, context], i) => (
            <article key={quote} className={`testimonial${i === index ? ' is-active' : ''}`} data-testimonial hidden={i !== index}>
              <span className="quote-mark" aria-hidden="true">“</span>
              <blockquote>{quote}</blockquote>
              <div className="reviewer"><span className="review-avatar" aria-hidden="true">SPM</span><div><strong>Client story pending</strong><span>{context}</span></div></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true"><img src={asset('spm-hero-bangalore.jpg')} alt="" {...highPriority} /><span className="hero-shade" /></div>
        <div className="hero-copy wrap">
          <Eyebrow text="SPM INTERIORS DESIGN / BANGALORE" />
          <h1 id="hero-title"><Lines lines={['We design homes', <>that <em>feel like you.</em></>]} /></h1>
          <p className="hero-lede">Thoughtful interiors for South Indian homes—planned around your routines, preferences and everyday needs.</p>
          <div className="hero-actions">
            <Button href="/projects/" kind="button-light">Explore our work</Button>
            <Button href="/consultation/" kind="button-ghost-light">Book a design consultation</Button>
          </div>
          <div className="hero-bottomline">
            <span>Residential &amp; commercial interiors · Bangalore · South India</span>
            <a href="#discover"><span className="scroll-cue" aria-hidden="true" />Scroll to discover</a>
          </div>
        </div>
      </section>

      <StatsBand />

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track" data-marquee>{[...MARQUEE, ...MARQUEE].map((word, i) => <span key={i}>{word}</span>)}</div>
      </div>

      <section className="manifesto section-pad wrap" id="discover">
        <div className="manifesto-aside" data-reveal>
          <Eyebrow text="A HOME, IN YOUR OWN WORDS" number="01" />
          <span className="vertical-rule" />
          <p>YOUR HOME.<br />YOUR STORY.<br />OUR DESIGN.</p>
        </div>
        <div className="manifesto-copy" data-reveal>
          <h2><Lines lines={['A home isn’t a showroom.', <>It’s a <em>story in progress.</em></>]} /></h2>
          <p>SPM Interiors Design creates thoughtful, functional interiors that reflect your personality and make everyday living feel effortless. From discovery and planning to the details that make a room feel complete, each choice begins with you.</p>
          <TextLink href="/about/">Get to know SPM</TextLink>
        </div>
        <div className="manifesto-note" data-reveal><span>DESIGNED<br />AROUND YOU</span><b aria-hidden="true">SPM</b></div>
      </section>

      <Transformations />

      <section className="sample-video-section section-pad" aria-labelledby="sample-video-heading">
        <div className="wrap sample-video-layout">
          <div className="sample-video-copy" data-reveal>
            <Eyebrow text="SPACES IN MOTION / SAMPLE VIDEO" number="03" />
            <h2 id="sample-video-heading"><Lines lines={['A closer look', <em key="e">in motion.</em>]} /></h2>
            <p>A sample interior walkthrough, supplied for this website. It is presented as sample media, not as a verified completed SPM project.</p>
            <span className="sample-video-note">32-SECOND INTERIOR WALKTHROUGH · AUDIO AVAILABLE</span>
          </div>
          <figure className="sample-video-card" data-reveal>
            <video id="sample-interior-video" controls playsInline preload="metadata" poster={asset('interiorsvideo-poster.jpg')} aria-labelledby="sample-video-heading" aria-describedby="sample-video-caption">
              <source src="/assets/interiorsvideo.mp4" type="video/mp4" />
              <p>Your browser does not support embedded video. <a href="/assets/interiorsvideo.mp4">Open the sample video directly</a>.</p>
            </video>
            <figcaption id="sample-video-caption"><span>SPM INTERIORS DESIGN / SAMPLE</span><span>Press play when you are ready</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="services-section section-pad">
        <div className="services-sticky">
          <div className="wrap">
            <SectionHeading eyebrow="ROOM BY ROOM, OR ALL AT ONCE" number="04" title={['Considered from', <em key="e">threshold to home.</em>]}>
              <TextLink href="/services/">Explore every service</TextLink>
            </SectionHeading>
            <div className="services-grid">{services.slice(0, 6).map((item, i) => <ServiceCard key={item.slug} item={item} index={i} />)}</div>
          </div>
        </div>
      </section>

      <section className="projects-section section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="A DESIGN JOURNAL IN IMAGES" number="05" title={[<>Ideas with <em>room to breathe.</em></>]}>
            <TextLink href="/projects/">View concept studies</TextLink>
          </SectionHeading>
          <div className="projects-grid home-project-grid">{projects.slice(0, 3).map((item, i) => <ProjectCard key={item.slug} item={item} index={i} />)}</div>
          <p className="concept-note">Every image and project name shown here is an illustrative design concept—not a claim of completed client work.</p>
        </div>
      </section>

      <section className="philosophy-section section-pad">
        <div className="wrap philosophy-layout">
          <div className="philosophy-heading" data-reveal>
            <Eyebrow text="THE SPM APPROACH" number="06" />
            <h2><Lines lines={['Beautiful is only', <>the <em>beginning.</em></>]} /></h2>
            <p>We bring a point of view to the design—and keep the way you live at its centre.</p>
            <Button href="/process/" kind="button-outline">How we work</Button>
          </div>
          <div className="principle-list">
            {PRINCIPLES.map(([title, copy], i) => (
              <article key={title} data-reveal><span>0{i + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="process-preview section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="A CLEAR, COLLABORATIVE PROCESS" number="07" title={['From first thought', <>to <em>feeling at home.</em></>]}>
            <p>Each project has its own needs. A clear sequence makes the next decision easier to see.</p>
          </SectionHeading>
          <ProcessSteps compact />
          <div className="process-more"><TextLink href="/process/">See the full design journey</TextLink></div>
        </div>
      </section>

      <section className="turnkey-section section-pad">
        <div className="wrap turnkey-layout">
          <div data-reveal>
            <Eyebrow text="FROM CONCEPT TO HANDOVER" number="08" />
            <h2><Lines lines={['One vision.', <em key="e">A coordinated journey.</em>]} /></h2>
            <p>Design, materials and next steps can be considered as one connected plan. Execution, quality checks and handover are included only when confirmed in the written project scope.</p>
            <TextLink href="/process/">Understand the process</TextLink>
          </div>
          <div className="turnkey-flow" data-reveal>
            <ol>{['Concept', 'Design', 'Materials', 'Execution', 'Quality check', 'Handover'].map((stage) => <li key={stage}>{stage}</li>)}</ol>
            <p>Potential stages — final responsibilities depend on the signed agreement.</p>
          </div>
        </div>
      </section>

      <section className="materials-section">
        <div className="materials-image" data-reveal><img src={asset('materials-study.jpg')} alt="Tactile interior material samples in ivory, stone, timber and terracotta" loading="lazy" /></div>
        <div className="materials-copy" data-reveal>
          <Eyebrow text="A PALETTE WITH PURPOSE" number="09" />
          <h2><Lines lines={['Materials that feel', <em key="e">like home.</em>]} /></h2>
          <p>Natural grain, quiet stone, tactile textiles and one carefully chosen accent can give a room depth without adding visual noise.</p>
          <ul className="materials-list">{['Wood', 'Marble & stone', 'Veneer', 'Laminate', 'Fabric', 'Glass & metal', 'Lighting'].map((m) => <li key={m}>{m}</li>)}</ul>
          <TextLink href="/journal/materials-for-south-indian-homes/">Read our material notes</TextLink>
        </div>
      </section>

      <Testimonials />

      <section className="journal-section section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="NOTES ON LIVING WELL" number="11" title={['From the design', <em key="e">journal.</em>]}>
            <TextLink href="/journal/">Read every article</TextLink>
          </SectionHeading>
          <div className="journal-grid">{articles.map((item) => <ArticleCard key={item.slug} item={item} />)}</div>
        </div>
      </section>

      <CtaBand kicker="YOUR HOME, NEXT" title={['Ready to make space', <>for <em>what matters?</em></>]}
        copy="Tell us what you are imagining. We will begin with a conversation about the home and the way you want to live." />
    </>
  );
}
