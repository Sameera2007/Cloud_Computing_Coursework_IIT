import { motion } from 'framer-motion';

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    fontFamily: 'inherit',
    fontWeight: 600,
    borderRadius: 'var(--r-md)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease)',
    outline: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  sizes: {
    sm:  { padding: '6px 14px',  fontSize: 13, height: 34 },
    md:  { padding: '9px 20px',  fontSize: 14, height: 42 },
    lg:  { padding: '12px 28px', fontSize: 15, height: 50 },
  },
  variants: {
    primary:   { background: 'var(--primary)',    color: '#fff',          border: '1.5px solid transparent' },
    secondary: { background: 'var(--surface-2)',  color: 'var(--text-1)', border: '1.5px solid var(--border)' },
    ghost:     { background: 'transparent',       color: 'var(--text-2)', border: '1.5px solid transparent' },
    danger:    { background: 'var(--red-light)',   color: 'var(--red)',    border: '1.5px solid var(--red-border)' },
    outline:   { background: 'transparent',       color: 'var(--primary)', border: '1.5px solid var(--primary)' },
  },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  as: Tag = 'button',
  type = 'button',
  onClick,
  style: extraStyle,
  ...rest
}) {
  const combined = {
    ...styles.base,
    ...styles.sizes[size],
    ...styles.variants[variant],
    ...(fullWidth && { width: '100%' }),
    ...(disabled || loading ? { opacity: 0.55, cursor: 'not-allowed', pointerEvents: 'none' } : {}),
    ...extraStyle,
  };

  return (
    <motion.button
      type={type}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      whileHover={!disabled && !loading ? { opacity: 0.9 } : {}}
      style={combined}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span style={{
          width: 15, height: 15,
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.6s linear infinite',
        }} />
      ) : null}
      {children}
    </motion.button>
  );
}

const spinKeyframes = `@keyframes spin { to { transform: rotate(360deg); } }`;
const style = document.createElement('style');
style.textContent = spinKeyframes;
document.head.appendChild(style);
