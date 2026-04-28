require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'techsalary',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const PORT = process.env.PORT || 4003;
const SALARY_SERVICE_URL = process.env.SALARY_SERVICE_URL || 'http://localhost:4001';
const APPROVAL_THRESHOLD = parseInt(process.env.APPROVAL_THRESHOLD || '3');

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/votes', async (req, res) => {
  const { submissionId, voteType, userId } = req.body;

  if (!submissionId || !voteType || !userId) {
    return res.status(400).json({ error: 'submissionId, voteType and userId are required' });
  }
  if (!['UP', 'DOWN'].includes(voteType)) {
    return res.status(400).json({ error: 'voteType must be UP or DOWN' });
  }

  try {
    // Step B & C — insert vote (UNIQUE constraint prevents double voting)
    await pool.query(
      `INSERT INTO community.votes (submission_id, user_id, vote_type) VALUES ($1, $2, $3)`,
      [submissionId, userId, voteType]
    );

    // Step D — count upvotes
    const countResult = await pool.query(
      `SELECT COUNT(*) AS upvotes FROM community.votes
       WHERE submission_id = $1 AND vote_type = 'UP'`,
      [submissionId]
    );
    const upvotes = parseInt(countResult.rows[0].upvotes);

    // Step E — update cached count on submission
    await fetch(`${SALARY_SERVICE_URL}/submissions/${submissionId}/upvote-count`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: upvotes }),
    });

    // Step F — check approval threshold
    let approved = false;
    if (upvotes >= APPROVAL_THRESHOLD) {
      const approveRes = await fetch(`${SALARY_SERVICE_URL}/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      approved = approveRes.ok;
    }

    // Step G — return result
    res.status(201).json({ upvotes, approved, voteType });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Already voted on this submission' });
    }
    console.error('vote error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/votes/:submissionId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         SUM(CASE WHEN vote_type = 'UP' THEN 1 ELSE 0 END) AS upvotes,
         SUM(CASE WHEN vote_type = 'DOWN' THEN 1 ELSE 0 END) AS downvotes
       FROM community.votes WHERE submission_id = $1`,
      [req.params.submissionId]
    );
    const row = result.rows[0];
    res.json({
      submissionId: req.params.submissionId,
      upvotes: parseInt(row.upvotes || 0),
      downvotes: parseInt(row.downvotes || 0),
    });
  } catch (err) {
    console.error('get votes error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Vote service listening on port ${PORT}`));
