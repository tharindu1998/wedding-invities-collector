import { useEffect, useState } from 'react';

const weddingDate = new Date('2027-01-27T08:15:00+05:30');
const churchMap = 'https://maps.app.goo.gl/jAyANxSCMZVxp43Z7';
const hotelMap = 'https://maps.app.goo.gl/FJEhGb1gawxALT8T6';
const rsvpEndpoint = import.meta.env.VITE_RSVP_ENDPOINT || '/.netlify/functions/rsvp';

function getCountdown() {
  const remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const seconds = Math.floor(remaining / 1000);

  return [
    { value: Math.floor(seconds / 86400), label: 'days' },
    { value: Math.floor((seconds % 86400) / 3600), label: 'hours' },
    { value: Math.floor((seconds % 3600) / 60), label: 'minutes' },
    { value: seconds % 60, label: 'seconds' },
  ];
}

function CalendarLinks() {
  const start = '20270127T024500Z';
  const end = '20270127T034500Z';
  const calendarUrl = new URL('https://calendar.google.com/calendar/render');
  calendarUrl.search = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Shenal Fernando & Christina Perera’s Wedding',
    dates: `${start}/${end}`,
    details: 'Wedding Mass at St. Anne’s Church, Kurana at 8:15 AM. Reception at Ranowell Hotel, Kochchikade, Negombo. RSVP by 15 December 2026.',
    location: 'St. Anne’s Church, Kurana',
    ctz: 'Asia/Colombo',
  }).toString();

  return (
    <div className="calendar-actions">
      <a className="button button--light" href={calendarUrl.toString()} target="_blank" rel="noreferrer">
        <span aria-hidden="true">↗</span> Google Calendar
      </a>
      <a className="button button--outline" href="/shenal-and-christina-wedding.ics" download>
        <span aria-hidden="true">↓</span> Apple / Outlook
      </a>
    </div>
  );
}

function Venue({ kind, title, subtitle, time, description, map, symbol }) {
  return (
    <article className="venue">
      <span className="venue__symbol" aria-hidden="true">{symbol}</span>
      <p className="eyebrow">{kind}</p>
      <h3>{title}</h3>
      {subtitle && <p className="venue__subtitle">{subtitle}</p>}
      {time && <p className="venue__time">{time}</p>}
      <p className="venue__description">{description}</p>
      <a className="text-link" href={map} target="_blank" rel="noreferrer">
        View map <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

function RsvpForm() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!rsvpEndpoint) {
      setMessage('Online replies are not connected yet. Please RSVP by phone or WhatsApp using the contacts here.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const responseData = Object.fromEntries(formData.entries());
    responseData.submittedAt = new Date().toISOString();
    setSending(true);
    setMessage('');

    try {
      const response = await fetch(rsvpEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData),
      });
      if (!response.ok) throw new Error('RSVP request failed');
      const result = await response.json();
      if (result.ok !== true) throw new Error('RSVP was not confirmed');
      form.reset();
      setMessage('Thank you. Your reply has been received.');
    } catch {
      setMessage('Your reply could not be sent. Please RSVP by phone or WhatsApp instead.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Your name</span>
        <input autoComplete="name" name="name" placeholder="First and family name" required />
      </label>
      <fieldset className="field field--attendance">
        <legend>Will you be joining us?</legend>
        <label className="choice"><input name="attendance" type="radio" value="joyfully-accepts" required /> Joyfully accepts</label>
        <label className="choice"><input name="attendance" type="radio" value="regretfully-declines" /> Regretfully declines</label>
      </fieldset>
      <div className="field-row">
        <label className="field">
          <span>Guests attending</span>
          <select defaultValue="1" name="guestCount">
            {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Contact number</span>
          <input autoComplete="tel" name="phone" placeholder="Your phone number" type="tel" required />
        </label>
      </div>
      <label className="field">
        <span>A note for the couple <small>(optional)</small></span>
        <textarea name="message" placeholder="Leave a little note..." rows="3" />
      </label>
      <button className="button button--submit" disabled={sending} type="submit">
        {sending ? 'Sending…' : 'Send RSVP'}
      </button>
      <p aria-live="polite" className="form-message">{message}</p>
    </form>
  );
}

export default function App() {
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero__image" aria-hidden="true" />
        <div className="hero__wash" aria-hidden="true" />
        <a className="monogram" href="#home" aria-label="Shenal and Christina">
          <span>S</span><i>&amp;</i><span>C</span>
        </a>
        <div className="hero__content">
          <p className="hero__quote">“Many waters cannot quench love, neither can the floods drown it.”</p>
          <p className="hero__scripture">Song of Solomon 8:7</p>
          <p className="eyebrow hero__eyebrow">Together with our families</p>
          <h1><span>Shenal <small>Fernando</small></span><i>&amp;</i><span>Christina <small>Perera</small></span></h1>
          <p className="hero__invitation">joyfully invite you to celebrate their marriage</p>
          <p className="hero__date"><span>Wednesday</span><b>27</b><span>January 2027</span></p>
          <a className="button button--rose" href="#celebration">Explore the celebration <span aria-hidden="true">↓</span></a>
        </div>
        <a className="hero__scroll" href="#celebration">Scroll to explore <span aria-hidden="true">↓</span></a>
      </section>

      <section className="celebration section" id="celebration">
        <div className="section-heading">
          <p className="eyebrow">The celebration</p>
          <h2>A day to remember</h2>
          <p className="section-heading__date">Wednesday, 27 January 2027</p>
        </div>
        <div className="venue-grid">
          <Venue
            kind="Holy Matrimony"
            title="St. Anne’s Church, Kurana"
            time="Holy Mass at 8:15 am"
            description="Join us as we exchange our marriage vows in a sacred mass."
            map={churchMap}
            symbol="✝"
          />
          <Venue
            kind="Wedding Reception"
            title="Ranowell Hotel"
            subtitle="Kochchikade, Negombo"
            description="We would be delighted to celebrate our wedding with you."
            map={hotelMap}
            symbol="❧"
          />
        </div>
      </section>

      <section className="countdown section" aria-labelledby="countdown-title">
        <p className="eyebrow">Until we say “I do”</p>
        <h2 id="countdown-title">Counting down to our day</h2>
        <div className="countdown__grid" aria-label="Time until the wedding">
          {countdown.map(({ value, label }) => (
            <div className="countdown__unit" key={label}>
              <span>{String(value).padStart(2, '0')}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <CalendarLinks />
      </section>

      <section className="rsvp-section section" id="rsvp">
        <div className="rsvp-panel">
          <aside className="rsvp-panel__aside">
            <p className="eyebrow">Kindly reply by 15 December 2026</p>
            <h2>We hope you can join us.</h2>
            <p className="rsvp-panel__copy">Please let us know whether you’ll be joining us. We can’t wait to celebrate together.</p>
            <div className="contacts">
              <div className="contact">
                <span className="contact__name">Shenal</span>
                <a className="contact__number" href="tel:+61449721802">+61 44 972 1802</a>
                <a className="contact__whatsapp" href="https://wa.me/61449721802" aria-label="WhatsApp Shenal" target="_blank" rel="noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>
              </div>
              <div className="contact">
                <span className="contact__name">Christina</span>
                <a className="contact__number" href="tel:+94772794167">+94 77 279 4167</a>
                <a className="contact__whatsapp" href="https://wa.me/94772794167" aria-label="WhatsApp Christina" target="_blank" rel="noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <span aria-hidden="true" className="rsvp-panel__watermark">S &amp; C</span>
          </aside>
          <div className="rsvp-panel__form">
            <p className="eyebrow rsvp-panel__mobile-date">Kindly reply by 15 December 2026</p>
            <RsvpForm />
            <p className="privacy-note">Your details will only be used for our wedding guest list.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p className="footer__names">Shenal <i>&amp;</i> Christina</p>
        <p>27 · 01 · 2027</p>
        <p className="footer__thanks">Made with love for our wedding celebration</p>
      </footer>
    </main>
  );
}