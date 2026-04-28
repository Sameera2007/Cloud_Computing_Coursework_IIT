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

const PORT = process.env.PORT || 4004;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/search', async (req, res) => {
  const {
    country, company, role, level,
    minSalary, maxSalary,
    limit = 20, offset = 0,
  } = req.query;

  const conditions = ["status = 'APPROVED'"];
  const params = [];

  if (country) {
    params.push(`%${country}%`);
    conditions.push(`country ILIKE $${params.length}`);
  }
  if (company) {
    params.push(`%${company}%`);
    conditions.push(`company ILIKE $${params.length}`);
  }
  if (role) {
    params.push(`%${role}%`);
    conditions.push(`role ILIKE $${params.length}`);
  }
  if (level) {
    params.push(level);
    conditions.push(`experience_level = $${params.length}`);
  }
  if (minSalary) {
    params.push(Number(minSalary));
    conditions.push(`base_salary >= $${params.length}`);
  }
  if (maxSalary) {
    params.push(Number(maxSalary));
    conditions.push(`base_salary <= $${params.length}`);
  }

  params.push(parseInt(limit));
  params.push(parseInt(offset));

  const query = `
    SELECT id, company, role, country, city, experience_years, experience_level,
           base_salary, total_compensation, currency, employment_type,
           anonymize, status, upvote_count, created_at
    FROM salary.submissions
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  try {
    const result = await pool.query(query, params);
    const rows = result.rows.map(row => ({
      ...row,
      company: row.anonymize ? 'Tech Company (anonymous)' : row.company,
    }));
    res.json({ data: rows, total: rows.length, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error('search error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Search service listening on port ${PORT}`));
