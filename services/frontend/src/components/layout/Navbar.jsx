import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Menu, X, LogOut, ChevronRight } from 'lucide-react';

const NAV = [
  { to: '/browse',    label: 'Browse'     },
  { to: '/submit',    label: 'Submit'     },
  { to: '/community', label: 'Community'  },
  { to: '/stats',     label: 'Statistics' },
];

export default function Navbar({ user, onLogout }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.94)' : '#fff',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'var(--border)'}`,
      boxShadow: scrolled ? 'var(--sh-sm)' : 'none',
      transition: 'box-shadow 200ms ease, backdrop-filter 200ms ease',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', height: 62, gap: 8,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 16, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          }}>
            <TrendingUp size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              TechSalary<span style={{ color: 'var(--primary)' }}>LK</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-only" style={{ alignItems: 'center', gap: 2, flex: 1 }}>
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'inline-flex', alignItems: 'center',
              padding: '6px 13px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: isActive ? 'var(--primary)' : 'var(--text-2)',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 150ms ease',
              textDecoration: 'none',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="desktop-only" style={{ alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          {user ? (
            <>
              <span style={{
                fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
                maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{user}</span>
              <button onClick={handleLogout} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 13px', borderRadius: 8,
                border: '1.5px solid var(--border)',
                background: 'transparent',
                fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
              >
                <LogOut size={14} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '7px 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 500, color: 'var(--text-1)',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-1)'}
              >
                Log in
              </Link>
              <Link to="/signup" style={{
                padding: '7px 18px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, color: '#fff',
                background: 'var(--primary)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                transition: 'background 150ms ease, box-shadow 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-only" onClick={() => setMenuOpen(o => !o)} style={{
          marginLeft: 'auto', padding: 8, borderRadius: 8,
          background: 'transparent', color: 'var(--text-1)', border: 'none',
          alignItems: 'center', justifyContent: 'center',
        }} aria-label="Toggle menu">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: '#fff' }}
          >
            <div style={{ padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV.map(({ to, label }) => (
                <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: 10,
                  fontSize: 15, fontWeight: 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-1)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  textDecoration: 'none',
                })}>
                  {label}
                  <ChevronRight size={15} strokeWidth={2} style={{ opacity: 0.4 }} />
                </NavLink>
              ))}

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

              {user ? (
                <>
                  <div style={{ padding: '8px 14px', fontSize: 13, color: 'var(--text-3)' }}>{user}</div>
                  <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 14px', borderRadius: 10,
                    background: 'var(--red-light)', border: 'none',
                    fontSize: 15, fontWeight: 500, color: 'var(--red)',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <LogOut size={16} />
                    Log out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                  <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                    flex: 1, padding: '11px', borderRadius: 10, textAlign: 'center',
                    border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600,
                    color: 'var(--text-1)',
                  }}>Log in</Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} style={{
                    flex: 1, padding: '11px', borderRadius: 10, textAlign: 'center',
                    background: 'var(--primary)', fontSize: 14, fontWeight: 600, color: '#fff',
                  }}>Sign up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
