require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SALARY_URL   = process.env.SALARY_SERVICE_URL   || 'http://localhost:4001';
const IDENTITY_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4002';
const VOTE_URL     = process.env.VOTE_SERVICE_URL     || 'http://localhost:4003';
const SEARCH_URL   = process.env.SEARCH_SERVICE_URL   || 'http://localhost:4004';
const STATS_URL    = process.env.STATS_SERVICE_URL    || 'http://localhost:4005';

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Auth middleware ──────────────────────────────────────────────────────────
async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const verifyRes = await fetch(`${IDENTITY_URL}/verify`, {
      headers: { authorization: auth },
    });
    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const decoded = await verifyRes.json();
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error('auth middleware error', err.message);
    res.status(503).json({ error: 'Identity service unavailable' });
  }
}

// ── Helper: forward response ─────────────────────────────────────────────────
async function forward(upstream, res) {
  const data = await upstream.json().catch(() => null);
  res.status(upstream.status).json(data);
}

// ── Salary Submission routes (public) ────────────────────────────────────────
app.post('/api/submissions', async (req, res) => {
  try {
    const upstream = await fetch(`${SALARY_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Salary service unavailable' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const upstream = await fetch(`${SALARY_URL}/submissions?${qs}`);
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Salary service unavailable' });
  }
});

app.get('/api/submissions/:id', async (req, res) => {
  try {
    const upstream = await fetch(`${SALARY_URL}/submissions/${req.params.id}`);
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Salary service unavailable' });
  }
});

// ── Identity routes (public) ─────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const upstream = await fetch(`${IDENTITY_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Identity service unavailable' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const upstream = await fetch(`${IDENTITY_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Identity service unavailable' });
  }
});

// ── Vote routes (auth required for POST) ─────────────────────────────────────
app.post('/api/votes', authMiddleware, async (req, res) => {
  try {
    const body = { ...req.body, userId: req.userId };
    const upstream = await fetch(`${VOTE_URL}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Vote service unavailable' });
  }
});

app.get('/api/votes/:submissionId', async (req, res) => {
  try {
    const upstream = await fetch(`${VOTE_URL}/votes/${req.params.submissionId}`);
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Vote service unavailable' });
  }
});

// ── Search route (public) ────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const upstream = await fetch(`${SEARCH_URL}/search?${qs}`);
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Search service unavailable' });
  }
});

// ── Stats route (public) ─────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const qs = new URLSearchParams(req.query).toString();
    const upstream = await fetch(`${STATS_URL}/stats?${qs}`);
    await forward(upstream, res);
  } catch (err) {
    res.status(503).json({ error: 'Stats service unavailable' });
  }
});

app.listen(PORT, () => console.log(`BFF listening on port ${PORT}`));
