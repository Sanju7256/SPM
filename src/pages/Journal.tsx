import { useParams } from 'react-router-dom';
import { ArticleCard } from '../components/Cards';
import { Breadcrumbs, CtaBand, Eyebrow, Lines, SectionHeading, TextLink } from '../components/ui';
import { articles, asset, highPriority } from '../content';
import NotFound from './NotFound';

export function JournalIndex() {
  return (
    <>
      <Breadcrumbs items={[['Journal', null]]} />
      <section className="journal-hero wrap">
        <div data-reveal>
          <Eyebrow text="THE SPM DESIGN JOURNAL" />
          <h1><Lines lines={['Ideas for living', <>with <em>intention.</em></>]} /></h1>
          <p className="hero-lede">Notes on home planning, material choices and the details that make everyday spaces feel considered.</p>
        </div>
        <div className="journal-hero-image" data-reveal>
          <img src={asset('materials-study.jpg')} alt="Tactile interior materials selected for a warm South Indian home concept" {...highPriority} />
        </div>
      </section>
      <section className="journal-list-section section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="NOTES FROM THE STUDIO" number="01" title={['Design that starts', <em key="e">with everyday life.</em>]}>
            <p>Original editorial articles from SPM Interiors Design.</p>
          </SectionHeading>
          <div className="journal-grid">{articles.map((item) => <ArticleCard key={item.slug} item={item} />)}</div>
        </div>
      </section>
      <CtaBand kicker="A QUESTION ABOUT YOUR HOME?" title={['Make the next decision', <em key="e">with more clarity.</em>]} copy="Get in touch to discuss the space and the decisions you are working through." />
    </>
  );
}

export function ArticlePage() {
  const { slug } = useParams();
  const item = articles.find((a) => a.slug === slug);
  if (!item) return <NotFound />;
  const related = articles.filter((a) => a.slug !== item.slug).slice(0, 2);
  return (
    <>
      <Breadcrumbs items={[['Journal', '/journal/'], [item.title, null]]} />
      <article className="article-page wrap">
        <header className="article-header" data-reveal>
          <Eyebrow text={`${item.category} / ${item.read_time}`} />
          <h1><Lines lines={[item.title]} /></h1>
          <p className="hero-lede">{item.excerpt}</p>
          <div className="article-meta"><span>SPM INTERIORS DESIGN</span><time dateTime={item.date}>{item.date}</time></div>
        </header>
        <figure className="article-hero-image" data-reveal><img src={asset(item.image)} alt={item.alt} {...highPriority} /></figure>
        <div className="article-content">
          <aside className="article-side-note"><span>SPM / JOURNAL</span><p>Thoughtful homes begin with the questions that matter to the people who live there.</p></aside>
          <div className="article-body">
            {item.sections.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}
            <p className="article-caveat">This article offers general design considerations. Confirm final materials, specifications and installation requirements for the project and product in question.</p>
          </div>
        </div>
      </article>
      <section className="related-journal section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="MORE FROM THE JOURNAL" title={[<>Keep <em>reading.</em></>]}>
            <TextLink href="/journal/">All articles</TextLink>
          </SectionHeading>
          <div className="journal-grid">{related.map((x) => <ArticleCard key={x.slug} item={x} />)}</div>
        </div>
      </section>
      <CtaBand kicker="MAKE IT YOUR OWN" title={['Have a home question', <em key="e">of your own?</em>]} copy="Tell us what you are thinking about. We will start by listening." />
    </>
  );
}
