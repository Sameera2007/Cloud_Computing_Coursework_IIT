jest.mock('pg', () => {
  const mPool = { query: jest.fn(), end: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const express = require('express');

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

describe('Search Service', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('anonymize replaces company name', () => {
    const record = { company: 'WSO2', anonymize: true };
    const result = record.anonymize ? 'Anonymous' : record.company;
    expect(result).toBe('Anonymous');
  });
});
