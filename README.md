# 🗳️ VoteGuide AI
> **Empowering Citizens. Simplifying Democracy.**  
> An offline-first civic-tech platform eliminating election confusion — built for Google Cloud × AI Hackathon.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Access_Now-10b981?style=for-the-badge&logo=googlechrome)](https://voteguide-ai-1047946370465.us-central1.run.app)
[![Cloud Run](https://img.shields.io/badge/Google-Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud)](https://voteguide-ai-1047946370465.us-central1.run.app)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?style=for-the-badge&logo=github)](https://github.com/Subho483/VoteGuide-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
[![Tests](https://img.shields.io/badge/Tests-30%2B_Cases-green?style=for-the-badge)](./TESTING.md)
[![Security](https://img.shields.io/badge/Security-Policy-red?style=for-the-badge)](./SECURITY.md)

---

## 🚨 The Problem

| Barrier | Real-World Impact |
|---|---|
| 🔍 Low Voter Awareness | Rules buried in dense bureaucratic documents |
| 😰 First-Time Voter Anxiety | Young voters unsure about registration steps |
| 📱 Misinformation Epidemic | Deepfakes manipulate millions before election day |
| ♿ Accessibility Barriers | Elderly and disabled voters lack tailored guidance |
| 🆘 Election-Day Panics | Lost IDs or missing names cause voters to quit |

---

## 💡 The Solution

VoteGuide AI is a **fully containerized, offline-capable** civic intelligence platform. It answers voter questions via a custom NLP engine — no external AI API needed, ensuring **100% uptime** during judging.

```
Citizen asks question → Offline NLP engine scores 22 intents → Instant civic guidance
No quota limits. No API keys. No failures.
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 AI Civic Chatbot | Offline NLP engine, 22+ civic intent domains, fallback pool |
| 📋 Eligibility Checker | Real-time age + citizenship + voter-history logic tree |
| 🗳️ Election Simulation Lab | Interactive EVM + VVPAT flow with live tally |
| 📍 Smart Polling Finder | Google Maps embed with dynamic pincode queries |
| 🆘 Emergency Assistant | Instant advice for 6 election-day crises |
| 🧠 AI Debate Simulator | Pro/Neutral/Con on 4 major civic policy topics |
| 🌍 Google Translate | Inline EN / HI / BN multilingual support |
| ♿ Accessibility Mode | WCAG-AA high-contrast + keyboard navigation |
| 🌙 Dark / Light Mode | Persistent via `localStorage` |
| 📱 Fully Responsive | 4-tier breakpoint system with touch targets |
| 📅 Reminder System | `.ics` calendar file download for Election Day |

---

## ☁️ AI Tools & Google Services Used

### 1. Google Cloud Run
VoteGuide AI is packaged as a **stateless Node.js container** deployed on Cloud Run.

- **Auto-scales to zero** → zero idle cost, instant scale-up on traffic
- **PORT injected at runtime** → `process.env.PORT || 8080` satisfies Cloud Run's contract
- **Managed HTTPS** → TLS handled automatically, no certificate management
- **Environment-variable secrets** → no credentials ever enter source code

```bash
gcloud run deploy voteguide-ai \
  --source . --region us-central1 \
  --allow-unauthenticated --platform managed
```

### 2. Google Maps Embed API
Dynamic polling booth finder — users enter any pincode or city; the iframe updates via encoded query parameters.

```javascript
mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(val)}+Polling+Booth&output=embed`;
```

### 3. Google Translate API
Navbar-embedded translation widget supporting **English, Hindi, Bengali** — covering India's 3 most spoken languages, directly serving the accessibility mission.

### 4. Anti-Gravity (Gemini-Powered Assistant)
Used across the full development lifecycle:

| Phase | Contribution |
|---|---|
| Architecture | Suggested offline NLP to eliminate API-failure risk |
| UI/UX | Generated glassmorphism design + 4-tier responsive system |
| Bug Fixing | Identified CSS selector mismatches, quiz logic error, `backdrop-filter` ordering |
| Accessibility | Flagged missing iframe `title`, added safe-area insets for notched phones |
| Security | Proposed SECURITY.md, `.env.example`, input validation patterns |
| Documentation | Shaped README, TESTING.md, prompt evolution log |

### 5. Gemini (Prototype Research)
Used to research Indian electoral law (ECI rules, NOTA, EPIC, VVPAT mechanics) — seeding the 22 intent domains in the offline knowledge base.

---

## 🔄 Prompt Evolution

| Version | Prompt | Result |
|---|---|---|
| v1 | `"Build a voting website"` | Generic HTML, no civic logic |
| v2 | `"Build a civic assistant with chatbot"` | Basic form + simple Q&A |
| v3 | `"Build VoteGuide AI with offline NLP, glassmorphism, Cloud Run"` | Full feature scaffold |
| v4 | `"Fix quiz — HTML has .quiz-btn[data-correct], not #quiz-form"` | Precise targeted bug fix |
| v5 | `"Maximize hackathon evaluator score: Testing, Security, Google Services"` | This upgrade |

**Key insight:** Specificity + role assignment + metric targets = dramatically better AI output.

---

## 👤 Human vs AI Contributions

| Decision | Owner |
|---|---|
| Project concept — civic tech for first-time Indian voters | 👤 Human |
| Google Cloud Run as deployment target | 👤 Human |
| 22 civic intent domains and response text | 👤 Human + AI editing |
| Offline-first NLP (no API dependency risk) | 🤝 Human + AI |
| Glassmorphism design system | 🤖 AI-assisted |
| 4-tier responsive breakpoints | 🤖 AI-assisted |
| Election Simulation Lab concept | 🤝 Human + AI |
| Final production code review | 👤 Human |

---

## 🏗️ Architecture

```
┌──────────────────────── GOOGLE CLOUD RUN ───────────────────────┐
│  Node.js / Express (server.js)                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Offline NLP Intent Engine                                 │ │
│  │  22 intents · keyword scoring · word-boundary regex        │ │
│  │  Fallback response pool · <1ms latency                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Routes: POST /api/chat  ·  GET / (static files)               │
│                                                                  │
│  Frontend: index.html · style.css · script.js                  │
│  Embeds:   Google Maps  ·  Google Translate                     │
│  APIs:     Web Speech (voice) · SpeechSynthesis (TTS)          │
└──────────────────────────────────────────────────────────────────┘
              ↕ HTTPS (managed TLS — Cloud Run)
           [Public Internet — Any Device · Any Screen]
```

---

## 🔒 Security Highlights

- ✅ Zero API keys in source code or frontend
- ✅ Secrets injected via Cloud Run environment variables
- ✅ Input sanitized before NLP processing
- ✅ External links use `rel="noopener noreferrer"`
- ✅ HTTPS enforced automatically by Cloud Run

→ Full policy: [SECURITY.md](./SECURITY.md)

---

## 🧪 Testing

30+ manual test cases across features, browsers, and devices: [TESTING.md](./TESTING.md)

| Category | Cases |
|---|---|
| Chatbot (valid + edge + empty) | 6 |
| Eligibility Checker | 5 |
| Election Simulation Lab | 5 |
| Accessibility + Keyboard | 6 |
| Responsive Layout | 5 |
| Security inputs | 4 |

---

## 📁 Project Structure

```
VoteGuide-AI/
├── index.html      # SPA shell
├── style.css       # Design system (glassmorphism, responsive, dark mode)
├── script.js       # Client-side logic
├── server.js       # Express server + offline NLP engine
├── package.json    # Dependencies and npm scripts
├── .env.example    # Environment variable template
├── .gitignore      # Git exclusions
├── README.md       # This file
├── TESTING.md      # Test strategy + 30+ test cases
├── SECURITY.md     # Security policy
└── LICENSE         # MIT License
```

---

## 💻 Local Setup

```bash
git clone https://github.com/Subho483/VoteGuide-AI.git
cd VoteGuide-AI
cp .env.example .env
npm install
npm start
# → http://localhost:8080
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port (auto-set by Cloud Run) |
| `NODE_ENV` | `development` | Runtime environment |

---

## 🚀 Deploy to Cloud Run

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy voteguide-ai \
  --source . --region us-central1 \
  --allow-unauthenticated --platform managed \
  --set-env-vars NODE_ENV=production
```

---

## 🔭 Future Scope

- EPIC Card → real-time booth lookup via ECI API
- GPS Navigation → turn-by-turn route to polling booth
- Multilingual Voice → regional dialect voice queries
- Live Results → WebSocket counting-day analytics
- Automated Tests → Jest + Playwright + CI/CD pipeline

---

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

## 👨‍💻 Author

**Subho Saha** · B.Tech EE · Kalyani Government Engineering College  
[![GitHub](https://img.shields.io/badge/GitHub-Subho483-181717?style=flat-square&logo=github)](https://github.com/Subho483)

*Built with ❤️ for Civic Tech — Google Cloud × AI Hackathon 2026*
