import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import PageWrapper from '../components/ui/PageWrapper.jsx';
import FilterBar from '../components/salary/FilterBar.jsx';
import StatBox from '../components/stats/StatBox.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { fmt, LEVEL_LABELS } from '../lib/fmt.js';

const LEVEL_COLORS = {
  junior:    { dot: '#16A34A', bar: '#22C55E' },
  mid:       { dot: '#2563EB', bar: '#3B82F6' },
  senior:    { dot: '#9333EA', bar: '#A855F7' },
  lead:      { dot: '#EA580C', bar: '#F97316' },
  principal: { dot: '#E11D48', bar: '#F43F5E' },
};

export default function Stats() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: '', role: '', level: '' });

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    try {
      const res  = await fetch(`/api/stats?${qs}`);
      const json = await res.json();
      setStats(json);
    } catch {
      setStats(null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const maxAvg = stats?.by_level?.length
    ? Math.max(...stats.by_level.map(r => Number(r.avg_salary) || 0))
    : 1;

  return (
    <PageWrapper>
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 6 }}>
            Salary Statistics
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>
            Aggregated insights from community-approved submissions.
          </p>
        </div>

        <FilterBar
          filters={filters}
          onChange={handleChange}
          onSearch={load}
          showCompany={false}
          loading={loading}
        />

        <div style={{ marginTop: 32 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <Spinner size={32} />
            </div>
          ) : !stats || stats.total_records === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No data yet"
              description="There are no approved salaries matching these filters. Try broadening your search."
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {/* Primary stat boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
                <StatBox
                  accent
                  value={new Intl.NumberFormat().format(stats.total_records)}
                  label="Total approved salaries"
                />
                <StatBox
                  value={`${fmt(stats.avg_salary)} LKR`}
                  label="Average salary"
                  sub="mean of all records"
                />
                <StatBox
                  value={`${fmt(stats.median_salary)} LKR`}
                  label="Median salary"
                  sub="50th percentile"
                />
                <StatBox
                  value={`${fmt(stats.max_salary)} LKR`}
                  label="Highest salary"
                  sub="top earner in set"
                />
              </div>

              {/* Secondary stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
                <StatBox value={`${fmt(stats.min_salary)} LKR`} label="Lowest salary" />
                <StatBox value={`${fmt(stats.p25_salary)} LKR`} label="25th percentile" sub="bottom quarter" />
                <StatBox value={`${fmt(stats.p75_salary)} LKR`} label="75th percentile" sub="top quarter" />
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)', padding: '22px 24px',
                  boxShadow: 'var(--sh-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {Number(stats.avg_salary) >= Number(stats.median_salary)
                      ? <TrendingUp size={15} color="var(--emerald)" />
                      : <TrendingDown size={15} color="var(--amber)" />
                    }
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>Salary spread</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
                    {fmt(Number(stats.max_salary) - Number(stats.min_salary))} LKR
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>max − min range</div>
                </div>
              </div>

              {/* By experience level */}
              {stats.by_level && stats.by_level.length > 0 && (
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)', padding: '24px',
                  boxShadow: 'var(--sh-sm)',
                }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-1)', marginBottom: 20 }}>
                    Breakdown by experience level
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {stats.by_level.map((row, i) => {
                      const pct = maxAvg > 0 ? Math.round((Number(row.avg_salary) / maxAvg) * 100) : 0;
                      const c   = LEVEL_COLORS[row.experience_level] || { dot: '#6366F1', bar: '#818CF8' };
                      return (
                        <motion.div
                          key={row.experience_level}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.22 }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
                                {LEVEL_LABELS[row.experience_level] || row.experience_level}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                                {row.count} record{row.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                              {fmt(row.avg_salary)} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>LKR avg</span>
                            </span>
                          </div>
                          <div className="progress-track">
                            <motion.div
                              className="progress-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, delay: i * 0.06 + 0.1, ease: [0.4, 0, 0.2, 1] }}
                              style={{ background: c.bar }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
