import { useEffect, useRef, useState } from 'react';

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

function CalendarLinks({ churchOnly }) {
  const start = '20270127T024500Z';
  const end = '20270127T034500Z';
  const calendarUrl = new URL('https://calendar.google.com/calendar/render');
  calendarUrl.search = new URLSearchParams({
    action: 'TEMPLATE',
    text: churchOnly
      ? 'Shenal Fernando & Christina Perera’s Wedding Mass'
      : 'Shenal Fernando & Christina Perera’s Wedding',
    dates: `${start}/${end}`,
    details: churchOnly
      ? 'Wedding Mass at St. Anne’s Church, Kurana at 8:15 AM. RSVP by 15 December 2026.'
      : 'Wedding Mass at St. Anne’s Church, Kurana at 8:15 AM. Reception at Ranowell Hotel, Kochchikade, Negombo. RSVP by 15 December 2026.',
    location: 'St. Anne’s Church, Kurana',
    ctz: 'Asia/Colombo',
  }).toString();

  return (
    <div className="calendar-actions">
      <a className="button button--light" href={calendarUrl.toString()} target="_blank" rel="noreferrer">
        <span aria-hidden="true">↗</span> Google Calendar
      </a>
      <a className="button button--outline" href={churchOnly ? '/shenal-and-christina-church-wedding.ics' : '/shenal-and-christina-wedding.ics'} download>
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

function BackgroundMusic({ audioRef, isPlaying, audioError, onToggle, onPlay, onPause, onError }) {
  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src="/A%20Thousand%20Years%20by%20Christina%20Perri%20Violin%20Cover%20Joel%20Grainger.mp3"
        loop
        preload="none"
        onError={onError}
        onPause={onPause}
        onPlay={onPlay}
      />
      <button
        aria-label={isPlaying ? 'Turn wedding music off' : 'Turn wedding music on'}
        aria-pressed={isPlaying}
        className="music-player__toggle"
        onClick={onToggle}
        type="button"
      >
        <span aria-hidden="true">♫</span>
        {isPlaying ? 'Turn music off' : 'Play A Thousand Years'}
      </button>
      {audioError && (
        <p className="music-player__message" role="status">
          Music could not start. Use the music button to try again.
        </p>
      )}
    </div>
  );
}

export default function App() {
  const currentPath = window.location.pathname;
  const isAllowedPath = currentPath === '/church-invitation' || currentPath === '/wedding-invitation';
  const churchOnly = currentPath === '/church-invitation';
  const [countdown, setCountdown] = useState(getCountdown);
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const [invitationOpened, setInvitationOpened] = useState(false);
  const [invitationOpening, setInvitationOpening] = useState(false);

  useEffect(() => {
    if (!isAllowedPath) return undefined;
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, [isAllowedPath]);

  async function startMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    setMusicError(false);
    try {
      await audio.play();
    } catch {
      setMusicError(true);
      setIsMusicPlaying(false);
    }
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      audioRef.current?.pause();
      return;
    }
    void startMusic();
  }

  function openInvitation() {
    if (invitationOpening) return;
    const audio = audioRef.current;
    if (audio) {
      setMusicError(false);
      audio.play().catch(() => setMusicError(true));
    }
    setInvitationOpening(true);
    window.setTimeout(() => setInvitationOpened(true), 2600);
  }

  if (!isAllowedPath) {
    return (
      <main className="not-found" role="alert">
        <p className="eyebrow">Page not found</p>
        <h1>This invitation link is not available.</h1>
        <p>Please check the URL you were given.</p>
      </main>
    );
  }

  return (
    <main>
      {!invitationOpened && (
        <section aria-labelledby="opening-title" aria-modal="true" className={`invitation-opening${invitationOpening ? ' invitation-opening--opening' : ''}`} role="dialog">
          <div className="invitation-opening__content">
            <p className="eyebrow" id="opening-title">A wedding invitation for you</p>
            <button aria-label="Open the wedding invitation and play music" className="invitation-opening__envelope-button" onClick={openInvitation} type="button">
              <span aria-hidden="true" className="invitation-opening__envelope">
                <span className="invitation-opening__card">You are invited</span>
                <span className="invitation-opening__back" />
                <span className="invitation-opening__flap" />
                <span className="invitation-opening__front" />
                <span className="invitation-opening__seal">C <i>&amp;</i> S</span>
              </span>
            </button>
            <p className="invitation-opening__hint">Click the envelope to open</p>
          </div>
        </section>
      )}
      <div className="invitation-site" inert={!invitationOpened}>
        <BackgroundMusic
          audioRef={audioRef}
          audioError={musicError}
          isPlaying={isMusicPlaying}
          onError={() => {
            setMusicError(true);
            setIsMusicPlaying(false);
          }}
          onPause={() => setIsMusicPlaying(false)}
          onPlay={() => {
            setMusicError(false);
            setIsMusicPlaying(true);
          }}
          onToggle={toggleMusic}
        />
        <section className="hero" id="home">
        <div className="hero__image" aria-hidden="true" />
        <div className="hero__wash" aria-hidden="true" />
        <a className="monogram" href="#home" aria-label="Christina and Shenal">
          <span>C</span><i>&amp;</i><span>S</span>
        </a>
        <div className="hero__content">
          <p className="hero__quote">“Many waters cannot quench love, neither can the floods drown it.”</p>
          <p className="hero__scripture">Song of Solomon 8:7</p>
          <p className="eyebrow hero__eyebrow">Together with our families</p>
          <h1><span>Christina <small>Perera</small></span><i>&amp;</i><span>Shenal <small>Fernando</small></span></h1>
          <p className="hero__invitation">joyfully invite you to celebrate their marriage</p>
          <p className="hero__date"><span>Wednesday</span><b>27</b><span>January 2027</span></p>
          <a className="button button--rose" href="#celebration">Explore the celebration <span aria-hidden="true">↓</span></a>
        </div>
        <a className="hero__scroll" href="#celebration">Scroll to explore <span aria-hidden="true">↓</span></a>
      </section>

      <section className="happy-couple section" id="celebration">
        <div className="happy-couple__head">
          <h2>The Happy Couple</h2>
          <span className="happy-couple__rule" aria-hidden="true" />
          <p>“Two hearts, one love story.”</p>
        </div>

        <div className="happy-couple__grid">
          <div className="happy-couple__person">
          <h3>Christina Perera</h3>
            <p className="happy-couple__role">The Bride</p>
          <p className="happy-couple__meta">Daughter of Mr. &amp; Mrs. Anton Priyantha Perera</p>
          <p className="happy-couple__quote">“I found my forever in Shenal’s eyes”</p>
          </div>

          <div className="happy-couple__person">
          <h3>Shenal Fernando</h3>
            <p className="happy-couple__role">The Groom</p>
          <p className="happy-couple__meta">Son of Mr. and Mrs. Eardly Niroshan Fernando</p>
          <p className="happy-couple__quote">“Christina makes every day feel like magic”</p>
          </div>
        </div>
      </section>

      <section className="celebration section" id="location">
        <div className="section-heading">
          <p className="eyebrow">The celebration</p>
          <h2>A day to remember</h2>
          <p className="section-heading__date">Wednesday, 27 January 2027</p>
        </div>
        <div className={`venue-grid${churchOnly ? ' venue-grid--church-only' : ''}`}>
          <Venue
            kind="Holy Matrimony"
            title="St. Anne’s Church, Kurana"
            time="Holy Mass at 8:15 am"
            description="Join us as we exchange our marriage vows in a sacred mass."
            map={churchMap}
            symbol="✝"
          />
          {!churchOnly && (
            <Venue
              kind="Wedding Reception"
              title="Ranowell Hotel"
              subtitle="Kochchikade, Negombo"
              description="We would be delighted to celebrate our wedding with you."
              map={hotelMap}
              symbol="❧"
            />
          )}
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
        <CalendarLinks churchOnly={churchOnly} />
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
        <p className="footer__names">Christina <i>&amp;</i> Shenal</p>
        <p>27 · 01 · 2027</p>
        <p className="footer__thanks">Made with love for our wedding celebration</p>
      </footer>
      </div>
    </main>
  );
}