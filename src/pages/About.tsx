import { Breadcrumbs, Button, CtaBand, Eyebrow, Lines, SectionHeading } from '../components/ui';
import { asset, highPriority } from '../content';

const PILLARS = [
  ['01 / PEOPLE', 'Personal by nature', 'Your routines, preferences and priorities belong in the brief—not as an afterthought.'],
  ['02 / SPACE', 'Clear in its purpose', 'Movement, storage and light help each room support the way it is used.'],
  ['03 / MATERIAL', 'Considered in every layer', 'Texture and finish are selected with appearance, maintenance and context in mind.'],
  ['04 / PROCESS', 'Open at every step', 'Shared information and clear next steps help the project move with intention.'],
];

export default function About() {
  return (
    <>
      <Breadcrumbs items={[['About', null]]} />
      <section className="inner-hero wrap">
        <div className="inner-hero-copy" data-reveal>
          <Eyebrow text="ABOUT SPM / DESIGN WITH INTENTION" />
          <h1><Lines lines={['Good design begins', <>with <em>understanding.</em></>]} /></h1>
          <p className="hero-lede">We create thoughtful, functional interiors that reflect your personality and make everyday living feel effortless.</p>
          <Button href="/process/">Explore our process</Button>
        </div>
        <div className="inner-hero-image" data-reveal>
          <img src={asset('spm-hero-bangalore.jpg')} alt="Sunlit South Indian home concept with natural timber, cane and warm ivory finishes" {...highPriority} />
          <span className="image-caption">SPM / INTERIORS DESIGN</span>
        </div>
      </section>
      <section className="about-story section-pad">
        <div className="wrap story-layout">
          <div data-reveal>
            <Eyebrow text="OUR POINT OF VIEW" number="01" />
            <h2><Lines lines={['A home should feel', <em key="e">like it belongs to you.</em>]} /></h2>
          </div>
          <div className="story-copy" data-reveal>
            <p className="story-lede">SPM Interiors Design is built around one simple belief: a well-designed home should make the everyday feel more natural.</p>
            <p>We bring the practical decisions—space, storage, movement and light—together with the materials, objects and details that give a home its own character. The result is not a style to copy, but a thoughtful design shaped by the people who live there.</p>
            <p>From Bangalore to homes across South India, our focus is on clear conversations, considered choices and interiors that support the rhythm of real life.</p>
          </div>
        </div>
      </section>
      <section className="about-pillars section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="WHAT GUIDES THE WORK" number="02" title={['A thoughtful home,', <em key="e">from the inside out.</em>]}>
            <p>We treat beauty, function and the process as parts of the same design conversation.</p>
          </SectionHeading>
          <div className="pillar-grid">
            {PILLARS.map(([label, title, copy]) => <article key={label} data-reveal><span>{label}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>
      <section className="about-note">
        <div className="wrap about-note-inner" data-reveal>
          <p className="eyebrow">A NOTE ON THIS SHOWCASE</p>
          <p>Concept imagery illustrates the design direction. Verified company history, completed-project photography, team biographies, client stories and studio credentials will be added only when SPM supplies them.</p>
        </div>
      </section>
      <CtaBand kicker="LET’S BEGIN WITH A CONVERSATION" title={['Have a space in mind?']} copy="Tell us what you are looking for and we can start by understanding the brief." />
    </>
  );
}
