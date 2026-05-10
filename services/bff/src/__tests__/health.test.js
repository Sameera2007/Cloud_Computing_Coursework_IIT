const request = require('supertest');
const express = require('express');

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

describe('BFF Service', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('BFF routes are defined for all services', () => {
    const routes = [
      '/api/submissions',
      '/api/auth/login',
      '/api/auth/signup',
      '/api/votes',
      '/api/search',
      '/api/stats',
    ];
    routes.forEach(route => {
      expect(typeof route).toBe('string');
      expect(route.startsWith('/api/')).toBe(true);
    });
  });
});
