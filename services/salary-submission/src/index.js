require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

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

const PORT = process.env.PORT || 4001;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/submissions', async (req, res) => {
  const {
    company, role, country, city,
    experienceYears, experienceLevel,
    baseSalary, totalCompensation,
    currency, employmentType, anonymize,
  } = req.body;

  if (!company || !role || experienceYears === undefined || !baseSalary || !experienceLevel) {
    return res.status(400).json({ error: 'company, role, experienceYears, experienceLevel and baseSalary are required' });
  }
  if (Number(baseSalary) <= 0) {
    return res.status(400).json({ error: 'baseSalary must be greater than 0' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO salary.submissions
         (company, role, country, city, experience_years, experience_level,
          base_salary, total_compensation, currency, employment_type, anonymize)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        company, role,
        country || 'Sri Lanka', city || null,
        experienceYears, experienceLevel,
        baseSalary, totalCompensation || null,
        currency || 'LKR',
        employmentType || 'full-time',
        anonymize === true,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('create submission error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/submissions', async (req, res) => {
  const { status } = req.query;
  try {
    let query = 'SELECT * FROM salary.submissions';
    const params = [];
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('list submissions error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/submissions/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM salary.submissions WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('get submission error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/submissions/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  try {
    const result = await pool.query(
      `UPDATE salary.submissions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('update status error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/submissions/:id/upvote-count', async (req, res) => {
  const { count } = req.body;
  try {
    const result = await pool.query(
      `UPDATE salary.submissions SET upvote_count = $1 WHERE id = $2 RETURNING *`,
      [count, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('update upvote count error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Salary Submission service listening on port ${PORT}`));
