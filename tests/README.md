# VoteGuide AI — Test Runner

## Running Tests

```bash
# Run all tests
npm test

# Run only NLP unit tests
node --test tests/nlp.test.js

# Run only API integration tests  
node --test tests/api.test.js

# Run with verbose output
node --test --reporter=spec tests/
```

## Test Files

| File | Type | Coverage |
|---|---|---|
| `nlp.test.js` | Unit | NLP engine: intent matching, greetings, edge cases, XSS, knowledge base structure |
| `api.test.js` | Integration | HTTP routes: POST /api/chat, GET /health — valid + invalid inputs |

## What is Tested

### nlp.test.js (28 test cases)
- Intent matching for all major civic topics (NOTA, eligibility, registration, emergency, etc.)
- Greeting detection for 5 common greetings
- Edge cases: long input, numeric, special chars, XSS payloads, uppercase, mixed-case
- Knowledge base structural validation: IDs unique, keywords present, responses substantive

### api.test.js (12 test cases)
- POST /api/chat with valid civic questions → 200 + reply string
- POST /api/chat with empty string → 400
- POST /api/chat with missing message → 400
- POST /api/chat with non-string types (number, null) → 400
- POST /api/chat with XSS payload → 200, safe response
- POST /api/chat → engine field present in response
- GET /health → 200 + status ok + engine + version + timestamp

## Dependencies

Uses Node.js 18+ built-in modules only:
- `node:test` — test runner
- `node:assert/strict` — assertions
- `node:http` — HTTP client for integration tests

No additional packages needed.
