import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Eye, ArrowRight } from 'lucide-react';
import PageWrapper from '../components/ui/PageWrapper.jsx';
import Button from '../components/ui/Button.jsx';

const initialForm = {
  company: '', role: '', country: 'Sri Lanka', city: '',
  experienceYears: '', experienceLevel: 'mid',
  baseSalary: '', totalCompensation: '',
  currency: 'LKR', employmentType: 'full-time',
  anonymize: false,
};

const PRIVACY_POINTS = [
  { icon: Eye,          text: 'No login required — submit anonymously' },
  { icon: Shield,       text: 'Your identity is never stored in our database' },
  { icon: CheckCircle, text: 'Needs 3 community upvotes to go live' },
];

export default function Submit() {
  const [form, setForm]           = useState(initialForm);
  const [msg, setMsg]             = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experienceYears:    Number(form.experienceYears),
          baseSalary:         Number(form.baseSalary),
          totalCompensation:  form.totalCompensation ? Number(form.totalCompensation) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: json.error || 'Submission failed. Please try again.' });
      } else {
        setMsg({ type: 'success', text: `Submitted! Your salary is pending community approval (3 upvotes needed).` });
        setForm(initialForm);
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please check your connection.' });
    }
    setSubmitting(false);
  }

  const inputStyle = { width: '100%', height: 44, padding: '0 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-1)', background: 'var(--surface)', outline: 'none', transition: 'border-color 150ms, box-shadow 150ms' };
  const selectStyle = { ...inputStyle, paddingRight: 36, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', WebkitAppearance: 'none', cursor: 'pointer' };
  const labelStyle  = { fontSize: 13, fontWeight: 600, color: 'var(--text-1)', display: 'block', marginBottom: 6, letterSpacing: '-0.01em' };
  const fieldStyle  = { display: 'flex', flexDirection: 'column' };
  const grid2       = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };

  const focus = e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; };
  const blur  = e => { e.target.style.borderColor = 'var(--border)';  e.target.style.boxShadow = 'none'; };

  return (
    <PageWrapper>
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 6 }}>
            Share Your Salary
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>
            Help build salary transparency in Sri Lanka's tech scene.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 28, alignItems: 'start' }}>
          {/* Form card */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)', padding: '28px 28px 24px',
            boxShadow: 'var(--sh-sm)',
          }}>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`alert alert-${msg.type}`}
                style={{ marginBottom: 20 }}
              >
                {msg.text}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={grid2}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Company *</label>
                  <input style={inputStyle} required value={form.company} placeholder="e.g. WSO2"
                    onChange={e => set('company', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Job Title *</label>
                  <input style={inputStyle} required value={form.role} placeholder="e.g. Software Engineer"
                    onChange={e => set('role', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div style={grid2}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Country</label>
                  <input style={inputStyle} value={form.country}
                    onChange={e => set('country', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={form.city} placeholder="e.g. Colombo"
                    onChange={e => set('city', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div style={grid2}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Years of Experience *</label>
                  <input style={inputStyle} type="number" required min="0" max="50" step="0.5"
                    value={form.experienceYears} placeholder="e.g. 3"
                    onChange={e => set('experienceYears', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Experience Level *</label>
                  <select style={selectStyle} value={form.experienceLevel}
                    onChange={e => set('experienceLevel', e.target.value)} onFocus={focus} onBlur={blur}>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
              </div>

              <div style={grid2}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Base Salary (per year) *</label>
                  <input style={inputStyle} type="number" required min="1"
                    value={form.baseSalary} placeholder="e.g. 180000"
                    onChange={e => set('baseSalary', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Total Comp (optional)</label>
                  <input style={inputStyle} type="number" min="0"
                    value={form.totalCompensation} placeholder="incl. bonuses, equity"
                    onChange={e => set('totalCompensation', e.target.value)} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              <div style={grid2}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Currency</label>
                  <select style={selectStyle} value={form.currency}
                    onChange={e => set('currency', e.target.value)} onFocus={focus} onBlur={blur}>
                    <option value="LKR">LKR — Sri Lankan Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="AUD">AUD — Australian Dollar</option>
                  </select>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Employment Type</label>
                  <select style={selectStyle} value={form.employmentType}
                    onChange={e => set('employmentType', e.target.value)} onFocus={focus} onBlur={blur}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
              </div>

              {/* Anonymize toggle */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 'var(--r-md)',
                background: form.anonymize ? 'var(--primary-light)' : 'var(--surface-2)',
                border: `1.5px solid ${form.anonymize ? '#C7D2FE' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 200ms ease',
              }}>
                <input type="checkbox" checked={form.anonymize}
                  onChange={e => set('anonymize', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
                    Hide company name
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>
                    Company will appear as "Tech Company (anonymous)"
                  </p>
                </div>
              </label>

              <Button type="submit" loading={submitting} fullWidth style={{ marginTop: 4, height: 46, fontSize: 15 }}>
                {submitting ? 'Submitting…' : 'Submit Salary'}
              </Button>
            </form>
          </div>

          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Privacy card */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', padding: '20px',
              boxShadow: 'var(--sh-xs)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Shield size={16} color="var(--emerald)" strokeWidth={2.5} />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Privacy first</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PRIVACY_POINTS.map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <Icon size={14} color="var(--emerald)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval info */}
            <div style={{
              background: 'var(--primary-subtle)', border: '1px solid #C7D2FE',
              borderRadius: 'var(--r-lg)', padding: '18px 20px',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 6 }}>
                How approval works
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                Your submission starts as <strong>Pending</strong>. Community members vote on it.
                Once it gets 3 upvotes, it becomes <strong>Approved</strong> and appears in search.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: hide the side panel below md */}
      <style>{`
        @media (max-width: 860px) {
          .submit-grid { grid-template-columns: 1fr !important; }
          .submit-side { display: none !important; }
        }
      `}</style>
    </PageWrapper>
  );
}
