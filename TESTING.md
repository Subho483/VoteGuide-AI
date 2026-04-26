# 🧪 VoteGuide AI — Test Strategy & Test Cases

> **Total Coverage:** 30+ manual test cases across 7 categories  
> **Last Updated:** April 2026  
> **Tester:** Subho Saha

---

## 1. Test Strategy

### Philosophy
VoteGuide AI adopts a **defense-in-depth testing approach**: every user-facing feature is validated against happy paths, edge cases, and failure modes before any deployment.

### Test Levels

| Level | Method | Tooling |
|---|---|---|
| Unit (Logic) | Manual + browser console | DevTools |
| Integration | Manual end-to-end flows | Chrome, Firefox, Safari |
| Accessibility | Screen reader + keyboard | NVDA, VoiceOver, axe DevTools |
| Responsive | Multi-viewport simulation | Chrome DevTools device toolbar |
| Security | Input fuzzing + header inspection | DevTools Network tab |
| Performance | Load time + render blocking | Lighthouse |

### Environments Tested

- **Desktop:** Chrome 124+, Firefox 125+, Edge 124+, Safari 17+
- **Mobile:** Chrome for Android, Safari iOS (iPhone 13, iPhone SE)
- **Tablet:** iPad (landscape + portrait)

---

## 2. Feature Test Cases

### 2.1 — AI Civic Chatbot

| ID | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|
| CH-01 | Valid civic question | `"What is NOTA?"` | Bot replies with NOTA explanation within 1.5s | ✅ PASS |
| CH-02 | Greeting input | `"Hello"` | Bot greets and lists available topics | ✅ PASS |
| CH-03 | Empty input submit | Click Send with empty field | Red hint text appears; no message sent | ✅ PASS |
| CH-04 | Quick chip click | Click `"What is NOTA?"` chip | Auto-populates input and submits | ✅ PASS |
| CH-05 | Keyboard submit | Type query, press `Enter` | Message sent, bot replies | ✅ PASS |
| CH-06 | Unrelated input | `"What is the weather?"` | Fallback response returned gracefully | ✅ PASS |
| CH-07 | Chat open/close | Click `💬 Ask AI` button | Widget opens; `✖` closes it | ✅ PASS |
| CH-08 | Escape key close | Press `Esc` while chat is open | Chat window closes | ✅ PASS |
| CH-09 | `/` shortcut key | Press `/` on page | Chat opens and input is focused | ✅ PASS |
| CH-10 | XSS injection | `<script>alert(1)</script>` | Text rendered as plain string; no execution | ✅ PASS |

---

### 2.2 — Eligibility Checker

| ID | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|
| EL-01 | Eligible adult citizen | Age: 21, Citizen: Yes, History: Returning | ✅ Eligible — proceed to vote | ✅ PASS |
| EL-02 | First-time eligible voter | Age: 18, Citizen: Yes, History: First Time | ✅ Eligible — register first | ✅ PASS |
| EL-03 | Underage user | Age: 17, Citizen: Yes | ❌ Not Eligible — must be 18 | ✅ PASS |
| EL-04 | Non-citizen | Age: 25, Citizen: No | ❌ Not Eligible — citizens only | ✅ PASS |
| EL-05 | Empty age submit | Age: (blank) | Red hint text shown; no result displayed | ✅ PASS |
| EL-06 | Boundary age (18) | Age: 18, Citizen: Yes | ✅ Eligible (inclusive boundary) | ✅ PASS |
| EL-07 | Confetti on success | Age: 22, Citizen: Yes | Confetti animation fires | ✅ PASS |

---

### 2.3 — Election Simulation Lab (EVM + VVPAT)

| ID | Test Case | Action | Expected Result | Status |
|---|---|---|---|---|
| SIM-01 | Enable voting | Click `Enable Vote` | Status turns green; candidate buttons unlock | ✅ PASS |
| SIM-02 | Cast vote before enabling | Click a candidate button (disabled) | Nothing happens; button remains disabled | ✅ PASS |
| SIM-03 | Vote for Candidate A | Enable → click `🔵 Candidate A` | VVPAT slip appears; 3s countdown begins | ✅ PASS |
| SIM-04 | VVPAT countdown | Watch slip after vote | Timer counts 3→2→1→0; slip hides; EVM sealed message shown | ✅ PASS |
| SIM-05 | Double voting guard | Cast vote → try another button | All buttons remain disabled after first vote | ✅ PASS |
| SIM-06 | Tally update | Vote for Candidate B | Tally count for B increments with bump animation | ✅ PASS |
| SIM-07 | Reset simulation | Click `🔄 Reset Simulation` | Status resets to red; buttons disabled; VVPAT cleared | ✅ PASS |
| SIM-08 | Multi-round tally | Reset → vote 3 times for different candidates | All tally rows update correctly; total count accurate | ✅ PASS |

---

### 2.4 — Polling Booth Finder (Google Maps)

| ID | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|
| MAP-01 | Valid pincode search | `700001` | Map updates to Kolkata area within 1s | ✅ PASS |
| MAP-02 | City name search | `Mumbai` | Map updates to Mumbai with polling booth query | ✅ PASS |
| MAP-03 | Empty search | Click Search with empty input | Status hint `"Enter pincode or location"` shown | ✅ PASS |
| MAP-04 | Enter key search | Type pincode, press `Enter` | Map updates (same as click) | ✅ PASS |
| MAP-05 | Default map load | Page load (no search) | Map defaults to Election Commission Kolkata | ✅ PASS |

---

### 2.5 — Civic Quiz

| ID | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|
| QZ-01 | Correct answer (No) | Click `No` | ✅ Green success message + confetti | ✅ PASS |
| QZ-02 | Wrong answer (Yes) | Click `Yes` | ❌ Red error message with explanation | ✅ PASS |
| QZ-03 | Button disable after answer | Any answer | Both buttons disabled; selected stays full opacity | ✅ PASS |

---

### 2.6 — Emergency Assistant

| ID | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|
| EM-01 | Lost Voter ID | Click `Lost Voter ID` | Guidance panel appears with alternative ID info | ✅ PASS |
| EM-02 | Name Missing | Click `Name Missing` | Guidance panel appears with BLO instructions | ✅ PASS |
| EM-03 | Long Queue | Click `Long Queue` | Guidance: stay in line if arrived before closing | ✅ PASS |
| EM-04 | Accessibility Help | Click `Need Ramp/Help` | Guidance: ramps + priority access info shown | ✅ PASS |

---

### 2.7 — Dark Mode & Theme Persistence

| ID | Test Case | Action | Expected Result | Status |
|---|---|---|---|---|
| TH-01 | Toggle dark mode | Click `🌙` | Page switches to dark theme instantly | ✅ PASS |
| TH-02 | Persistence on refresh | Enable dark mode → refresh | Dark mode persists via `localStorage` | ✅ PASS |
| TH-03 | Toggle back to light | Click `🌙` again | Page returns to light theme | ✅ PASS |

---

### 2.8 — Accessibility

| ID | Test Case | Method | Expected Result | Status |
|---|---|---|---|---|
| A11Y-01 | Keyboard navigation | `Tab` through page | All interactive elements reachable in logical order | ✅ PASS |
| A11Y-02 | Enter on cards | Focus a process card, press `Enter` | Card expands to show details | ✅ PASS |
| A11Y-03 | FAQ keyboard | Tab to FAQ, press `Enter` | Accordion opens/closes | ✅ PASS |
| A11Y-04 | ARIA live region | Submit eligibility form | Screen reader announces result via `aria-live` | ✅ PASS |
| A11Y-05 | Accessibility mode | Click `♿` | High-contrast, larger text mode activates | ✅ PASS |
| A11Y-06 | Focus outlines | Tab to any button | Blue focus ring visible on all interactive elements | ✅ PASS |
| A11Y-07 | Skip to content | Tab from address bar | First Tab lands on meaningful element, not hidden skip | ✅ PASS |
| A11Y-08 | iframe title | Inspect map iframe | `title="Google Map showing election commission location"` present | ✅ PASS |

---

### 2.9 — Responsive Layout

| ID | Device / Viewport | Test | Expected Result | Status |
|---|---|---|---|---|
| RES-01 | Desktop (1440px) | Full page render | All sections side-by-side; hero two-column | ✅ PASS |
| RES-02 | Tablet landscape (1024px) | Hero + eligibility | Hero stacks; eligibility map stacks vertically | ✅ PASS |
| RES-03 | Phone (375px) | Hero buttons | Buttons stack full-width, text centered | ✅ PASS |
| RES-04 | Small phone (320px) | Chatbot window | Chat opens edge-to-edge with `left`+`right` anchors | ✅ PASS |
| RES-05 | Phone (375px) | Hamburger menu | Nav links hidden; `☰` shows; click reveals mobile menu | ✅ PASS |
| RES-06 | iPhone SE (375px) | Simulation lab | Cards stack to single column; buttons tap-friendly (44px) | ✅ PASS |

---

### 2.10 — Security / Input Handling

| ID | Test Case | Input | Expected Result | Status |
|---|---|---|---|---|
| SEC-01 | XSS in chat input | `<img src=x onerror=alert(1)>` | Rendered as plain text via `textContent`; no execution | ✅ PASS |
| SEC-02 | XSS in pincode input | `<script>alert(1)</script>` | Passed to `encodeURIComponent` — safely encoded in URL | ✅ PASS |
| SEC-03 | SQL injection string | `'; DROP TABLE users; --` | Treated as plain search query; NLP returns fallback | ✅ PASS |
| SEC-04 | External link safety | Inspect all `<a target="_blank">` | All have `rel="noopener noreferrer"` | ✅ PASS |

---

## 3. Performance Checks

| Metric | Target | Observed |
|---|---|---|
| First Contentful Paint | < 2s | ~0.8s (Cloud Run cold start) |
| Time to Interactive | < 3s | ~1.2s |
| Chat API response | < 1.5s | 500–1000ms (artificial delay) |
| Lighthouse Score (Performance) | > 85 | ~90 |
| Lighthouse Score (Accessibility) | > 90 | ~96 |

---

## 4. Cross-Browser Compatibility

| Browser | Version | Result |
|---|---|---|
| Chrome | 124+ | ✅ Fully functional |
| Firefox | 125+ | ✅ Fully functional |
| Edge | 124+ | ✅ Fully functional |
| Safari | 17+ | ✅ Functional (`-webkit-backdrop-filter` applied) |
| Chrome Android | Latest | ✅ Touch targets verified (44px min) |
| Safari iOS | 16+ | ✅ Safe-area insets applied for notched devices |

---

## 5. Edge Cases Tested

- [ ] Chatbot with 500-character long message → truncated response returned
- [ ] Eligibility form submitted with age = 0 → handled as underage
- [ ] Simulation reset during active VVPAT countdown → timer cleared cleanly
- [ ] Map iframe with special characters in pincode → `encodeURIComponent` encodes safely
- [ ] Dark mode + Accessibility mode combined → both style overrides coexist
- [ ] Quiz re-attempt (buttons disabled) → page refresh resets state correctly

---

## 6. Future Automated Testing Roadmap

### Phase 1 — Unit Tests (Jest)
```bash
npm install --save-dev jest
```
- Test `getSmartResponse()` in `server.js` for all 22 intents
- Test input validation (empty, null, XSS payloads)
- Test fallback responses for low-confidence matches

### Phase 2 — API Tests (Supertest)
```bash
npm install --save-dev supertest
```
- `POST /api/chat` with valid message → 200 + reply
- `POST /api/chat` with empty body → 400 error
- `POST /api/chat` with non-string message → 400 error
- `GET /` → 200 + HTML response

### Phase 3 — E2E Tests (Playwright)
```bash
npm install --save-dev @playwright/test
```
- Full voting simulation flow
- Eligibility checker all branches
- Mobile viewport rendering
- Dark mode toggle persistence

### Phase 4 — CI/CD Pipeline
```yaml
# .github/workflows/test.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npx playwright test
```

---

## 7. How to Run Manual Tests

```bash
# Start the server
npm start

# Open in browser
# http://localhost:8080

# Open DevTools → Console tab
# Run targeted checks per test case above

# For responsive testing:
# Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
# Test at: 320px, 375px, 768px, 1024px, 1440px
```

---

*VoteGuide AI — Test Strategy Document · Version 1.0 · April 2026*
