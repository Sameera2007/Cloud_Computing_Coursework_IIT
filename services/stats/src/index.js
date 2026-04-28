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

const PORT = process.env.PORT || 4005;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/stats', async (req, res) => {
  const { country, role, level } = req.query;

  const conditions = ["status = 'APPROVED'"];
  const params = [];

  if (country) {
    params.push(`%${country}%`);
    conditions.push(`country ILIKE $${params.length}`);
  }
  if (role) {
    params.push(`%${role}%`);
    conditions.push(`role ILIKE $${params.length}`);
  }
  if (level) {
    params.push(level);
    conditions.push(`experience_level = $${params.length}`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const query = `
    SELECT
      COUNT(*)                                      AS total_records,
      ROUND(AVG(base_salary)::NUMERIC, 2)           AS avg_salary,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY base_salary)::NUMERIC, 2) AS median_salary,
      MIN(base_salary)                              AS min_salary,
      MAX(base_salary)                              AS max_salary,
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY base_salary)::NUMERIC, 2) AS p25_salary,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY base_salary)::NUMERIC, 2) AS p75_salary,
      ROUND(AVG(total_compensation)::NUMERIC, 2)    AS avg_total_compensation
    FROM salary.submissions
    ${where}
  `;

  try {
    const result = await pool.query(query, params);
    const stats = result.rows[0];

    const byLevel = await pool.query(
      `SELECT experience_level,
              COUNT(*) AS count,
              ROUND(AVG(base_salary)::NUMERIC, 2) AS avg_salary
       FROM salary.submissions ${where}
       GROUP BY experience_level ORDER BY experience_level`,
      params
    );

    res.json({
      ...stats,
      total_records: parseInt(stats.total_records),
      by_level: byLevel.rows,
      filters: { country, role, level },
    });
  } catch (err) {
    console.error('stats error', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Stats service listening on port ${PORT}`));
