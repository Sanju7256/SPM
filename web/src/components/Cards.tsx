import { Link } from 'react-router-dom';
import { asset, type Article, type Project, type Service } from '../content';
import { Arrow, Icon } from './Icons';
import { TextLink } from './ui';

const pad = (index: number) => `0${index + 1}`;

export function ServiceCard({ item, index }: { item: Service; index: number }) {
  const href = `/services/${item.slug}/`;
  return (
    <article className="service-card" data-reveal>
      <Link className="service-card-image" to={href}>
        <img src={asset(item.image)} alt={item.alt} loading="lazy" />
        <span className="image-count">{pad(index)}</span>
        <span className="service-hover-mark" aria-hidden="true"><Icon name="arrow" /></span>
      </Link>
      <div className="service-card-copy">
        <span className="service-category">{item.category.replace(/-/g, ' ')}</span>
        <h3><Link to={href}>{item.title}</Link></h3>
        <p>{item.short}</p>
      </div>
    </article>
  );
}

export function ProjectCard({ item, index, hidden = false }: { item: Project; index: number; hidden?: boolean }) {
  const href = `/projects/${item.slug}/`;
  return (
    <article className={`project-card${hidden ? ' is-hidden' : ''}`} data-tags={item.category} aria-hidden={hidden || undefined} data-reveal>
      <Link className="project-card-image" to={href}>
        <img src={asset(item.image)} alt={item.alt} loading="lazy" />
        <span className="project-status">Concept study</span>
        <span className="project-overlay" aria-hidden="true"><strong>{item.name}</strong><span>{item.location}</span><span>Explore</span></span>
        <span className="project-open" aria-hidden="true"><Icon name="arrow" /></span>
      </Link>
      <div className="project-meta">
        <div>
          <span className="project-kicker">{pad(index)} / {item.typology}</span>
          <h3><Link to={href}>{item.name}</Link></h3>
          <p>{item.location}</p>
        </div>
        <span className="project-style">{item.style}</span>
      </div>
    </article>
  );
}

export function ArticleCard({ item }: { item: Article }) {
  const href = `/journal/${item.slug}/`;
  return (
    <article className="journal-card" data-reveal>
      <Link className="journal-card-image" to={href}>
        <img src={asset(item.image)} alt={item.alt} loading="lazy" />
        <Arrow />
      </Link>
      <div className="journal-meta"><span>{item.category}</span><span>{item.read_time}</span></div>
      <h3><Link to={href}>{item.title}</Link></h3>
      <p>{item.excerpt}</p>
      <TextLink href={href}>Read the article</TextLink>
    </article>
  );
}
