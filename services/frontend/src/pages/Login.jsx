import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import PageWrapper from '../components/ui/PageWrapper.jsx';
import Button from '../components/ui/Button.jsx';

export default function Login({ setUser }) {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr]         = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || 'Invalid credentials. Please try again.');
      } else {
        localStorage.setItem('token', json.token);
        localStorage.setItem('email', form.email);
        setUser(form.email);
        navigate('/browse');
      }
    } catch {
      setErr('Network error. Please try again.');
    }
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', height: 46, padding: '0 14px',
    border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)',
    fontSize: 15, fontFamily: 'var(--font)', color: 'var(--text-1)',
    background: 'var(--surface)', outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  };
  const focus = e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; };
  const blur  = e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; };

  return (
    <PageWrapper>
      <div style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            }}>
              <LogIn size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
              Sign in to vote on community submissions.
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: '28px',
            boxShadow: 'var(--sh-lg)',
          }}>
            {err && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error"
                style={{ marginBottom: 20 }}
              >
                {err}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  type="email" required
                  style={inputStyle}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  onFocus={focus} onBlur={blur}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'} required
                    style={{ ...inputStyle, paddingRight: 44 }}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onFocus={focus} onBlur={blur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                      color: 'var(--text-3)',
                    }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" loading={loading} fullWidth style={{ height: 46, fontSize: 15, marginTop: 4 }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)', marginTop: 20 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 20 }}>
            Only needed to vote. Salary submission is always anonymous.
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
