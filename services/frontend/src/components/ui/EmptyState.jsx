import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '56px 24px',
        gap: 12,
      }}
    >
      {Icon && (
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4,
        }}>
          <Icon size={26} color="var(--primary)" strokeWidth={1.75} />
        </div>
      )}
      <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-1)' }}>{title}</p>
      {description && <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 320, lineHeight: 1.6 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </motion.div>
  );
}
