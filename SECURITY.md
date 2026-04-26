# 🔒 VoteGuide AI — Security Policy

> **Version:** 1.0  
> **Last Updated:** April 2026  
> **Contact:** [GitHub Issues](https://github.com/Subho483/VoteGuide-AI/issues)

---

## 1. Overview

VoteGuide AI is a civic-tech platform handling sensitive public-interest information. Security is treated as a first-class concern. This document describes the current security posture, implementation practices, and the roadmap for future hardening.

---

## 2. Secrets & Credentials Management

### ✅ Current Practice: Zero Hardcoded Secrets

- **No API keys, tokens, or passwords exist anywhere in source code.**
- All environment-sensitive configuration is loaded exclusively from environment variables at runtime.
- The server reads `process.env.PORT` (Cloud Run injects this automatically) and `process.env.NODE_ENV`.
- Google Cloud Run injects runtime secrets via `--set-env-vars` flags during deployment — never via code.

### Environment Variables

| Variable | Source | Description |
|---|---|---|
| `PORT` | Cloud Run runtime | Server port (default: 8080) |
| `NODE_ENV` | Deployment flag | `production` or `development` |

See `.env.example` for the full template.

### ❌ What We Never Do

- Store API keys in `script.js`, `index.html`, or any client-side file
- Commit `.env` files to version control
- Log sensitive values to console in production
- Use hardcoded credentials in Docker images or build scripts

---

## 3. Input Validation & Sanitization

### Server-Side (server.js)

```javascript
// Type check before processing
if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a valid string.' });
}
```

- All chat messages are type-checked before the NLP engine processes them
- Empty, null, and non-string inputs return HTTP 400 immediately
- Message text is `.toLowerCase().trim()`-ed — no raw user string reaches any external system
- No user input is ever stored, logged, or persisted

### Client-Side (script.js)

- Chat messages are appended via `textContent` (not `innerHTML`) — preventing XSS injection
- Emergency and eligibility results also use safe DOM APIs
- Pincode input is passed through `encodeURIComponent()` before building iframe URLs

```javascript
// Safe DOM insertion (XSS-safe)
div.textContent = text; // ✅ never innerHTML for user content

// Safe URL construction
mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(val)}+Polling+Booth&output=embed`;
```

---

## 4. External Link Safety

All external `<a>` tags that open in a new tab include both `rel` attributes:

```html
<a href="https://..." target="_blank" rel="noopener noreferrer">
```

- `noopener` — prevents the opened page from accessing `window.opener`, blocking tab-napping attacks
- `noreferrer` — prevents sending the `Referer` header, protecting user navigation privacy

---

## 5. Frontend Security Posture

| Control | Status | Notes |
|---|---|---|
| No inline JS event handlers | ✅ | All events via `addEventListener` |
| No `eval()` or `new Function()` | ✅ | Not used anywhere |
| No `innerHTML` for user data | ✅ | `textContent` used throughout |
| No client-side secrets | ✅ | Zero API keys in frontend |
| HTTPS only | ✅ | Enforced by Cloud Run |
| Safe external links | ✅ | All `target="_blank"` have `rel="noopener noreferrer"` |
| CSP-compatible code | ✅ | No inline scripts (except Google Translate widget) |

---

## 6. Backend Security Posture

| Control | Status | Notes |
|---|---|---|
| Input type validation | ✅ | Checked before NLP processing |
| Error messages sanitized | ✅ | No stack traces exposed to client |
| No database | ✅ | Zero data persistence; no SQL injection surface |
| No file system writes | ✅ | Server is fully stateless |
| Dependency audit | ✅ | Single production dependency (`express`) |
| HTTP 400 on bad input | ✅ | Explicit rejection of malformed payloads |

---

## 7. Dependency Hygiene

VoteGuide AI intentionally maintains a minimal dependency footprint:

```json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

**Rationale:**
- Every additional dependency is a potential vulnerability surface
- Express 4.18.x has no known critical CVEs at time of deployment
- `npm audit` is run before every production deployment

```bash
# Run before every deployment
npm audit
npm audit fix
```

### Dependency Update Policy

- Security patches (`x.x.PATCH`): Apply immediately
- Minor updates (`x.MINOR.x`): Review and apply monthly
- Major updates (`MAJOR.x.x`): Review and test before adoption

---

## 8. Cloud Run Deployment Security

### Container Isolation
- Cloud Run containers are fully isolated per request
- No shared state between invocations
- Automatic restart on crashes

### Network Security
- All traffic is HTTPS (TLS 1.2+ enforced by Cloud Run)
- No inbound port exposure beyond 443 (mapped to container's `PORT`)
- `--allow-unauthenticated` is appropriate for a public civic platform (no private data)

### Secrets Injection Pattern

```bash
# ✅ Correct: inject via gcloud flag
gcloud run deploy voteguide-ai \
  --set-env-vars NODE_ENV=production,FUTURE_API_KEY=secretvalue

# ❌ Never: hardcode in Dockerfile or source
ENV FUTURE_API_KEY=secretvalue  # NEVER DO THIS
```

---

## 9. Data Privacy

VoteGuide AI collects **zero personal data**:

- No user accounts, no login, no sessions
- No analytics tracking (no Google Analytics, no cookies)
- No chat history stored — every session is ephemeral
- Eligibility form data processed in-memory and discarded
- Progress state stored only in `localStorage` on the user's own device

---

## 10. Reporting a Vulnerability

If you discover a security issue:

1. **Do not** open a public GitHub issue
2. Email directly or use the GitHub private advisory system
3. Include: description, reproduction steps, potential impact
4. Expected response time: **48 hours**

---

## 11. Future Security Roadmap

| Priority | Enhancement |
|---|---|
| 🔴 High | Add Content-Security-Policy (CSP) HTTP headers via Express middleware |
| 🔴 High | Add rate limiting on `/api/chat` (express-rate-limit) |
| 🟡 Medium | Add Helmet.js for secure HTTP headers (X-Frame-Options, HSTS, etc.) |
| 🟡 Medium | Add `npm audit` to CI/CD pipeline as a blocking step |
| 🟢 Low | Add Subresource Integrity (SRI) hashes for Google Fonts CDN link |
| 🟢 Low | Add automated dependency scanning (Dependabot) |

### Quick-win: Rate Limiting (ready to enable)

```bash
npm install express-rate-limit
```

```javascript
// server.js — add before routes
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 60_000, max: 30 });
app.use('/api/', limiter);
```

### Quick-win: Security Headers (ready to enable)

```bash
npm install helmet
```

```javascript
// server.js
const helmet = require('helmet');
app.use(helmet());
```

---

*VoteGuide AI — Security Policy · Version 1.0 · April 2026*
