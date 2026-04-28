import { Link } from 'react-router-dom';
import { TrendingUp, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '36px 0',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            TechSalary<span style={{ color: 'var(--primary)' }}>LK</span>
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 4 }}>
            · Sri Lanka's tech salary database
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {[
            { to: '/browse', label: 'Browse' },
            { to: '/submit', label: 'Submit' },
            { to: '/community', label: 'Community' },
            { to: '/stats', label: 'Stats' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontSize: 13, color: 'var(--text-3)', fontWeight: 500,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              {label}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
          © {new Date().getFullYear()} TechSalaryLK · 7BUIS027C.2 Cloud Computing
        </p>
      </div>
    </footer>
  );
}
