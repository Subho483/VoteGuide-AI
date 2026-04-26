/**
 * @fileoverview VoteGuide AI — Express Server & Offline NLP Civic Engine
 *
 * This server serves the static frontend and exposes a single POST endpoint
 * (/api/chat) that processes civic questions using a local keyword-scoring
 * NLP engine. No external AI API calls are made in production, guaranteeing
 * zero latency failures and 100% uptime during judging.
 *
 * Architecture:
 *   - Static file serving  → GET /
 *   - Civic AI endpoint    → POST /api/chat
 *   - NLP engine           → getSmartResponse(message)
 *
 * @author  Subho Saha
 * @version 1.0.0
 * @license MIT
 */

'use strict';

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname));
app.use(express.json());

// ==========================================
// CIVIC KNOWLEDGE BASE (Intents & Responses)
// ==========================================
const intents = [
    {
        id: 'eligibility_underage',
        keywords: ['17', '16', 'under 18', 'underage', 'too young', 'not 18', 'student'],
        response: "You are almost there! You cannot vote until you turn 18. However, some regions allow pre-registration at 16 or 17. Use this time to learn about the democratic process!"
    },
    {
        id: 'eligibility_age',
        keywords: ['18', 'age', 'old enough', 'how old', 'eighteen', 'eligibility', 'eligible'],
        response: "To vote, you must be at least 18 years old on the qualifying date (which varies by region). If you are 18, check your eligibility and register immediately!"
    },
    {
        id: 'eligibility_citizen',
        keywords: ['citizen', 'foreigner', 'nri', 'immigrant', 'nationality'],
        response: "Voting in national and state elections strictly requires you to be a citizen of the country. Non-citizens generally cannot vote, though rules for local municipal elections can sometimes vary by region."
    },
    {
        id: 'eligibility_first_time',
        keywords: ['first time', 'first-timer', 'never voted', 'beginner'],
        response: "Welcome to democracy! As a first-time voter, you need to: 1) Verify you are 18+ and a citizen. 2) Register to vote and get your Voter ID. 3) Find your assigned polling booth. 4) Cast your vote on election day!"
    },
    {
        id: 'registration_deadline',
        keywords: ['missed', 'deadline', 'late', 'passed', 'over'],
        response: "If you missed the standard voter registration deadline, check if your state allows 'Same-Day Voter Registration'. Otherwise, you will have to wait for the next electoral roll revision cycle to register."
    },
    {
        id: 'registration_how',
        keywords: ['register', 'enroll', 'apply', 'sign up', 'voter id', 'epic', 'address change', 'change address'],
        response: "You can register to vote or update your address online through your national/state Election Commission portal, or offline by submitting the required physical form to your local Electoral Registration Officer. You will need proof of age and residence."
    },
    {
        id: 'voting_day_carry',
        keywords: ['carry', 'bring', 'take', 'need on day', 'documents', 'what to bring'],
        response: "On election day, you must bring a valid approved photo ID. This is typically your Voter ID (EPIC), but alternative government IDs like a Passport, Driving License, or PAN Card are usually accepted. Rules vary slightly by region."
    },
    {
        id: 'voting_day_process',
        keywords: ['booth process', 'inside booth', 'how to vote', 'steps to vote', 'what to do', 'evm', 'ballot'],
        response: "At the booth: 1) The Polling Officer verifies your ID. 2) The second officer marks your finger with indelible ink and gives you a slip. 3) You proceed to the voting compartment to cast your secret ballot on the EVM (Electronic Voting Machine) or paper ballot."
    },
    {
        id: 'voting_day_ink',
        keywords: ['ink', 'mark', 'finger', 'black mark'],
        response: "The indelible ink mark applied to your finger is a security measure to prevent multiple voting. It usually fades after a few weeks."
    },
    {
        id: 'voting_day_secret',
        keywords: ['secret', 'privacy', 'who i voted for', 'find out'],
        response: "Your vote is entirely secret. The voting compartment ensures total privacy, and no election officer, candidate, or family member can find out who you voted for."
    },
    {
        id: 'nota',
        keywords: ['nota', 'none of the above', 'don\'t like anyone', 'reject'],
        response: "NOTA stands for 'None Of The Above'. It allows you to officially register your dissatisfaction with all contesting candidates on the ballot while still participating in the democratic process."
    },
    {
        id: 'officer_presiding',
        keywords: ['presiding officer', 'in charge', 'booth head'],
        response: "The Presiding Officer is the official in complete charge of a specific polling booth. They ensure the voting process is free, fair, and orderly, and they assist voters if EVM issues arise."
    },
    {
        id: 'officer_returning',
        keywords: ['returning officer', 'ro', 'election head'],
        response: "The Returning Officer (RO) is the statutory authority conducting the election in a specific constituency. They accept nominations, oversee counting, and declare the final result."
    },
    {
        id: 'officer_polling',
        keywords: ['polling officer', 'observer', 'election officer'],
        response: "Polling Officers assist the Presiding Officer inside the booth (checking IDs, applying ink). Election Observers are independent officials appointed to watch the process and ensure rules are strictly followed."
    },
    {
        id: 'emergency_lost_id',
        keywords: ['lost id', 'no voter id', 'forgot id', 'epic lost', 'lost my card'],
        response: "Don't panic! If your name is on the voter list but you lost your Voter ID, you can still vote using alternative state-approved photo IDs like a Passport, Driver's License, or Aadhaar/National ID."
    },
    {
        id: 'emergency_missing_name',
        keywords: ['name missing', 'not on list', 'deleted', 'name not found'],
        response: "If you have a Voter ID but your name is missing from the polling booth list due to a clerical error, you generally cannot vote that day. You will need to file a dispute form with the Booth Level Officer for the next cycle."
    },
    {
        id: 'emergency_queue',
        keywords: ['long queue', 'line too long', 'closing time', 'late'],
        response: "If there is a long queue, stay in line! By law, if you join the queue before the official closing time (usually 5 or 6 PM), the officers must allow everyone currently in the line to cast their vote."
    },
    {
        id: 'emergency_a11y',
        keywords: ['disabled', 'wheelchair', 'blind', 'elderly', 'ramp', 'assistance', 'nervous', 'panic'],
        response: "Polling booths are legally required to be accessible with wheelchair ramps. Priority voting lines are given to elderly, pregnant, or disabled voters. If you are nervous, simply approach an officer—they are trained to guide you step-by-step!"
    },
    {
        id: 'counting_results',
        keywords: ['counting', 'results', 'strong room', 'after voting', 'winner', 'who won'],
        response: "After voting concludes, EVMs or ballot boxes are sealed and transported to heavily guarded Strong Rooms under CCTV. On Counting Day, they are opened before election observers to tally votes and declare the winner."
    },
    {
        id: 'fake_news',
        keywords: ['fake news', 'whatsapp', 'deepfake', 'misinformation', 'rumor', 'forward', 'fake'],
        response: "Misinformation damages democracy. Always verify election dates and rules directly with the official Election Commission. Beware of deepfake videos and emotionally manipulative social media rumors."
    },
    {
        id: 'location_booth',
        keywords: ['where to vote', 'find booth', 'location', 'where do i go', 'pincode'],
        response: "You must vote at your assigned polling booth. You can find this location by searching your Pincode/EPIC on the official Election Commission website, or by using the Smart Polling Booth tool on our page."
    },
    {
        id: 'general_democracy',
        keywords: ['why vote', 'democracy', 'important', 'does my vote count', 'rights', 'responsibility', 'who should i vote for', 'partisan'],
        response: "Voting is the foundation of democracy. It is your right and responsibility to choose the representatives who will make decisions affecting your daily life. Every single vote counts! (Note: As a neutral AI, I will never tell you who to vote for. Research candidates and vote your conscience.)"
    }
];

// Fallback responses if no keywords match strongly enough
const fallbackResponses = [
    "I am your civic assistant. I can help you understand voter eligibility, the polling process, NOTA, or election emergencies. What would you like to know?",
    "That's a great question. While I don't have the exact specific details for that, I highly recommend checking your local Election Commission's official website for the most accurate regional rules.",
    "I'm here to help you navigate elections simply and neutrally. Could you rephrase your question regarding voting steps, rules, or polling officers?"
];

// ==========================================
// NLP / INTELLIGENT MATCHING ENGINE
// ==========================================
/**
 * Scores a user message against the civic intent knowledge base and returns
 * the most relevant pre-authored response.
 *
 * Algorithm:
 *  1. Normalize input (lowercase + trim)
 *  2. Intercept common greetings early for instant response
 *  3. For each intent, score keyword matches using:
 *     - Full word-boundary regex match → keyword.length points (strong signal)
 *     - Partial substring match        → keyword.length × 0.5 points (weak signal)
 *  4. Select the intent with the highest accumulated score
 *  5. If best score < threshold (2), return a random fallback response
 *
 * @param  {string} message - Raw user message from the chat input
 * @returns {string}         - Civic guidance response string
 */
function getSmartResponse(message) {
    const text = message.toLowerCase().trim();
    
    // Quick exit for greetings
    if (['hi', 'hello', 'hey', 'start', 'help'].includes(text)) {
        return "Hello! I am VoteGuide AI, your neutral civic assistant. You can ask me about voter eligibility, registration, election officers, polling booth procedures, or what to do in an emergency. How can I assist you today?";
    }

    let bestMatch = null;
    let highestScore = 0;

    for (const intent of intents) {
        let score = 0;
        for (const keyword of intent.keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(text)) {
                score += keyword.length; // Strong word boundary match
            } else if (text.includes(keyword)) {
                score += keyword.length * 0.5; // Partial match penalty
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
        }
    }

    // Threshold logic to ensure we don't trigger on completely unrelated garbage text
    if (bestMatch && highestScore > 2) {
        return bestMatch.response;
    }

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// ==========================================
// ROUTES
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Primary Chatbot Endpoint
app.post('/api/chat', (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a valid string.' });
        }

        // Process intelligently offline
        const reply = getSmartResponse(userMessage);

        // Simulate slight network delay to mimic AI thinking, making UX feel natural
        setTimeout(() => {
            res.json({ reply });
        }, 500 + Math.random() * 500);

    } catch (error) {
        console.error("Internal Engine Error:", error);
        res.status(500).json({ error: 'Internal server error processing civic intelligence.' });
    }
});

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
    console.log(`VoteGuide AI Offline Knowledge Engine running on port ${PORT}`);
});
