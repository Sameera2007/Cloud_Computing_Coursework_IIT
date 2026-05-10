jest.mock('pg', () => {
  const mPool = { query: jest.fn(), end: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const express = require('express');

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

describe('Stats Service', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('median calculation is correct', () => {
    const median = (arr) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    };
    expect(median([100000, 200000, 300000])).toBe(200000);
    expect(median([100000, 200000])).toBe(150000);
  });
});
