import { useEffect, useRef, useState, type FormEvent } from 'react';
import { config } from '../config';
import { Arrow } from './Icons';

const SERVICE_OPTIONS = [
  'Home Interiors', 'Commercial Interiors', 'Office Interiors', 'Office Furniture',
  'Space-Saving Interiors', 'Modular Kitchen', 'Bedroom', 'Living Room',
  'Wardrobe', 'Custom Furniture', 'Other',
];
const BUDGETS = ['Under ₹5 Lakhs', '₹5–10 Lakhs', '₹10–15 Lakhs', '₹15–20 Lakhs', '₹20 Lakhs+'];

type Status = { text: string; error: boolean };

/** The form never fakes success: without a configured HTTPS endpoint it says nothing was sent. */
export function LeadForm({ formId = 'consultation-form' }: { formId?: string }) {
  const [status, setStatus] = useState<Status>({ text: '', error: false });
  const [busy, setBusy] = useState(false);
  const [minDate, setMinDate] = useState<string>();
  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const today = new Date();
    setMinDate(new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10));
  }, []);

  const report = (text: string, error: boolean, focus = false) => {
    setStatus({ text, error });
    if (focus) requestAnimationFrame(() => statusRef.current?.focus());
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      report('Please check the highlighted fields and try again.', true);
      return;
    }
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement | null;
    if (phoneInput && phoneInput.value.replace(/\D/g, '').length < 7) {
      phoneInput.setCustomValidity('Please enter at least 7 digits for your phone number.');
      phoneInput.reportValidity();
      phoneInput.setCustomValidity('');
      report('Please enter a valid phone number.', true);
      return;
    }
    if ((form.elements.namedItem('website') as HTMLInputElement | null)?.value) {
      report('Your request could not be processed.', true);
      return;
    }
    if (!config.leadEndpoint) {
      report('This preview is not connected to a secure enquiry service. Your information has not been sent or stored.', true, true);
      return;
    }
    const payload: Record<string, string> = {};
    new FormData(form).forEach((value, key) => { if (key !== 'website') payload[key] = String(value); });
    payload.page = window.location.pathname;
    setBusy(true);
    report('Sending your enquiry…', false);
    try {
      const response = await fetch(config.leadEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Enquiry endpoint returned ${response.status}`);
      form.reset();
      report('Thank you — the SPM Interiors Design team will contact you shortly.', false, true);
    } catch {
      report('We could not send your enquiry just now. Please try again later or use a configured contact channel.', true, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="lead-form" id={formId} data-lead-form noValidate onSubmit={onSubmit}>
      <div className="form-grid">
        <label>Your name *<input name="name" autoComplete="name" required maxLength={100} placeholder="Name" /></label>
        <label>Phone number *<input name="phone" type="tel" autoComplete="tel" required inputMode="tel" maxLength={24} placeholder="+91" /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" maxLength={160} placeholder="name@example.com" /></label>
        <label>City / project location *<input name="location" autoComplete="address-level2" required maxLength={120} placeholder="City / locality" /></label>
        <label className="form-full">What service are you looking for?
          <select name="service" defaultValue=""><option value="">Choose a service</option>{SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
        </label>
        <label>Property / space type
          <select name="property_type" defaultValue=""><option value="">Choose one</option>{['Apartment', 'Independent home', 'Villa', 'Office / workspace', 'Retail / showroom', 'Restaurant / café', 'Other', 'Still exploring'].map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label>Approximate space size
          <select name="home_size" defaultValue=""><option value="">Choose one</option>{['Compact space', '1–2 bedroom home', '3 bedroom home', '4+ bedroom home', 'Not sure yet'].map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label>Number of bedrooms
          <select name="bedrooms" defaultValue=""><option value="">Choose one</option>{['Studio / 1 bedroom', '2 bedrooms', '3 bedrooms', '4+ bedrooms', 'Not sure yet'].map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <fieldset className="budget-fieldset form-full">
          <legend>Estimated Budget</legend>
          <div className="budget-options">
            {BUDGETS.map((b) => <label className="budget-chip" key={b}><input type="radio" name="budget" value={b} /><span>{b}</span></label>)}
          </div>
        </fieldset>
        <label>Preferred design style
          <select name="style" defaultValue=""><option value="">Choose one</option>{['Warm minimal', 'Contemporary', 'Modern Indian', 'Classic', 'Not sure yet'].map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label>Preferred contact time
          <select name="contact_time" defaultValue=""><option value="">Choose one</option>{['Morning', 'Afternoon', 'Evening', 'Any time'].map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label>Preferred consultation date<input name="date" type="date" min={minDate} /></label>
        <label>Project timeline
          <select name="timeline" defaultValue=""><option value="">Choose one</option>{['As soon as practical', 'Within 1–3 months', 'Within 3–6 months', 'More than 6 months away', 'Still exploring'].map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className="form-full">Tell us a little about the project<textarea name="message" rows={4} maxLength={2000} placeholder="What would you like your space to feel like?" /></label>
      </div>
      <label className="form-honeypot" aria-hidden="true">Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <p className="form-consent">By submitting, you are asking SPM Interiors Design to respond to this enquiry. Do not include sensitive personal information. Details are sent only if a secure endpoint is configured.</p>
      <button className="button button-dark form-submit" type="submit" disabled={busy} aria-busy={busy || undefined}>Send my enquiry <Arrow /></button>
      <p className={`form-status${status.error ? ' is-error' : ''}`} data-form-status role="status" aria-live="polite" tabIndex={-1} ref={statusRef}>{status.text}</p>
    </form>
  );
}
