import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageWrapper from '../components/ui/PageWrapper.jsx';
import FilterBar from '../components/salary/FilterBar.jsx';
import SalaryCard from '../components/salary/SalaryCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export default function Home() {
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ country: '', company: '', role: '', level: '' });

  async function search() {
    setLoading(true);
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    try {
      const res  = await fetch(`/api/search?${qs}`);
      const json = await res.json();
      setResults(json.data || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  useEffect(() => { search(); }, []);

  const handleChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <PageWrapper>
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 6 }}>
            Browse Salaries
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>
            Community-approved salary data from Sri Lanka's tech industry.
          </p>
        </div>

        <FilterBar
          filters={filters}
          onChange={handleChange}
          onSearch={search}
          loading={loading}
        />

        <div style={{ marginTop: 28 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <Spinner size={32} />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No salaries found"
              description="Try adjusting your filters, or be the first to submit a salary for this category."
              action={
                <Link to="/submit" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 20px', borderRadius: 'var(--r-md)',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: 14, fontWeight: 600,
                }}>
                  Submit a salary
                </Link>
              }
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 16,
                }}
              >
                {results.map(s => (
                  <SalaryCard key={s.id} data={s} />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
