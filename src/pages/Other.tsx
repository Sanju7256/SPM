import { LeadForm } from '../components/LeadForm';
import { Arrow, WhatsAppGlyph } from '../components/Icons';
import { ProcessSteps } from '../components/ProcessSteps';
import { Breadcrumbs, Button, CtaBand, Eyebrow, Lines, SectionHeading, TextLink } from '../components/ui';
import { config, telHref } from '../config';
import { asset, highPriority } from '../content';

export function ProcessPage() {
  return (
    <>
      <Breadcrumbs items={[['Process', null]]} />
      <section className="process-hero wrap">
        <div data-reveal>
          <Eyebrow text="THE SPM DESIGN JOURNEY" />
          <h1><Lines lines={['Good work begins', <>with <em>good questions.</em></>]} /></h1>
          <p className="hero-lede">A clear, collaborative process gives the ideas, decisions and details room to come together.</p>
          <Button href="/consultation/">Start with a conversation</Button>
        </div>
        <div className="process-hero-art" data-reveal>
          <img src={asset('materials-study.jpg')} alt="A considered selection of timber, stone, textile and terracotta materials" {...highPriority} />
          <span>SPM / MATERIAL STUDY</span>
        </div>
      </section>
      <section className="process-detail section-pad">
        <div className="wrap">
          <SectionHeading eyebrow="SIX CONSIDERED STEPS" number="01" title={['One clear next step', <em key="e">at a time.</em>]}>
            <p>Project scope and sequence depend on the brief and final agreement; this is a guide to the design conversation.</p>
          </SectionHeading>
          <ProcessSteps />
        </div>
      </section>
      <section className="process-expectations section-pad">
        <div className="wrap expectations-grid">
          <div data-reveal>
            <Eyebrow text="CLARITY IS PART OF THE DESIGN" number="02" />
            <h2><Lines lines={['Shared decisions.', <em key="e">Better direction.</em>]} /></h2>
          </div>
          <div data-reveal>
            <p>At each stage, the aim is to make decisions visible: what is being explored, what needs your input and what comes next. Deliverables, costs, approvals, procurement and construction responsibility should be confirmed in writing before work proceeds.</p>
            <TextLink href="/services/">Explore services</TextLink>
          </div>
        </div>
      </section>
      <CtaBand kicker="READY WHEN YOU ARE" title={['Start with the', <em key="e">space you have.</em>]} copy="Tell us what is changing, what matters most and how you would like the home to feel." />
    </>
  );
}

export function ContactPage() {
  const hasContact = Boolean(config.email || config.phones.length || config.whatsappUrl || config.office);
  return (
    <>
      <Breadcrumbs items={[['Contact', null]]} />
      <section className="contact-hero wrap">
        <div data-reveal>
          <Eyebrow text="CONTACT / START A CONVERSATION" />
          <h1><Lines lines={['Let’s talk about', <em key="e">your home.</em>]} /></h1>
          <p className="hero-lede">Tell us what you are imagining, what feels unclear or where you would like to begin.</p>
          <div className="contact-links">
            {config.email ? <a className="contact-configured" data-email-link href={`mailto:${config.email}`}>{config.email}</a> : null}
            {config.phones.length ? (
              <div className="contact-phone-links">
                {config.phones.map((n) => <a key={n} className="contact-configured" data-phone-link href={telHref(n)} aria-label={`Call SPM Interiors Design at ${n}`}>{n}</a>)}
              </div>
            ) : null}
            {config.whatsappUrl ? <a className="contact-configured" data-wa-link href={config.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppGlyph /> Message on WhatsApp <Arrow /></a> : null}
            {!hasContact ? <p className="contact-unconfigured" data-contact-empty>Public studio contact details will appear here once confirmed.</p> : null}
          </div>
          <a className="map-search" href="https://www.google.com/maps/search/?api=1&query=Chandapur%2C%20Bangalore-560099" target="_blank" rel="noopener">Explore Chandapur, Bangalore-560099 on Google Maps <Arrow /></a>
          <p className="contact-map-note">This opens a general map search; contact the studio to confirm the exact office pin before visiting.</p>
        </div>
        <div className="contact-visual" data-reveal>
          <img src={asset('spm-hero-bangalore.jpg')} alt="Quiet contemporary home concept with a courtyard, natural teak and warm daylight" {...highPriority} />
          <span>BANGALORE / SOUTH INDIA</span>
        </div>
      </section>
      <section className="contact-form-section section-pad">
        <div className="wrap contact-layout">
          <div data-reveal>
            <Eyebrow text="A FEW DETAILS HELP" number="01" />
            <h2><Lines lines={['Share the', <em key="e">starting point.</em>]} /></h2>
            <p>Use the form to describe the home and the kind of support you are looking for. The form will confirm whether enquiry delivery is configured before any details are sent.</p>
            <div className="contact-note"><span>SPM / RESPONSE</span><p>Response times and project availability will be confirmed directly by the studio.</p></div>
          </div>
          <div className="contact-form-panel"><LeadForm formId="contact-form" /></div>
        </div>
      </section>
      <CtaBand kicker="PREFER A FIRST CHAT?" title={['Begin with a', <em key="e">simple question.</em>]} copy="Book a consultation request or share a note through the enquiry form." />
    </>
  );
}

export function ConsultationPage() {
  return (
    <>
      <Breadcrumbs items={[['Consultation', null]]} />
      <section className="consultation-hero wrap">
        <div data-reveal>
          <Eyebrow text="A GOOD PLACE TO START" />
          <h1><Lines lines={['Let’s make room', <>for <em>what matters.</em></>]} /></h1>
          <p className="hero-lede">A first conversation is a chance to share your ideas, understand the possibilities and see what a useful next step might be.</p>
          <div className="consult-points">
            <p><span>01</span> Tell us about the space</p>
            <p><span>02</span> Share what matters to you</p>
            <p><span>03</span> Outline the next decision</p>
          </div>
        </div>
        <div className="consultation-image" data-reveal>
          <img src={asset('spm-hero-bangalore.jpg')} alt="A warm South Indian home interior concept with natural timber and quiet daylight" {...highPriority} />
        </div>
      </section>
      <section className="consultation-form-section section-pad">
        <div className="wrap consultation-layout">
          <div data-reveal>
            <Eyebrow text="BOOK A DESIGN CONSULTATION" number="01" />
            <h2><Lines lines={['Tell us a little', <em key="e">about your project.</em>]} /></h2>
            <p>Fields marked * are required. Your information is not sent unless a secure form endpoint has been configured for the site.</p>
            <TextLink href="/process/">See the design process</TextLink>
          </div>
          <div className="consult-form-panel"><LeadForm /></div>
        </div>
      </section>
    </>
  );
}

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const title = kind === 'privacy' ? 'Privacy Notice' : 'Terms & Conditions';
  const body = kind === 'privacy' ? (
    <>
      <h2>About this website</h2><p>This site is a design showcase for SPM Interiors Design. Replace this sample notice with an accurate, reviewed policy before collecting enquiries from the public.</p>
      <h2>Enquiry information</h2><p>The website only transmits enquiry form fields when a public lead endpoint is configured. The endpoint owner must explain the information collected, purpose, lawful basis, retention, processors and contact route. Never place server secrets in browser code.</p>
      <h2>Analytics and external services</h2><p>No analytics service is configured in this static project. External links, fonts and any future embedded services may process technical data under their own terms.</p>
      <h2>Before launch</h2><p>Confirm the data controller, business contact details, applicable jurisdiction, form processor and retention practices, then have the production notice reviewed by a qualified professional. This sample is not legal advice.</p>
    </>
  ) : (
    <>
      <h2>Illustrative design concepts</h2><p>Concept imagery, example project studies and placeholder elements on this site are illustrative and do not claim completed client work, measured outcomes or guaranteed results.</p>
      <h2>Project scope</h2><p>Services, fees, timelines, deliverables, procurement, execution responsibility, warranties and handover arrangements must be agreed in a separate written contract before work begins.</p>
      <h2>Materials and installation</h2><p>Final product selection and installation requirements depend on the actual site, manufacturer specifications and qualified professional advice.</p>
      <h2>Using this website</h2><p>This sample page should be replaced with production terms appropriate to the real business and jurisdiction, reviewed by a qualified professional. It is not legal advice.</p>
    </>
  );
  return (
    <>
      <Breadcrumbs items={[[title, null]]} />
      <section className="legal-page wrap">
        <div className="legal-heading">
          <Eyebrow text="SPM INTERIORS DESIGN / INFORMATION" />
          <h1><Lines lines={[title]} /></h1>
          <p className="hero-lede">A clear starting point for understanding this showcase.</p>
        </div>
        <div className="legal-copy">{body}<p className="legal-updated">Sample copy · Confirm and review before public launch.</p></div>
      </section>
    </>
  );
}
