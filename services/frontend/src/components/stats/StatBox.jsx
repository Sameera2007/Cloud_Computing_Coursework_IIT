import { motion } from 'framer-motion';

export default function StatBox({ value, label, sub, accent = false }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{
        background: accent ? 'linear-gradient(135deg, var(--primary) 0%, #8B5CF6 100%)' : 'var(--surface)',
        border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '22px 24px',
        boxShadow: accent ? '0 8px 24px rgba(99,102,241,0.25)' : 'var(--sh-sm)',
      }}
    >
      <div style={{
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: accent ? '#fff' : 'var(--text-1)',
        lineHeight: 1.1,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: accent ? 'rgba(255,255,255,0.8)' : 'var(--text-2)',
      }}>
        {label}
      </div>
      {sub && (
        <div style={{
          fontSize: 12,
          color: accent ? 'rgba(255,255,255,0.6)' : 'var(--text-3)',
          marginTop: 2,
        }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}
