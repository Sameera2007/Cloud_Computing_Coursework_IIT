import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Users, BarChart3, CheckCircle, TrendingUp, Eye, ThumbsUp } from 'lucide-react';
import PageWrapper from '../components/ui/PageWrapper.jsx';
import { fmt } from '../lib/fmt.js';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] } },
});

const STEPS = [
  {
    icon: Eye,
    title: 'Submit anonymously',
    desc: 'No login required. Your identity is never linked to your salary - not in our database, not ever.',
    color: '#6366F1',
    bg: '#EEF2FF',
  },
  {
    icon: ThumbsUp,
    title: 'Community verifies',
    desc: 'Peers upvote submissions to confirm they look real. 3 upvotes pushes a record to approved.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: BarChart3,
    title: 'Everyone benefits',
    desc: 'Filter, compare, and benchmark against hundreds of real Sri Lanka tech salaries.',
    color: '#D97706',
    bg: '#FFFBEB',
  },
];

const SAMPLE_CARDS = [
  { company: 'WSO2', role: 'Senior Software Engineer', level: 'Senior', salary: 280000, currency: 'LKR', city: 'Colombo', votes: 7 },
  { company: 'Virtusa', role: 'Lead DevOps Engineer', level: 'Lead', salary: 340000, currency: 'LKR', city: 'Colombo', votes: 4 },
  { company: 'IFS', role: 'Mid-level Data Engineer', level: 'Mid', salary: 185000, currency: 'LKR', city: 'Colombo', votes: 5 },
];

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <PageWrapper>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(170deg, #F5F3FF 0%, #EEF2FF 40%, #F8FAFC 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 0 72px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, #6366F115 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="container" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 56, flexWrap: 'wrap' }}>
          {/* Left: copy */}
          <div style={{ flex: '1 1 380px', maxWidth: 540 }}>
            <motion.div {...fadeUp(0)}>
              <span className="label-tag" style={{ display: 'inline-block', marginBottom: 16 }}>
                Sri Lanka · Tech Salaries
              </span>
            </motion.div>

            <motion.h1 {...fadeUp(0.06)} style={{
              fontSize: 'clamp(34px, 5vw, 56px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'var(--text-1)',
              marginBottom: 20,
            }}>
              Know your worth.<br />
              <span style={{
                backgroundImage: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Build transparency.
              </span>
            </motion.h1>

            <motion.p {...fadeUp(0.1)} style={{
              fontSize: 17, lineHeight: 1.7, color: 'var(--text-2)', marginBottom: 32, maxWidth: 440,
            }}>
              Community-driven salary database for Sri Lanka's Tech Industry.
              Anonymous submissions, peer-verified, openly browseable.
            </motion.p>

            <motion.div {...fadeUp(0.14)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/browse" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 26px', borderRadius: 'var(--r-md)',
                background: 'var(--primary)', color: '#fff',
                fontSize: 15, fontWeight: 600,
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                transition: 'background 150ms, box-shadow 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; }}
              >
                Browse salaries <ArrowRight size={16} />
              </Link>
              <Link to="/submit" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 26px', borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--border)', color: 'var(--text-1)',
                fontSize: 15, fontWeight: 600, background: '#fff',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-1)'; }}
              >
                Share your salary
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div {...fadeUp(0.18)} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
              {[
                { icon: Shield, label: 'No identity stored' },
                { icon: CheckCircle, label: 'Peer verified' },
                { icon: TrendingUp, label: 'Real data only' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>
                  <Icon size={13} color="var(--emerald)" strokeWidth={2.5} />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: sample cards mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
            style={{ flex: '1 1 300px', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {SAMPLE_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)', padding: '16px 18px',
                  boxShadow: 'var(--sh-md)',
                  transform: `rotate(${i === 0 ? '-0.8deg' : i === 2 ? '0.5deg' : '0deg'})`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{card.company}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{card.role}</p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    background: 'var(--emerald-light)', color: 'var(--emerald)',
                    border: '1px solid var(--emerald-border)',
                  }}>✓ APPROVED</span>
                </div>
                <p style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginTop: 8 }}>
                  {fmt(card.salary, card.currency)}
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}> / yr</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                  <span>📍 {card.city} · {card.level}</span>
                  <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>👍 {card.votes}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Live stats bar ─────────────────────────────────── */}
      {stats && stats.total_records > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '18px 0',
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              { value: stats.total_records, label: 'approved salaries' },
              { value: `${fmt(stats.avg_salary)} LKR`, label: 'average salary' },
              { value: `${fmt(stats.median_salary)} LKR`, label: 'median salary' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── How it works ───────────────────────────────────── */}
      <section style={{ padding: '72px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="label-tag" style={{ display: 'inline-block', marginBottom: 12 }}>The process</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>
              How TechSalaryLK works
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-2)', marginTop: 8, maxWidth: 420, margin: '10px auto 0' }}>
              Three simple steps, built around privacy and community trust.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {STEPS.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)',
                  padding: '28px 24px',
                  boxShadow: 'var(--sh-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: -16, right: -16,
                  width: 80, height: 80, borderRadius: '50%',
                  background: bg, opacity: 0.6,
                }} />
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: bg, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} strokeWidth={2} />
                </div>
                <div style={{
                  position: 'absolute', top: 20, right: 24,
                  fontSize: 36, fontWeight: 900,
                  color: bg, letterSpacing: '-0.05em',
                  userSelect: 'none',
                }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────── */}
      <section style={{ padding: '56px 0 80px' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              borderRadius: 'var(--r-2xl)',
              padding: '48px 40px',
              textAlign: 'center',
              boxShadow: '0 16px 48px rgba(99,102,241,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 10, position: 'relative' }}>
              Be part of the movement.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 28, position: 'relative' }}>
              Share your salary anonymously — it takes 2 minutes and helps the entire community.
            </p>
            <Link to="/submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 'var(--r-md)',
              background: '#fff', color: 'var(--primary)',
              fontSize: 15, fontWeight: 700, position: 'relative',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
            >
              Share my salary <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
}
