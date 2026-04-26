/**
 * @fileoverview VoteGuide AI — HTTP API Integration Tests
 *
 * Uses Node.js built-in test runner + supertest for HTTP assertions.
 * Run with:  npm test
 *
 * Coverage:
 *  - POST /api/chat — valid message
 *  - POST /api/chat — empty body
 *  - POST /api/chat — non-string message
 *  - GET  /health   — health check
 *  - GET  /         — static file served
 */

'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');
const { app } = require('../server');

let server;
let baseUrl;

before(async () => {
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const { port } = server.address();
            baseUrl = `http://localhost:${port}`;
            resolve();
        });
    });
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

/**
 * Minimal HTTP helper — no external dependencies.
 * @param {string} method
 * @param {string} path
 * @param {object|null} body
 * @returns {Promise<{status: number, data: object}>}
 */
function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: new URL(baseUrl).port,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };

        const req = http.request(options, (res) => {
            let raw = '';
            res.on('data', chunk => { raw += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(raw) });
                } catch {
                    resolve({ status: res.statusCode, data: raw });
                }
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

// =====================================================
// POST /api/chat
// =====================================================

describe('POST /api/chat', () => {

    test('returns 200 and a reply string for a valid civic question', async () => {
        const { status, data } = await request('POST', '/api/chat', { message: 'What is NOTA?' });
        assert.equal(status, 200, 'Expected HTTP 200');
        assert.ok(typeof data.reply === 'string', 'reply must be a string');
        assert.ok(data.reply.length > 10, 'reply must be substantive');
    });

    test('returns 200 and reply for greeting "hello"', async () => {
        const { status, data } = await request('POST', '/api/chat', { message: 'hello' });
        assert.equal(status, 200);
        assert.ok(typeof data.reply === 'string');
    });

    test('returns 400 for empty message string', async () => {
        const { status } = await request('POST', '/api/chat', { message: '' });
        assert.equal(status, 400, 'Expected HTTP 400 for empty message');
    });

    test('returns 400 when message is missing', async () => {
        const { status } = await request('POST', '/api/chat', {});
        assert.equal(status, 400);
    });

    test('returns 400 when message is a number', async () => {
        const { status } = await request('POST', '/api/chat', { message: 42 });
        assert.equal(status, 400, 'Expected HTTP 400 for non-string message');
    });

    test('returns 400 when message is null', async () => {
        const { status } = await request('POST', '/api/chat', { message: null });
        assert.equal(status, 400);
    });

    test('returns 200 and handles XSS attempt safely', async () => {
        const { status, data } = await request('POST', '/api/chat', {
            message: '<script>alert("xss")</script>'
        });
        assert.equal(status, 200);
        assert.ok(!data.reply.includes('<script>'), 'Response must not echo script tags');
    });

    test('returns engine field in response', async () => {
        const { status, data } = await request('POST', '/api/chat', { message: 'how to vote?' });
        assert.equal(status, 200);
        assert.ok(['gemini', 'offline'].includes(data.engine),
            `engine must be 'gemini' or 'offline', got: ${data.engine}`);
    });
});

// =====================================================
// GET /health
// =====================================================

describe('GET /health', () => {

    test('returns 200 with status ok', async () => {
        const { status, data } = await request('GET', '/health');
        assert.equal(status, 200);
        assert.equal(data.status, 'ok');
    });

    test('health response includes engine field', async () => {
        const { data } = await request('GET', '/health');
        assert.ok(['gemini', 'offline'].includes(data.engine),
            `engine must be 'gemini' or 'offline', got: ${data.engine}`);
    });

    test('health response includes version', async () => {
        const { data } = await request('GET', '/health');
        assert.ok(typeof data.version === 'string', 'version must be a string');
    });

    test('health response includes timestamp', async () => {
        const { data } = await request('GET', '/health');
        assert.ok(typeof data.timestamp === 'string', 'timestamp must be a string');
        assert.ok(!isNaN(Date.parse(data.timestamp)), 'timestamp must be a valid ISO date');
    });
});
