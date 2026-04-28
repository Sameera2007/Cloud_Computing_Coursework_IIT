import { motion } from 'framer-motion';
import { MapPin, Clock, ThumbsUp, Briefcase } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { fmt, LEVEL_LABELS, EMP_LABELS } from '../../lib/fmt.js';

export const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
};

export default function SalaryCard({ data }) {
  const {
    company, role, base_salary, total_compensation,
    currency = 'LKR', experience_level, experience_years,
    employment_type, city, country, upvote_count, anonymize, created_at,
  } = data;

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(0,0,0,0.09)' }}
      transition={{ duration: 0.18 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 22px',
        boxShadow: 'var(--sh-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{
              fontSize: 16, fontWeight: 700, color: 'var(--text-1)',
              letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {company}
            </span>
            {anonymize && <Badge variant="anonymous">Anonymous</Badge>}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>{role}</p>
        </div>
        <Badge variant="approved" dot>Approved</Badge>
      </div>

      {/* Salary */}
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1 }}>
          {fmt(base_salary, currency)}
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', letterSpacing: 0 }}> / yr</span>
        </div>
        {total_compensation && (
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
            Total comp: {fmt(total_compensation, currency)}
          </p>
        )}
      </div>

      {/* Meta chips */}
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
      </div>

      {/* Footer row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {(city || country) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
              <MapPin size={11} strokeWidth={2.5} />
              {[city, country].filter(Boolean).join(', ')}
            </span>
          )}
          {experience_years != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
              <Clock size={11} strokeWidth={2.5} />
              {experience_years} yr{experience_years !== 1 ? 's' : ''} exp
            </span>
          )}
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--emerald)' }}>
          <ThumbsUp size={12} strokeWidth={2.5} />
          {upvote_count || 0} upvote{upvote_count !== 1 ? 's' : ''}
        </span>
      </div>
    </motion.article>
  );
}
