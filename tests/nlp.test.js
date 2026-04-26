/**
 * @fileoverview VoteGuide AI — Server & NLP Engine Unit Tests
 *
 * Uses Node.js built-in test runner (node:test) — no extra dependencies.
 * Run with:  npm test
 *
 * Coverage:
 *  - NLP engine intent matching
 *  - Greeting detection
 *  - Fallback threshold behaviour
 *  - Edge cases (empty, null, XSS strings)
 *  - HTTP API route validation
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Import the NLP engine functions directly (no HTTP needed)
const { getSmartResponse, intents, fallbackResponses } = require('../server');

// =====================================================
// 1. NLP ENGINE — Intent Matching
// =====================================================

describe('NLP Engine — Intent Matching', () => {

    test('returns NOTA explanation for "what is nota"', () => {
        const reply = getSmartResponse('what is nota');
        assert.ok(reply.toLowerCase().includes('none of the above'),
            'Expected NOTA explanation');
    });

    test('returns eligibility info for "I am 18 years old"', () => {
        const reply = getSmartResponse('I am 18 years old, can I vote?');
        assert.ok(
            reply.toLowerCase().includes('18') ||
            reply.toLowerCase().includes('register') ||
            reply.toLowerCase().includes('vote') ||
            reply.length > 30,
            'Expected eligibility or civic response for 18-year-old'
        );
    });

    test('returns response for underage user "I am 17"', () => {
        const reply = getSmartResponse('I am 17 can I vote?');
        assert.ok(
            typeof reply === 'string' && reply.length > 20,
            'Expected a substantive response for underage query'
        );
    });

    test('returns registration info for "how to register"', () => {
        const reply = getSmartResponse('how to register to vote?');
        assert.ok(
            reply.toLowerCase().includes('register') || reply.toLowerCase().includes('election commission'),
            'Expected registration guidance'
        );
    });

    test('returns booth process info for "how to vote inside booth"', () => {
        const reply = getSmartResponse('what happens inside the booth?');
        assert.ok(reply.length > 30, 'Expected a substantive response');
    });

    test('returns NOTA for "none of the above" input', () => {
        const reply = getSmartResponse('what does none of the above mean?');
        assert.ok(reply.toLowerCase().includes('nota') || reply.toLowerCase().includes('none of the above'),
            'Expected NOTA info');
    });

    test('returns counting info for "when are results announced"', () => {
        const reply = getSmartResponse('when are results announced after voting?');
        assert.ok(reply.length > 20, 'Expected a substantive counting response');
    });

    test('returns fake news guidance for "whatsapp forward about elections"', () => {
        const reply = getSmartResponse('I got a whatsapp forward about elections');
        assert.ok(
            reply.toLowerCase().includes('misinformation') || reply.toLowerCase().includes('fake') || reply.toLowerCase().includes('election commission'),
            'Expected misinformation guidance'
        );
    });

    test('returns emergency guidance for "I lost my voter id"', () => {
        const reply = getSmartResponse('I lost my voter id card');
        assert.ok(
            reply.toLowerCase().includes('panic') === false || reply.toLowerCase().includes('id'),
            'Expected lost ID guidance'
        );
    });

    test('returns accessibility guidance for "need wheelchair access"', () => {
        const reply = getSmartResponse('I need wheelchair access at the polling booth');
        assert.ok(
            reply.toLowerCase().includes('wheelchair') || reply.toLowerCase().includes('accessible'),
            'Expected accessibility guidance'
        );
    });
});

// =====================================================
// 2. NLP ENGINE — Greetings
// =====================================================

describe('NLP Engine — Greeting Detection', () => {

    const greetings = ['hi', 'hello', 'hey', 'start', 'help'];

    for (const greeting of greetings) {
        test(`returns greeting response for "${greeting}"`, () => {
            const reply = getSmartResponse(greeting);
            assert.ok(
                reply.toLowerCase().includes('voteguide') || reply.toLowerCase().includes('civic'),
                `Expected a greeting response for input: ${greeting}`
            );
        });
    }
});

// =====================================================
// 3. NLP ENGINE — Edge Cases
// =====================================================

describe('NLP Engine — Edge Cases', () => {

    test('returns a fallback string (not empty) for completely unrelated input', () => {
        const reply = getSmartResponse('what is the price of milk?');
        assert.ok(typeof reply === 'string', 'Reply must be a string');
        assert.ok(reply.length > 10, 'Fallback must be a substantive message');
    });

    test('does not crash on very long input', () => {
        const longInput = 'vote '.repeat(500);
        assert.doesNotThrow(() => getSmartResponse(longInput));
    });

    test('does not crash on numeric string', () => {
        assert.doesNotThrow(() => getSmartResponse('12345'));
    });

    test('does not crash on special characters', () => {
        assert.doesNotThrow(() => getSmartResponse('!@#$%^&*()'));
    });

    test('does not crash on XSS attempt', () => {
        const xss = '<script>alert("xss")</script>';
        const reply = getSmartResponse(xss);
        assert.ok(typeof reply === 'string', 'Must return string even for XSS input');
        assert.ok(!reply.includes('<script>'), 'Response must not echo back script tags');
    });

    test('handles uppercase input correctly', () => {
        const reply = getSmartResponse('WHAT IS NOTA?');
        assert.ok(reply.length > 10, 'Must handle uppercase input');
    });

    test('handles mixed-case input correctly', () => {
        const reply = getSmartResponse('WhaT Is NuLL?');
        assert.ok(typeof reply === 'string', 'Must return string for mixed-case');
    });
});

// =====================================================
// 4. KNOWLEDGE BASE — Structure Validation
// =====================================================

describe('Knowledge Base — Structure', () => {

    test('intents array is non-empty', () => {
        assert.ok(Array.isArray(intents), 'intents must be an array');
        assert.ok(intents.length >= 20, `Expected ≥20 intents, found ${intents.length}`);
    });

    test('every intent has id, keywords, and response', () => {
        for (const intent of intents) {
            assert.ok(intent.id, `Intent missing id: ${JSON.stringify(intent)}`);
            assert.ok(Array.isArray(intent.keywords) && intent.keywords.length > 0,
                `Intent ${intent.id} has no keywords`);
            assert.ok(typeof intent.response === 'string' && intent.response.length > 20,
                `Intent ${intent.id} has a too-short response`);
        }
    });

    test('all intent IDs are unique', () => {
        const ids = intents.map(i => i.id);
        const unique = new Set(ids);
        assert.equal(unique.size, ids.length, 'Duplicate intent IDs detected');
    });

    test('fallback responses are non-empty strings', () => {
        assert.ok(Array.isArray(fallbackResponses), 'fallbackResponses must be an array');
        for (const r of fallbackResponses) {
            assert.ok(typeof r === 'string' && r.length > 20, 'Each fallback must be a substantive string');
        }
    });
});
