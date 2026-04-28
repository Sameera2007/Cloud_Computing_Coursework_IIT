const config = {
  approved:  { bg: 'var(--emerald-light)', color: 'var(--emerald)',      border: 'var(--emerald-border)', dot: '#059669' },
  pending:   { bg: 'var(--amber-light)',   color: 'var(--amber)',        border: 'var(--amber-border)',   dot: '#D97706' },
  anonymous: { bg: 'var(--primary-light)', color: 'var(--primary-dark)', border: '#C7D2FE',               dot: '#6366F1' },
  junior:    { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0',      dot: '#16A34A' },
  mid:       { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE',      dot: '#2563EB' },
  senior:    { bg: '#FDF4FF', color: '#7E22CE', border: '#E9D5FF',      dot: '#9333EA' },
  lead:      { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA',      dot: '#EA580C' },
  principal: { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3',      dot: '#E11D48' },
  default:   { bg: 'var(--surface-2)',     color: 'var(--text-2)',      border: 'var(--border)',         dot: '#94A3B8' },
};

export default function Badge({ children, variant = 'default', dot = false, size = 'sm' }) {
  const c = config[variant] || config.default;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: size === 'sm' ? '3px 9px' : '4px 12px',
      borderRadius: 999,
      fontSize: size === 'sm' ? 11 : 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}
