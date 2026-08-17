import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/landing.css'

const FAQ_ITEMS = [
  {
    q: "How does SmartHR's AI resume screening work?",
    a: 'SmartHR parses each resume and compares its skills and experience against the job description using semantic matching, then generates a transparent match score.',
  },
  {
    q: 'Is candidate information secure?',
    a: 'Yes. All candidate data is encrypted in transit and at rest, with access limited to authorized recruiters on each job.',
  },
  {
    q: 'Can recruiters override AI recommendations?',
    a: 'Recruiters always review and approve AI-ranked candidates before any hiring decision is made.',
  },
  {
    q: 'Can multiple recruiters collaborate?',
    a: 'Yes, teams can share job postings, leave notes on candidates, and track hiring progress together.',
  },
  {
    q: 'How does bias detection work?',
    a: 'The system flags ranking patterns that correlate with protected attributes and surfaces them to recruiters for review.',
  },
  {
    q: 'How is candidate ranking calculated?',
    a: 'Rankings combine semantic skill match, experience relevance, and role fit, with each factor shown in a breakdown.',
  },
]

const STEPS = [
  { icon: '📋', n: 1, text: 'Recruiter creates a job posting' },
  { icon: '🙋', n: 2, text: 'Candidate applies for the job' },
  { icon: '📄', n: 3, text: 'Resume is uploaded' },
  { icon: '🧠', n: 4, text: 'AI parses the resume' },
  { icon: '🔗', n: 5, text: 'Semantic matching compares with job description' },
  { icon: '💡', n: 6, text: 'Explainable AI generates scores' },
  { icon: '⚖️', n: 7, text: 'Bias detection validates fairness' },
  { icon: '👀', n: 8, text: 'Recruiter reviews recommendations' },
  { icon: '✉️', n: 9, text: 'Interview invitation sent' },
]

const FEATURES = [
  { icon: '🧠', title: 'Semantic Resume Screening', desc: 'Our AI understands candidate experience beyond ATS keywords.' },
  { icon: '📊', title: 'Explainable Candidate Ranking', desc: 'See exactly why every applicant receives a particular score.' },
  { icon: '🛡️', title: 'Bias Detection', desc: 'Automatically identify and reduce unfair hiring decisions.' },
  { icon: '🧑‍💼', title: 'Recruiter Validation', desc: 'Recruiters review and approve AI recommendations before hiring.' },
  { icon: '👤', title: 'Candidate Analytics', desc: 'Visualize strengths, weaknesses, skills, certifications and more.' },
  { icon: '⏱️', title: 'Real-Time Dashboard', desc: 'Track recruitment performance with interactive analytics.' },
]

const CANDIDATES = [
  { rank: 1, name: 'Ada Johnson', score: 94, width: '94%', exp: '5 yrs' },
  { rank: 2, name: 'Michael Brown', score: 91, width: '91%', exp: '4 yrs' },
  { rank: 3, name: 'Chisom Okafor', score: 89, width: '89%', exp: '6 yrs' },
  { rank: 4, name: 'Daniel Smith', score: 86, width: '86%', exp: '3 yrs' },
  { rank: 5, name: 'Sarah Williams', score: 84, width: '84%', exp: '4 yrs' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="landing-page">
      <header className="nav">
        <div className="wrap nav-inner">
          <div className="logo"><span className="logo-mark">in</span> SmartHR</div>
          <nav className="nav-links">
            <a href="#" className="active">Home</a>
            <a href="#">Jobs</a>
            <a href="#">For Candidates</a>
            <a href="#">For Recruiters</a>
            <a href="#how">How It Works</a>
            <a href="#">About</a>
            <a href="#">Pricing</a>
            <a href="#">Contact</a>
          </nav>
          <div className="nav-right">
            <Link to="/login" className="login">Login</Link>
            <Link to="/signup" className="btn btn-gold">Create Account →</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Smarter Hiring.<br />Better Careers.<br />Powered by<br /><span className="accent">Explainable AI.</span></h1>
            <p className="sub">SmartHR helps organizations discover the best talent through AI-powered resume screening, semantic candidate matching, transparent ranking, and recruiter validation.</p>
            <div className="hero-ctas">
              <Link to="/signup" className="btn btn-gold">Get Started →</Link>
              <a href="#" className="btn btn-outline-light">Browse Jobs ○</a>
            </div>
            <div className="hero-badges">
              {['Trusted AI Matching', 'Bias-Aware Ranking', 'Explainable Decisions', 'Enterprise Security'].map((label) => (
                <span key={label}><i className="dot">✓</i> {label}</span>
              ))}
            </div>
          </div>

          <div className="dash-shell">
            <div className="dash-side">
              <div className="dside-logo"><span className="logo-mark" style={{ width: 24, height: 24, fontSize: 11 }}>in</span> SmartHR</div>
              {['▦ Dashboard', '▤ Jobs', '◎ Candidates', '▲ Ranking', '▥ Analytics', '▦ Reports', '⚙ Settings'].map((item, i) => (
                <div key={item} className={`dside-item${i === 0 ? ' active' : ''}`}>{item}</div>
              ))}
            </div>
            <div className="dash-main">
              <div className="dm-top">
                <h4>Dashboard</h4>
                <div className="who"><span className="avatar-dot" /> John Recruiter</div>
              </div>
              <div className="kpi-row">
                <div className="kpi"><div className="label">Top Candidates</div><div className="value">245</div><div className="delta up">+18% from last week</div></div>
                <div className="kpi"><div className="label">AI Match Score</div><div className="value">96%</div><div className="delta up">Excellent Match</div></div>
                <div className="kpi"><div className="label">Bias Detection</div><div className="value" style={{ fontSize: 14 }}>Passed</div><div className="delta neutral">No bias detected</div></div>
                <div className="kpi"><div className="label">AI Confidence</div><div className="value">98%</div><div className="delta up">High Confidence</div></div>
              </div>
              <div className="dm-cols">
                <div className="panel">
                  <h5>Top Ranked Candidates</h5>
                  {CANDIDATES.map((c) => (
                    <div key={c.rank} className="cand-row">
                      <span className="cand-rank">{c.rank}</span>
                      <span className="cand-avatar" />
                      <span className="cand-name">{c.name}</span>
                      <span className="cand-score">{c.score}%</span>
                      <span className="cand-bar"><i style={{ width: c.width }} /></span>
                      <span className="cand-exp">{c.exp}</span>
                    </div>
                  ))}
                  <a className="view-all" href="#">View All Candidates</a>
                </div>
                <div>
                  <div className="panel">
                    <h5>Candidate Analytics</h5>
                    <div className="radar-wrap">
                      <svg width="130" height="110" viewBox="0 0 130 110">
                        <polygon points="65,10 110,35 110,75 65,100 20,75 20,35" fill="none" stroke="#e4e7ed" strokeWidth="1" />
                        <polygon points="65,35 90,48 90,68 65,85 40,68 40,48" fill="none" stroke="#e4e7ed" strokeWidth="1" />
                        <polygon points="65,20 100,38 95,72 65,92 32,70 28,40" fill="#3b6ff0" fillOpacity="0.18" stroke="#3b6ff0" strokeWidth="1.5" />
                        <polygon points="65,42 85,50 84,66 65,80 45,65 44,50" fill="#f2a900" fillOpacity="0.25" stroke="#f2a900" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="legend-row">
                      <span><i style={{ background: '#3b6ff0' }} /> Top Candidate</span>
                      <span><i style={{ background: '#f2a900' }} /> Average</span>
                    </div>
                  </div>
                  <div className="panel apps-panel">
                    <h5>Recent Applications</h5>
                    <div className="app-row"><span className="n">Frontend Developer</span><span className="c">32 New</span></div>
                    <div className="app-row"><span className="n">Data Analyst</span><span className="c">28 New</span></div>
                    <div className="app-row"><span className="n">AI Engineer</span><span className="c">15 New</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="logos">
        <div className="wrap">
          <p className="eyebrow-center">Trusted by Forward-Thinking Organizations</p>
          <div className="logo-row">
            {['Google', '◆ Microsoft', 'amazon', '∞ Meta', '⌘ Flutterwave', 'MTN', '☰ paystack', 'Interswitch⚡'].map((name) => (
              <span key={name} className="lg">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Powerful Features</p>
            <h2>Everything You Need for Intelligent Recruitment</h2>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feat-card">
                <div className="feat-ic">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="wrap">
          <p className="eyebrow">How Smart-HR Works</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>From Application to Hire in 9 Simple Steps</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.n} className="step">
                <div className="circ">{s.icon}<span className="num">{s.n}</span></div>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="split">
        <div className="split-panel candidates">
          <p className="tag">For Candidates</p>
          <h3>Find the Right Opportunity Faster</h3>
          <p>Create your SmartHR account, explore jobs, submit applications, and receive AI-powered feedback on how your profile matches each role.</p>
          <Link to="/signup?role=employer" className="btn btn-gold" style={{ width: 'fit-content' }}>Create Employer Account →</Link>
          <div className="split-img">
            <div className="float-card top-right"><div className="t">94%</div><div className="s">AI Match Score · Great Match</div></div>
            <div className="float-card bottom-left">
              <div className="s" style={{ marginBottom: 5 }}>Skills Match</div>
              {['Python', 'SQL', 'Machine Learning'].map((skill) => (
                <div key={skill} className="pill-row">{skill} <span className="pill-ok">✓</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="split-panel recruiters">
          <p className="tag">For Recruiters</p>
          <h3>Hire Better Candidates in Less Time</h3>
          <p>Post jobs, receive AI-ranked applicants, compare candidates, review transparent AI explanations, and make confident hiring decisions.</p>
          <Link to="/signup?role=recruiter" className="btn btn-gold" style={{ width: 'fit-content' }}>Create Recruiter Account →</Link>
          <div className="split-img">
            <div className="float-card top-right"><div className="t">94%</div><div className="s">Top Candidate Insights · Overall Score</div></div>
            <div className="float-card bottom-left"><div className="t">Passed</div><div className="s">Bias Detection · No bias detected</div></div>
          </div>
        </div>
      </section>

      <section className="insights">
        <div className="wrap insights-grid">
          <div className="insight-shell">
            <div className="dash-side" style={{ borderRadius: 10 }}>
              <div className="dside-logo"><span className="logo-mark" style={{ width: 22, height: 22, fontSize: 10 }}>in</span> SmartHR</div>
              {['▦ Dashboard', '▤ Jobs', '◎ Candidates', '▲ Ranking', '▥ Analytics', '▦ Reports', '⚙ Settings'].map((item, i) => (
                <div key={item} className={`dside-item${i === 0 ? ' active' : ''}`}>{item}</div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Powerful Dashboard</p>
            <h2 style={{ fontSize: 30, fontWeight: 800, margin: '8px 0 26px' }}>All Your Hiring Insights in One Place</h2>
            <ul className="insight-list">
              <li><span className="insight-ic">🧠</span><div><h4>AI-powered insights</h4><p>that help you hire smarter.</p></div></li>
              <li><span className="insight-ic">📈</span><div><h4>Real-time analytics</h4><p>on your recruitment pipeline.</p></div></li>
              <li><span className="insight-ic">📤</span><div><h4>Export reports</h4><p>and make data-driven decisions.</p></div></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="wrap stats-row">
          {[['👥', '50,000+', 'Candidates Screened'], ['🛡️', '2,500+', 'Companies'], ['🎯', '98%', 'AI Matching Accuracy'], ['⏱️', '70%', 'Reduction in Screening Time']].map(([icon, num, lbl]) => (
            <div key={lbl} className="stat"><span className="stat-ic">{icon}</span><div><div className="num">{num}</div><div className="lbl">{lbl}</div></div></div>
          ))}
        </div>
      </section>

      <section className="testi">
        <div className="wrap">
          <p className="eyebrow">What Our Users Say</p>
          <div className="testi-grid">
            {[
              { body: 'SmartHR has transformed how we hire. The AI matching is incredibly accurate and saves us so much time.', name: 'Jane Cooper', role: 'HR Manager, Flutterwave' },
              { body: "The transparency of SmartHR's AI scoring helps us make fairer and more confident hiring decisions.", name: 'David Okoro', role: 'Talent Acquisition Lead, MTN' },
              { body: 'As a job seeker, the AI feedback helped me improve my resume and land better opportunities.', name: 'Adaeze Nwankwo', role: 'Data Analyst' },
            ].map((t) => (
              <div key={t.name} className="testi-card">
                <div className="quote">“</div>
                <p className="body">{t.body}</p>
                <div className="stars">★★★★★</div>
                <div className="testi-person"><span className="testi-avatar" /><div><div className="name">{t.name}</div><div className="role">{t.role}</div></div></div>
              </div>
            ))}
          </div>
          <div className="dots"><i className="active" /><i /><i /></div>
        </div>
      </section>

      <section className="faq">
        <div className="wrap">
          <p className="eyebrow">Frequently Asked Questions</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>You Ask, We Answer</h2>
          <div className="faq-grid">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <div className="faq-q" role="button" tabIndex={0} onClick={() => setOpenFaq(openFaq === i ? null : i)} onKeyDown={(e) => e.key === 'Enter' && setOpenFaq(openFaq === i ? null : i)}>
                  {item.q} <span className="chev">⌄</span>
                </div>
                <div className="faq-a"><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta wrap">
        <div>
          <h2>Ready to Transform Your Hiring Process?</h2>
          <p>Join SmartHR today and experience transparent AI-powered recruitment.</p>
          <div className="cta-ctas">
            <Link to="/signup" className="btn btn-gold">Create Account →</Link>
            <a href="#" className="btn btn-outline-light">Schedule Demo</a>
          </div>
        </div>
        <div className="cta-art" />
      </div>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo"><span className="logo-mark">in</span> SmartHR</div>
              <p>AI-powered recruitment platform for smarter hiring and better careers.</p>
              <div className="social-row"><a href="#">in</a><a href="#">𝕏</a><a href="#">f</a><a href="#">▶</a></div>
            </div>
            <div><h5>Quick Links</h5><ul>{['Home', 'Jobs', 'For Candidates', 'For Recruiters', 'Pricing', 'About Us'].map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul></div>
            <div><h5>Resources</h5><ul>{['Blog', 'Help Center', 'Guides', 'AI in Hiring', 'Case Studies'].map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul></div>
            <div><h5>Support</h5><ul>{['Contact Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul></div>
            <div>
              <h5>Contact Us</h5>
              <ul className="foot-contact">
                <li>✉️ hello@smarthr.com</li>
                <li>📞 +234 800 123 4567</li>
                <li>📍 123 Innovation Drive, Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom"><span>© 2026 SmartHR. All Rights Reserved.</span></div>
        </div>
      </footer>
    </div>
  )
}
