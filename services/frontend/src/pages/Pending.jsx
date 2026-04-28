import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, LogIn } from 'lucide-react';
import PageWrapper from '../components/ui/PageWrapper.jsx';
import VoteCard, { cardVariants } from '../components/salary/VoteCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export default function Pending() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [voteMsg, setVoteMsg]         = useState({});
  const [voting, setVoting]           = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/submissions?status=PENDING')
      .then(r => r.json())
      .then(data => { setSubmissions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function vote(submissionId, voteType) {
    if (!token) return;
    setVoting(v => ({ ...v, [submissionId]: true }));
    setVoteMsg(m => ({ ...m, [submissionId]: null }));

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ submissionId, voteType }),
      });
      const json = await res.json();

      if (!res.ok) {
        setVoteMsg(m => ({ ...m, [submissionId]: json.error || 'Error voting' }));
      } else if (json.approved) {
        setVoteMsg(m => ({ ...m, [submissionId]: `Approved! 🎉 (${json.upvotes} upvotes)` }));
        setTimeout(() => {
          setSubmissions(s => s.filter(x => x.id !== submissionId));
        }, 1800);
      } else {
        setVoteMsg(m => ({ ...m, [submissionId]: `Voted! ${json.upvotes} upvote${json.upvotes !== 1 ? 's' : ''} so far.` }));
        setSubmissions(s => s.map(x =>
          x.id === submissionId ? { ...x, upvote_count: json.upvotes } : x
        ));
      }
    } catch {
      setVoteMsg(m => ({ ...m, [submissionId]: 'Network error. Try again.' }));
    }
    setVoting(v => ({ ...v, [submissionId]: false }));
  }

  return (
    <PageWrapper>
      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)', marginBottom: 6 }}>
            Community Voting
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>
            Validate salary data. A submission needs <strong>3 upvotes</strong> to be approved.
          </p>
        </div>

        {/* Auth banner */}
        {!token && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderRadius: 'var(--r-lg)',
              background: 'var(--primary-light)', border: '1px solid #C7D2FE',
              marginBottom: 24, flexWrap: 'wrap', gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <LogIn size={16} color="var(--primary-dark)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-dark)' }}>
                Log in to cast your votes and help the community.
              </span>
            </div>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', borderRadius: 'var(--r-md)',
              background: 'var(--primary)', color: '#fff',
              fontSize: 13, fontWeight: 600,
            }}>
              Log in
            </Link>
          </motion.div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Spinner size={32} />
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No pending submissions"
            description="All caught up! No salary submissions are waiting for votes right now."
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
            <p style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, marginBottom: 16 }}>
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting approval
            </p>
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
              {submissions.map(s => (
                <VoteCard
                  key={s.id}
                  data={s}
                  token={token}
                  onVote={vote}
                  voteMsg={voteMsg[s.id]}
                  voting={!!voting[s.id]}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
