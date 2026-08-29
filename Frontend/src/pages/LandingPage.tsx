import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import '../styles/landing.css'

type FaqItem = {
  id: string
  q: string
  a: string
}

const FAQ_LIST: FaqItem[] = [
  {
    id: 'faq-1',
    q: 'Can candidates see their match score?',
    a: 'Yes. Candidates see the same match summary recruiters use, including matched skills and missing requirements.',
  },
  {
    id: 'faq-2',
    q: 'What does a recruiter need to start?',
    a: 'A recruiter account, company profile, and one job description. SmartHR ranks each application against that job.',
  },
  {
    id: 'faq-3',
    q: 'Can applicants upload resumes?',
    a: 'Yes. Applicants can upload a PDF, DOC, or DOCX resume, or paste resume text directly into the application form.',
  },
  {
    id: 'faq-4',
    q: 'Is the ranking only keyword matching?',
    a: 'No. The scoring combines semantic similarity and skill overlap, then explains the result in plain language.',
  },
]

const ROLES = [
  {
    title: 'For recruiters',
    body: 'Post roles, collect applications, and compare candidates in one focused workspace.',
    to: '/signup?role=recruiter',
    action: 'Open recruiter path',
  },
  {
    title: 'For candidates',
    body: 'Apply with a resume and understand how each application lines up with the role.',
    to: '/signup?role=candidate',
    action: 'Open candidate path',
  },
]

const WORKFLOW = [
  'Create a role with requirements that matter',
  'Invite candidates through a public apply link',
  'Review ranked applications with visible reasoning',
]

const METRICS = [
  ['94%', 'top match example'],
  ['3 min', 'average job setup'],
  ['2 views', 'recruiter and candidate'],
]

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(FAQ_LIST[0].id)

  return (
    <div className="tf-landing-wrapper">
      <Header />

      <section className="tf-hero-section">
        <div className="tf-hero-overlay" />
        <div className="tf-hero-container">
          <motion.div
            className="tf-hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="tf-eyebrow">Recruitment agency software</span>
            <h1>SmartHR Recruitment</h1>
            <p>
              A calm workspace for publishing roles, screening resumes, and giving candidates a clearer view of where they stand.
            </p>
            <div className="tf-hero-actions">
              <Link to="/signup?role=recruiter" className="tf-primary-link">Start hiring</Link>
              <Link to="/signup?role=candidate" className="tf-secondary-link">Apply as candidate</Link>
            </div>
          </motion.div>

          <motion.div
            className="tf-hero-ledger"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            aria-label="Hiring pipeline preview"
          >
            <div className="tf-ledger-head">
              <span>Active shortlist</span>
              <strong>Product Designer</strong>
            </div>
            {[
              ['Ada Johnson', '94%', 'Strong systems and research overlap'],
              ['Miles Carter', '82%', 'Good portfolio depth, missing analytics'],
              ['Nora Lee', '76%', 'Relevant background, lighter SaaS evidence'],
            ].map(([name, score, note]) => (
              <div className="tf-ledger-row" key={name}>
                <span>{name}</span>
                <strong>{score}</strong>
                <small>{note}</small>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="tf-metric-strip">
        <div className="tf-metric-inner">
          {METRICS.map(([value, label]) => (
            <div key={label} className="tf-metric-item">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="tf-role-section" id="platform">
        <div className="tf-section-shell">
          <div className="tf-section-heading">
            <span className="tf-eyebrow">Two clear paths</span>
            <h2>Built around the people doing the hiring and the people applying.</h2>
          </div>

          <div className="tf-role-grid">
            {ROLES.map((role) => (
              <Link to={role.to} className="tf-role-card" key={role.title}>
                <span className="tf-role-kicker">{role.title}</span>
                <p>{role.body}</p>
                <strong>{role.action}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tf-workflow-section" id="workflow">
        <div className="tf-section-shell tf-workflow-shell">
          <div>
            <span className="tf-eyebrow">Workflow</span>
            <h2>Every score keeps the job, resume, and explanation connected.</h2>
            <p className="tf-section-copy">
              Recruiters can move quickly without hiding the reasoning. Candidates get a useful result instead of a silent application.
            </p>
          </div>
          <div className="tf-workflow-list">
            {WORKFLOW.map((item, index) => (
              <div className="tf-workflow-item" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tf-proof-section">
        <div className="tf-section-shell tf-proof-grid">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82"
            alt="Recruitment team reviewing candidates"
          />
          <div className="tf-proof-copy">
            <span className="tf-eyebrow">Operational by design</span>
            <h2>Less theater, more useful review.</h2>
            <p>
              SmartHR keeps the experience practical: clear account paths, compact dashboards, useful tables, and explanations that can be read during real hiring work.
            </p>
          </div>
        </div>
      </section>

      <section className="tf-faq-section" id="faq">
        <div className="tf-faq-container">
          <div className="tf-section-heading">
            <span className="tf-eyebrow">FAQ</span>
            <h2>Questions teams usually ask first.</h2>
          </div>

          <div className="tf-faq-accordion">
            {FAQ_LIST.map((faq) => {
              const isExpanded = expandedFaq === faq.id
              return (
                <div key={faq.id} className="tf-faq-item">
                  <button className="tf-faq-question" type="button" onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}>
                    <span>{faq.q}</span>
                    <span className={`tf-faq-chevron ${isExpanded ? 'expanded' : ''}`} aria-hidden />
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="tf-faq-answer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
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
