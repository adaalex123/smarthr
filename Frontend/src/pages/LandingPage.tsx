import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/landing.css'

interface FaqItem {
  id: string
  q: string
  a: string
}

const FAQ_LIST: FaqItem[] = [
  {
    id: 'faq-1',
    q: 'How do I create an account?',
    a: 'Click Register in the navigation bar, choose Candidate if you are looking for a job, or Employer / Recruiter if you are hiring. You can be on the platform in under two minutes.',
  },
  {
    id: 'faq-2',
    q: 'How does SmartHR rank candidates?',
    a: 'Our AI computes semantic similarity between each resume and the job description using vector matching. Scores are broken down into skill overlap, semantic relevance, and experience signals — and every ranking shows a plain-English explanation so no result is a black box.',
  },
  {
    id: 'faq-3',
    q: 'What happens after my application is submitted?',
    a: 'You instantly receive a match score and a breakdown of how your resume compares to the job requirements. The recruiter sees the same breakdown, so the process is fully transparent from day one.',
  },
  {
    id: 'faq-4',
    q: 'Can I update my resume after applying?',
    a: 'Yes. Log in to your candidate dashboard, go to your profile, and paste an updated resume. Re-rankings apply to new jobs you apply for — existing applications keep their original score.',
  },
]

const CATEGORY_TICKER = [
  'ENGINEERING',
  'PRODUCT DESIGN',
  'DATA & AI',
  'MARKETING',
  'OPERATIONS',
  'FINANCE',
]

export default function LandingPage() {
  const [keyword, setKeyword] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="tf-landing-wrapper">
      <Header />

      {/* Hero */}
      <section className="tf-hero-section">
        <div className="tf-hero-container">
          <motion.div
            className="tf-search-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form className="tf-search-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className="tf-input-field"
                placeholder="E.G. PRODUCT DESIGNER"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit" className="tf-search-btn">
                <span>🔍</span> SEARCH
              </button>
            </form>

            <div className="tf-quick-searches">
              <span className="label">Popular:</span>
              <a href="#about">Engineering</a>
              <span className="divider">|</span>
              <a href="#about">Design</a>
              <span className="divider">|</span>
              <a href="#about">Data & AI</a>
              <span className="divider">|</span>
              <a href="#about">Marketing</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category ticker */}
      <section className="tf-ticker-bar">
        <div className="tf-ticker-inner">
          {CATEGORY_TICKER.map((cat, idx) => (
            <span key={idx} className="tf-ticker-item">{cat}</span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="tf-process-section">
        <div className="tf-process-container">
          <motion.div
            className="tf-steps-wrapper"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="tf-step-connector" />

            <div className="tf-step-item">
              <div className="tf-step-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" />
                  <path d="M12 4v16M4 12h16" stroke="currentColor" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <p className="tf-step-text">1. Create your account in under 2 minutes</p>
            </div>

            <div className="tf-step-item">
              <div className="tf-step-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
                  <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" />
                  <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" />
                  <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" />
                  <line x1="9" y1="17" x2="13" y2="17" stroke="currentColor" />
                </svg>
              </div>
              <p className="tf-step-text">2. Apply with your resume — paste or upload</p>
            </div>

            <div className="tf-step-item">
              <div className="tf-step-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" stroke="currentColor" />
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" />
                  <path d="M9 15l2 2 4-4" stroke="currentColor" />
                </svg>
              </div>
              <p className="tf-step-text">3. See your AI match score instantly</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About / CTA */}
      <section className="tf-welcome-section" id="about">
        <div className="tf-welcome-container">
          <h1 className="tf-welcome-heading">
            Hiring powered by <span className="purple-accent">Transparent AI</span>
          </h1>

          <div className="tf-welcome-grid">
            <div className="tf-editorial-text">
              <p>
                SmartHR replaces gut-feel shortlisting with semantic resume analysis. Every candidate gets a ranked score based on how their experience, skills, and language actually align with the job — not just keyword matches.
              </p>
              <p>
                Recruiters see an explainable breakdown for every applicant: matched skills, missing skills, and overlapping terms. Candidates see the same thing, so there are no surprises and no black boxes.
              </p>
            </div>

            <div className="tf-action-cards">
              <Link to="/signup?role=recruiter" className="tf-action-card">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"
                  alt="Post jobs and rank candidates"
                />
                <div className="tf-card-banner">
                  <span>Post a job & rank candidates</span>
                  <span className="arrow">›</span>
                </div>
              </Link>

              <Link to="/signup?role=candidate" className="tf-action-card">
                <img
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80"
                  alt="Apply and see your match score"
                />
                <div className="tf-card-banner">
                  <span>Apply & see your match score</span>
                  <span className="arrow">›</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights (replacing the mock jobs sections) */}
      <section className="tf-job-interest-section">
        <div className="tf-job-interest-container">
          <div className="tf-section-header-row">
            <h2>Why SmartHR</h2>
          </div>

          <div className="tf-interest-cards-grid">
            {[
              { title: 'AI Match Scoring', body: 'Every resume is vectorised and compared semantically against the job description — not just keyword-matched.' },
              { title: 'Full Transparency', body: 'Candidates and recruiters see the same score breakdown: matched skills, gaps, and overlapping terms.' },
              { title: 'Fast Onboarding', body: 'Register with email in under two minutes. Add full profile details whenever you\'re ready.' },
            ].map((item) => (
              <motion.div key={item.title} whileHover={{ y: -5 }}>
                <div className="tf-purple-job-card">
                  <div>
                    <h3>{item.title}</h3>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.4rem', lineHeight: 1.5 }}>{item.body}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="tf-faq-section" id="faq">
        <div className="tf-faq-container">
          <h2 className="tf-faq-title">Frequently Asked Questions</h2>

          <div className="tf-faq-accordion">
            {FAQ_LIST.map((faq) => {
              const isExpanded = expandedFaq === faq.id
              return (
                <div key={faq.id} className="tf-faq-item">
                  <button className="tf-faq-question" type="button" onClick={() => toggleFaq(faq.id)}>
                    <span>{faq.q}</span>
                    <span className={`tf-faq-chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="tf-faq-answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
