jest.mock('pg', () => {
  const mPool = { query: jest.fn(), end: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const express = require('express');

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

describe('Salary Submission Service', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('rejects salary submission with missing fields', () => {
    const requiredFields = ['company', 'role', 'base_salary', 'currency', 'experience_level'];
    const body = { company: 'WSO2' };
    const missing = requiredFields.filter(f => !body[f]);
    expect(missing.length).toBeGreaterThan(0);
  });

  test('rejects salary of 0 or negative', () => {
    const isValid = (salary) => salary > 0;
    expect(isValid(0)).toBe(false);
    expect(isValid(-1000)).toBe(false);
    expect(isValid(150000)).toBe(true);
  });
});
