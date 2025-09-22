import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const { user } = useAuth();

  // Local images only (shuffle/reuse as needed)
  const images = ['/images/image.png', '/images/LOGO-LSSI-1024x425.png', '/images/Icon.png'];

  const slides = [
    {
      title: 'People. Empower. Impact.',
      subtitle: 'Learn. Grow. Succeed with LMS',
      ctaLabel: user ? 'Browse Library' : 'Explore Our Solutions',
      ctaHref: user ? '/catalog' : '/catalog',
      img: images[0]
    },
    {
      title: 'Innovate. Transform. Succeed.',
      subtitle: 'Courses, books, and resources for life-long learning',
      ctaLabel: user ? 'Continue Learning' : 'Get Started',
      ctaHref: user ? '/my-library' : '/signup',
      img: images[1]
    },
    {
      title: 'Your Trusted Learning Partner',
      subtitle: 'From kids to professionals—everything you need, in one place',
      ctaLabel: 'See Our Catalog',
      ctaHref: '/catalog',
      img: images[2]
    }
  ];

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, slides.length]);

  const goTo = (idx) => setCurrent(idx % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  const ecosystem = [
    {
      title: 'Digital Library',
      desc: 'Thousands of titles across categories',
      href: '/catalog',
      img: images[0]
    },
    {
      title: 'Learning Paths',
      desc: 'Curated tracks for focused growth',
      href: '/catalog',
      img: images[1]
    },
    {
      title: 'Resources & Tools',
      desc: 'Templates, guides, and more',
      href: '/catalog',
      img: images[2]
    },
    {
      title: 'About LMS',
      desc: 'Our mission and approach',
      href: '/about',
      img: images[1]
    }
  ];

  const accolades = [
    { label: 'Quality Learning', img: images[2] },
    { label: 'Trusted by Readers', img: images[0] },
    { label: 'Community First', img: images[1] },
    { label: 'Continuous Innovation', img: images[2] }
  ];

  const news = [
    {
      title: 'New courses launched this month',
      date: 'August 2025',
      href: '/blog',
      img: images[0]
    },
    {
      title: 'LMS adds AI-powered narration',
      date: 'July 2025',
      href: '/blog',
      img: images[1]
    },
    {
      title: 'Partnering with institutions',
      date: 'June 2025',
      href: '/blog',
      img: images[2]
    }
  ];

  const allies = [images[0], images[1], images[2], images[0], images[1], images[2]];

  return (
    <div className="landing">
      {/* Hero Slider */}
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className={`slide ${i === current ? 'active' : ''}`}
            aria-hidden={i !== current}
          >
            <div className="slide-bg">
              <img src={s.img} alt="Slide background" />
              <div className="bg-overlay" />
            </div>
            <div className="slide-content container">
              <h1 className="title">{s.title}</h1>
              <p className="subtitle">{s.subtitle}</p>
              <Link href={s.ctaHref}>
                <button className="btn-primary hero-cta">{s.ctaLabel}</button>
              </Link>
            </div>
          </div>
        ))}

        <button className="nav prev" aria-label="Previous" onClick={prev}>
          ‹
        </button>
        <button className="nav next" aria-label="Next" onClick={next}>
          ›
        </button>

        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? 'active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </section>

      {/* Ecosystem */}
      <section className="ecosystem">
        <div className="container">
          <h2 className="section-title">Our Ecosystem</h2>
          <div className="grid ecos">
            {ecosystem.map((e, idx) => (
              <Link key={idx} href={e.href} className="eco-card">
                <div className="eco-media">
                  <img src={e.img} alt="Ecosystem" />
                </div>
                <div className="eco-body">
                  <h3>{e.title}</h3>
                  <p>{e.desc}</p>
                  <span className="link">Learn More →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Accolades */}
      <section className="accolades">
        <div className="container">
          <h2 className="section-title">Our Accolades</h2>
          <div className="grid acc">
            {accolades.map((a, idx) => (
              <div key={idx} className="acc-card">
                <img src={a.img} alt={a.label} />
                <p>{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Events */}
      <section className="news">
        <div className="container">
          <h2 className="section-title">News & Events</h2>
          <div className="grid news-grid">
            {news.map((n, idx) => (
              <Link key={idx} href={n.href} className="news-card">
                <div className="news-media">
                  <img src={n.img} alt={n.title} />
                </div>
                <div className="news-body">
                  <span className="date">{n.date}</span>
                  <h3>{n.title}</h3>
                  <span className="link">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="center mt-24">
            <Link href="/blog">
              <button className="btn-outline">View All News</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Allies */}
      <section className="allies">
        <div className="container">
          <h2 className="section-title">Allies in Awesomeness</h2>
          <div className="ally-strip">
            {allies.map((src, i) => (
              <div key={i} className="ally">
                <img src={src} alt="Ally logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to make an impact?</h2>
            <p>Join LMS and start your learning journey today.</p>
            {!user ? (
              <Link href="/signup">
                <button className="btn-primary large">Get Started</button>
              </Link>
            ) : (
              <Link href="/catalog">
                <button className="btn-primary large">Browse Library</button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing {
          background: var(--bg-color);
        }

        /* Hero */
        .hero { position: relative; height: 68vh; min-height: 520px; overflow: hidden; }
        .slide { position: absolute; inset: 0; opacity: 0; transition: opacity .6s ease; }
        .slide.active { opacity: 1; }
        .slide-bg { position: absolute; inset: 0; }
        .slide-bg img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }
        .bg-overlay { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(0,0,0,.45), rgba(0,0,0,.15)); }
        .slide-content { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; justify-content: center; }
        .title { color: #fff; font-size: 3rem; line-height: 1.1; margin: 0 0 .5rem 0; }
        .subtitle { color: #fff; opacity: .9; font-size: 1.2rem; margin: 0 0 1.5rem 0; }
        .hero-cta { font-size: 1rem; padding: 12px 20px; }
        .nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,.35); color: #fff; border: 0; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; }
        .nav.prev { left: 16px; }
        .nav.next { right: 16px; }
        .dots { position: absolute; bottom: 14px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; background: transparent; cursor: pointer; opacity: .7; }
        .dot.active { background: #fff; opacity: 1; }

        /* Sections */
        .section-title { text-align: center; font-size: 2rem; margin: 3rem 0 1.5rem; color: var(--text-color); }
        .grid { display: grid; gap: 18px; }
        .ecosystem .grid.ecos { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
        .eco-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease; }
        .eco-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px var(--shadow-color); }
        .eco-media { height: 140px; overflow: hidden; background: var(--light-gray); display:flex; align-items:center; justify-content:center; }
        .eco-media img { width: 100%; height: 100%; object-fit: cover; }
        .eco-body { padding: 14px 16px; }
        .eco-body h3 { margin: 4px 0 6px; font-size: 1.1rem; }
        .eco-body p { margin: 0 0 8px; color: var(--text-muted); font-size: .95rem; }
        .eco-body .link { color: var(--primary-color); font-weight: 600; font-size: .9rem; }

        /* Accolades */
        .accolades .grid.acc { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .acc-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; text-align:center; padding: 16px; }
        .acc-card img { width: 100%; height: 90px; object-fit: contain; margin-bottom: 10px; filter: saturate(.9); }
        .acc-card p { margin: 0; font-weight: 500; color: var(--text-color); }

        /* News */
        .news-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
        .news-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease; display:flex; flex-direction:column; }
        .news-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px var(--shadow-color); }
        .news-media { height: 160px; background: var(--light-gray); display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .news-media img { width: 100%; height: 100%; object-fit: cover; }
        .news-body { padding: 14px 16px; }
        .news-body .date { font-size: .85rem; color: var(--text-muted); }
        .news-body h3 { margin: 6px 0 10px; font-size: 1.05rem; }
        .center { display:flex; justify-content:center; }
        .mt-24 { margin-top: 24px; }

        /* Allies */
        .allies { padding: 20px 0 10px; }
        .ally-strip { display:flex; gap: 20px; overflow-x:auto; padding: 6px 0; }
        .ally { flex: 0 0 auto; background: var(--card-bg); border:1px solid var(--border-color); border-radius: 10px; padding: 10px 16px; display:flex; align-items:center; justify-content:center; }
        .ally img { height: 36px; width: auto; object-fit: contain; }

        /* CTA */
        .cta { padding: 40px 0 60px; }
        .cta-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-radius: 16px; padding: 28px; text-align:center; box-shadow: 0 14px 30px rgba(0,0,0,.15); }
        .cta-card h2 { margin: 0 0 6px; font-size: 1.8rem; }
        .cta-card p { margin: 0 0 16px; opacity: .95; }

        /* Responsive */
        @media (max-width: 768px) {
          .hero { height: 56vh; min-height: 420px; }
          .title { font-size: 2rem; }
          .subtitle { font-size: 1rem; }
          .eco-media { height: 120px; }
          .news-media { height: 140px; }
        }
      `}</style>
    </div>
  );
}