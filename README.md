# VoteGuide AI

**Understand Elections Easily**

VoteGuide AI is a lightweight, high-performance civic tech application designed to educate citizens on the election process. It acts as a smart companion for first-time voters, students, and citizens needing clear, accessible guidance.

---

## 🏆 Project Details

- **Project Name:** VoteGuide AI
- **Chosen Vertical:** Civic Tech / Smart Governance
- **Problem Statement:** The electoral process can be confusing, especially for first-time or returning voters who are unaware of current timelines, required documents, or accessibility options.
- **Why This Matters:** Simplifying democracy increases participation. We need a frictionless barrier-to-entry to educate users safely and quickly.

---

## ✨ Core Features

1. **Interactive Process Map:** Break down the complex 6-stage democratic process using interactive glassmorphism UI cards.
2. **Timeline Visualizer:** See major election milestones mapped chronologically to manage expectations.
3. **Smart Eligibility Engine:** Form-based processor mapping logic to dynamically advise users based on their age and citizenship status.
4. **Offline/Online AI Assistant:** Features a local intelligent logic mapper for offline use, scaling up seamlessly via Google Gemini when connected.
5. **Universal Accessibility:** Features Dark Mode toggle, ARIA labeling, responsive layouts, and automatic Web Speech Synthesis API readouts.

---

## ☁️ Google Services Integration

1. **Google Translate Widget:** Embeds lightweight language swapping (English, Hindi, Bengali) with no bulky local dictionaries.
2. **Google Maps Embed API:** Fast iframe mapping technology helping users locate sample polling stations accurately.
3. **Google Gemini AI API (Optional):** Employs the `gemini-1.5-flash` endpoint directly from the client to answer dynamic civic questions efficiently.

*(Note: API Keys are meant to be injected directly in the frontend purely because this is a Hackathon configuration bounded to < 1MB repository constraints. In production, this traffic would route securely through a backend server.)*

---

## 🧠 Smart Logic Explanation

The project has embedded deterministic logic flows combined with language evaluation:
- The backend matches strings and context (`underage`, `missed`, `elderly`) to immediately yield locally stored guidance. 
- Form logic cross-validates integers and bools to return actionable feedback, not just Pass/Fail outcomes.

---

## 🚀 How to Run Locally

Since this utilizes a purely Vanilla stack (HTML + CSS + JS), it needs zero installation or dependency trees to operate.

1. Clone or download this repository.
2. Ensure you have a standard live server or local development environment running.
   ```bash
   # If you have Python installed:
   python -m http.server 8000
   
   # Or using Node:
   npx serve .
   ```
3. Open `http://localhost:8000` in your browser.
4. *(Optional)* Add your Gemini API key to line 7 in `script.js` to enable true generative AI responses.

---

## 🔒 Assumptions & Deployment

- We assume modern browser standards support Web Speech API natively without polyfills.
- Since this is bound to remain under 1MB as per Hackathon constraints, we bypassed React, Tailwind, Next.js, and Node.js backend infrastructure in favor of raw Web API connectivity. 
- The folder is fully **Firebase Hosting Ready**. Run `firebase init` followed by `firebase deploy` to instantly share.

---

## 🔭 Future Improvements

1. Integrations with real-time Electoral Roll Rest APIs.
2. Transitioning to a secure Node.js intermediate server off-loading client-side Google AI API processing.
3. Expanded native translations through i18n workflows rather than rely on generalized widget translation.
