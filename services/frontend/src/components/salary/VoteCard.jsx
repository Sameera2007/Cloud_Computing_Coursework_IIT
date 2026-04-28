import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ThumbsUp, ThumbsDown, Briefcase, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import { fmt, LEVEL_LABELS, EMP_LABELS } from '../../lib/fmt.js';

const THRESHOLD = 3;

export const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
};

export default function VoteCard({ data, token, onVote, voteMsg, voting }) {
  const {
    id, company, role, base_salary, total_compensation,
    currency = 'LKR', experience_level, experience_years,
    employment_type, city, country, upvote_count = 0,
  } = data;

  const pct = Math.min(100, Math.round((upvote_count / THRESHOLD) * 100));

  return (
    <motion.article
      variants={cardVariants}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 22px',
        boxShadow: 'var(--sh-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{company}</p>
          <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>{role}</p>
        </div>
        <Badge variant="pending" dot>Pending</Badge>
      </div>

      {/* Salary */}
      <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>
        {fmt(base_salary, currency)}
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', letterSpacing: 0 }}> / yr</span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {experience_level && <Badge variant={experience_level}>{LEVEL_LABELS[experience_level] || experience_level}</Badge>}
        {employment_type && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
          }}>
            <Briefcase size={10} />
            {EMP_LABELS[employment_type] || employment_type}
          </span>
        )}
        {(city || country) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 999,
            fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
          }}>
            <MapPin size={10} />
            {[city, country].filter(Boolean).join(', ')}
          </span>
        )}
      </div>

      {/* Approval progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Approval progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? 'var(--emerald)' : 'var(--amber)' }}>
            {upvote_count} / {THRESHOLD} upvotes
          </span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{ background: pct >= 67 ? 'var(--emerald)' : pct >= 34 ? 'var(--amber)' : 'var(--primary)' }}
          />
        </div>
      </div>

      {/* Vote actions */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        {token ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={voting}
                onClick={() => onVote(id, 'UP')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 16px', borderRadius: 10, border: '1.5px solid var(--emerald-border)',
                  background: 'var(--emerald-light)', color: 'var(--emerald)',
                  fontSize: 14, fontWeight: 600, cursor: voting ? 'not-allowed' : 'pointer',
                  opacity: voting ? 0.6 : 1, transition: 'opacity 150ms',
                }}
              >
                <ThumbsUp size={15} /> Upvote
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={voting}
                onClick={() => onVote(id, 'DOWN')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 16px', borderRadius: 10, border: '1.5px solid var(--red-border)',
                  background: 'var(--red-light)', color: 'var(--red)',
                  fontSize: 14, fontWeight: 600, cursor: voting ? 'not-allowed' : 'pointer',
                  opacity: voting ? 0.6 : 1, transition: 'opacity 150ms',
                }}
              >
                <ThumbsDown size={15} /> Downvote
              </motion.button>
            </div>
            {voteMsg && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 13, fontWeight: 500, textAlign: 'center',
                  color: voteMsg.startsWith('Approved') ? 'var(--emerald)' : 'var(--text-2)',
                }}
              >
                {voteMsg}
              </motion.p>
            )}
          </div>
        ) : (
          <Link to="/login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px', borderRadius: 10, border: '1.5px dashed var(--border)',
            fontSize: 14, fontWeight: 500, color: 'var(--text-3)',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <Lock size={14} /> Log in to vote
          </Link>
        )}
      </div>
    </motion.article>
  );
}
