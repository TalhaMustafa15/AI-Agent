import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }
  })
};

const features = [
  {
    icon: '🧠',
    title: 'Multi-Source AI',
    description: 'Connects to OpenAI, HuggingFace, and more — with smart fallback for uninterrupted answers.'
  },
  {
    icon: '📊',
    title: 'Structured Responses',
    description: 'AI answers rendered with headings, bullet points, code blocks, and syntax highlighting.'
  },
  {
    icon: '🔐',
    title: 'Secure Auth',
    description: 'JWT-based authentication with bcrypt password hashing and protected routes.'
  },
  {
    icon: '📜',
    title: 'Query History',
    description: 'All your questions and AI answers are saved — accessible anytime from your dashboard.'
  },
  {
    icon: '⚡',
    title: 'Real-time Typing',
    description: 'Watch AI responses appear character-by-character with smooth animations.'
  },
  {
    icon: '🌙',
    title: 'Dark & Light Mode',
    description: 'Beautiful in both modes. System preference detection with manual override.'
  }
];

const stats = [
  { value: '100%', label: 'Free to use' },
  { value: 'MERN', label: 'Full stack' },
  { value: '< 1s', label: 'Response time' },
  { value: '∞', label: 'Questions' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-content">
          <motion.div
            className="hero-badge"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="badge badge-accent">✨ Powered by AI</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Ask anything,
            <br />
            <span className="gradient-text">get smart answers</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            A full-stack AI platform powered by MERN stack. Ask questions,
            get structured AI-generated responses with code blocks, examples, and explanations.
          </motion.p>

          <motion.div
            className="hero-actions"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Open Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Get Started Free
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="hero-stats"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="stat">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Demo preview card */}
        <motion.div
          className="container"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="demo-card">
            <div className="demo-header">
              <div className="demo-dots">
                <span /><span /><span />
              </div>
              <span className="demo-title">NeuralQ — AI Dashboard</span>
              <span className="badge badge-green">● Live</span>
            </div>
            <div className="demo-body">
              <div className="demo-question">
                <div className="demo-q-icon">Q</div>
                <p>How does async/await work in JavaScript?</p>
              </div>
              <div className="demo-answer">
                <div className="demo-a-icon">AI</div>
                <div className="demo-a-content">
                  <p className="demo-a-heading">Understanding Async/Await</p>
                  <p className="demo-a-text">Async/await is syntactic sugar over Promises, making asynchronous code look synchronous...</p>
                  <div className="demo-code-block">
                    <code>
                      <span className="kw">const</span> getData = <span className="kw">async</span> () =&gt; {'{'}<br />
                      &nbsp;&nbsp;<span className="kw">const</span> res = <span className="kw">await</span> fetch(url);<br />
                      &nbsp;&nbsp;<span className="kw">return</span> res.json();<br />
                      {'}'}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="features" id="projects">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge badge-accent">Features</span>
            <h2 className="section-title">Everything you need</h2>
            <p className="section-subtitle">
              Built with modern tech for speed, security, and beautiful UX.
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="feature-card card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-section" id="certificates">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge badge-pink">Tech Stack</span>
            <h2 className="section-title">Built with the best</h2>
          </motion.div>

          <div className="tech-grid">
            {[
              { name: 'MongoDB', desc: 'NoSQL Database', color: '#00ed64' },
              { name: 'Express.js', desc: 'Backend Framework', color: '#ebebeb' },
              { name: 'React', desc: 'Frontend Library', color: '#61dafb' },
              { name: 'Node.js', desc: 'Runtime Environment', color: '#8cc84b' },
              { name: 'Framer Motion', desc: 'Animations', color: '#bb88ff' },
              { name: 'Tailwind CSS', desc: 'Utility CSS', color: '#38bdf8' },
              { name: 'JWT', desc: 'Authentication', color: '#f59e0b' },
              { name: 'OpenAI', desc: 'AI API', color: '#10a37f' },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                className="tech-card card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileHover={{ scale: 1.04 }}
              >
                <div className="tech-dot" style={{ background: tech.color }} />
                <p className="tech-name">{tech.name}</p>
                <p className="tech-desc">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="cta-title">Ready to explore AI?</h2>
            <p className="cta-sub">Sign up free and start asking questions in seconds.</p>
            <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn btn-primary btn-lg">
              {isAuthenticated ? 'Go to Dashboard' : 'Start for Free'} →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
