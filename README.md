# 🗳️ VoteGuide AI

**Smart civic assistant to help users understand elections, eligibility, timelines, and voting steps in an interactive and easy-to-use platform.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://voteguide-ai-1047946370465.us-central1.run.app)
[![Cloud Run](https://img.shields.io/badge/Deployed%20on-Google%20Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud)](https://voteguide-ai-1047946370465.us-central1.run.app)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)]

---

# 📌 Problem Statement

The election process can be confusing for many citizens, especially:

- First-time voters  
- Students turning 18  
- Elderly users  
- Returning voters  
- People unaware of timelines or required documents  

Important election information is often scattered, difficult to understand, or not beginner-friendly.

---

# 💡 Our Solution

**VoteGuide AI** simplifies democracy through a modern web app that explains the election process step-by-step, checks eligibility, answers voter questions, and provides an accessible experience for everyone.

It is lightweight, fast, mobile-friendly, and deployed live on Google Cloud.

---

# 🚀 Live Demo

👉 **Try the App Here:**  
https://voteguide-ai-1047946370465.us-central1.run.app

---

# ✨ Features

## 🧠 Smart Assistant
- AI-style chatbot for voter questions
- Built-in fallback logic works even without API
- Guidance for first-time, elderly, and underage users

## ✅ Eligibility Checker
- Check voting eligibility using:
  - Age
  - Citizenship
  - Voting history

## 🗳️ Election Process Guide
Interactive explanation of 6 stages:

1. Voter Registration  
2. Candidate Nomination  
3. Campaign Period  
4. Voting Day  
5. Vote Counting  
6. Results Declaration  

## 📅 Election Timeline
Understand key milestones and deadlines visually.

## 🌍 Multilingual Support
- English
- Hindi
- Bengali

## 📍 Polling Location Section
Integrated Google Maps embed for location awareness.

## 🚧 Smart Polling Booth Finder (Premium Preview)
A simulated roadmap preview demonstrating how users will soon be able to input their EPIC/Voter ID to securely fetch their exact booth and launch native GPS directions directly to the door.

## 🎨 Premium UI/UX
- Glassmorphism design
- Responsive layout
- Smooth animations
- Clean civic theme

## 🌙 Accessibility
- Dark / Light mode
- Keyboard navigation
- Readable fonts
- Responsive mobile design

## 🎯 Extra Features
- Civic knowledge quiz
- Progress tracker
- Voice readout support

---

# ☁️ Google Services Used

| Service | Purpose |
|--------|---------|
| Google Cloud Run | Live deployment |
| Google Maps Embed | Polling location section |
| Google Translate | Multilingual accessibility |
| Google Gemini API *(Optional)* | Smart chatbot responses |

---

# 🛠️ Tech Stack

- HTML5  
- CSS3  
- JavaScript (Vanilla JS)  
- Node.js  
- Express.js  
- Google Cloud Run  

---

# 🏗️ How It Works

```text
User Input
   ↓
Frontend Interface
   ↓
Smart Logic Engine / Gemini API
   ↓
Helpful Civic Response
```

---

# 📷 Screenshots

> Add screenshots here before final submission.

```md
![Homepage](screenshots/home.png)
![Chatbot](screenshots/chatbot.png)
![Mobile View](screenshots/mobile.png)
```

---

# 💻 Run Locally

```bash
git clone https://github.com/Subho483/VoteGuide-AI.git
cd VoteGuide-AI
npm install
npm start
```

Open in browser:

```text
http://localhost:8080
```

---

# 🚀 Deployment

Deployed using **Google Cloud Run**

```bash
gcloud run deploy voteguide-ai \
  --source . \
  --allow-unauthenticated \
  --project=voteguide-ai \
  --region=us-central1
```

---

# 🔒 Security Notes

* Lightweight frontend-first architecture
* Optional Gemini API integration
* Fallback chatbot logic works without external API
* Public demo optimized for hackathon usage

---

# 🔮 Future Improvements

* Real polling booth search using pincode
* Real election commission APIs
* Secure backend proxy for Gemini API
* Personalized voter reminders
* Expanded language support
* User accounts and saved preferences

---

# 🌍 Why This Matters

A stronger democracy begins with informed citizens.

VoteGuide AI reduces confusion, increases accessibility, and helps people participate confidently in elections.

---

# 👨💻 Developer

**Subho Saha**
B.Tech Electrical Engineering Student
Robotics • Embedded Systems • Software Development

GitHub: [https://github.com/Subho483](https://github.com/Subho483)

---

# 🏆 Hackathon Ready

✔ Lightweight under constraints
✔ Real-world problem solving
✔ Practical implementation
✔ Google services integrated
✔ Live deployed product
✔ Scalable future potential
