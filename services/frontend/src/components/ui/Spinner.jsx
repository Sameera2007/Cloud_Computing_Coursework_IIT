export default function Spinner({ size = 24, color = 'var(--primary)' }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2.5px solid ${color}20`,
      borderTop: `2.5px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
    }} />
  );
}
