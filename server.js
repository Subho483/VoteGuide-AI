/**
 * @fileoverview VoteGuide AI — Production Server v3.0.0
 *
 * Google Services Integrated:
 *   - Google Gemini AI  (@google/generative-ai) → Primary chat engine
 *   - Google Cloud Run  → Hosting & auto-scaling (PORT env var)
 *   - Google Maps Embed → Polling booth finder (client-side)
 *   - Google Translate  → Multilingual widget (client-side)
 *   - Google Fonts      → Inter typeface (client-side)
 *
 * Security Stack:
 *   - Helmet.js         → 11 HTTP security headers (CSP, HSTS, X-Frame, etc.)
 *   - express-rate-limit→ 30 req/min per IP on /api/
 *   - CORS              → Explicit origin control
 *   - Input validation  → Type + length checks before NLP processing
 *
 * Performance Stack:
 *   - compression       → Gzip/Brotli for all text responses
 *   - Cache-Control     → Long-lived caching for static assets
 *   - Health endpoint   → Cloud Run readiness/liveness probe
 *
 * @author  Subho Saha <github.com/Subho483>
 * @version 3.0.0
 * @license MIT
 */

'use strict';

// ==========================================
// IMPORTS
// ==========================================
const express    = require('express');
const path       = require('path');
const helmet     = require('helmet');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');
const cors       = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app  = express();
const PORT = process.env.PORT || 8080;
const IS_PROD = process.env.NODE_ENV === 'production';

// ==========================================
// GOOGLE GEMINI AI — Primary Chat Engine
// ==========================================

/**
 * System instruction that constrains Gemini to neutral civic guidance.
 * Prevents partisan responses and keeps answers concise and election-relevant.
 * @constant {string}
 */
const CIVIC_SYSTEM_PROMPT =
    'You are VoteGuide AI, a helpful, neutral, and accurate civic assistant ' +
    'specialized in Indian elections and global democratic processes. ' +
    'Help citizens understand voter eligibility, registration, polling procedures, ' +
    'election officers, NOTA, and election-day emergencies. ' +
    'Keep answers concise (2-4 sentences), factual, and strictly non-partisan. ' +
    'Never tell users who to vote for. If asked about non-election topics, ' +
    'politely redirect to civic and election-related questions.';

/**
 * Initialized Gemini generative model. Null if GEMINI_API_KEY is absent.
 * @type {import('@google/generative-ai').GenerativeModel | null}
 */
let geminiModel = null;

if (process.env.GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: CIVIC_SYSTEM_PROMPT,
        });
        console.log('✅ Google Gemini 1.5 Flash initialized');
    } catch (initErr) {
        console.warn('⚠️  Gemini init failed — offline NLP active:', initErr.message);
    }
} else {
    console.log('ℹ️  GEMINI_API_KEY absent — offline civic NLP engine active');
}

// ==========================================
// MIDDLEWARE STACK
// ==========================================

// 1. Gzip/Brotli compression — reduces payload size by ~70%
app.use(compression());

// 2. Security headers via Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc:     ["'self'"],
            scriptSrc:      ["'self'", "'unsafe-inline'",
                             'https://translate.googleapis.com',
                             'https://translate.google.com'],
            styleSrc:       ["'self'", "'unsafe-inline'",
                             'https://fonts.googleapis.com'],
            fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
            imgSrc:         ["'self'", 'data:', 'https:', 'http:'],
            frameSrc:       ['https://maps.google.com',
                             'https://www.google.com',
                             'https://translate.google.com'],
            connectSrc:     ["'self'"],
            upgradeInsecureRequests: IS_PROD ? [] : null,
        },
    },
    crossOriginEmbedderPolicy: false, // Required for Google Maps iframe
}));

// 3. CORS — allow same-origin + Cloud Run domain
app.use(cors({
    origin: [
        'http://localhost:8080',
        'https://voteguide-ai-1047946370465.us-central1.run.app',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// 4. Rate limiting — 30 requests/min per IP on API routes
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a moment before trying again.' },
});
app.use('/api/', apiLimiter);

// 5. Static files with long-lived caching for CSS/JS assets
app.use(express.static(__dirname, {
    maxAge: IS_PROD ? '1d' : 0,
    etag: true,
    lastModified: true,
}));

// 6. JSON body parser with size limit
app.use(express.json({ limit: '16kb' }));

// ==========================================
// CIVIC KNOWLEDGE BASE — 22 Intent Domains
// Offline fallback when Gemini is unavailable.
// ==========================================

/**
 * @typedef  {Object} Intent
 * @property {string}   id       - Unique intent identifier
 * @property {string[]} keywords - Scoring keywords (word-boundary matched)
 * @property {string}   response - Pre-authored civic guidance text
 */

/** @type {Intent[]} */
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
        keywords: ['nota', 'none of the above', "don't like anyone", 'reject'],
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

/** @type {string[]} */
const fallbackResponses = [
    "I am your civic assistant. I can help you understand voter eligibility, the polling process, NOTA, or election emergencies. What would you like to know?",
    "That's a great question. While I don't have the exact specific details for that, I highly recommend checking your local Election Commission's official website for the most accurate regional rules.",
    "I'm here to help you navigate elections simply and neutrally. Could you rephrase your question regarding voting steps, rules, or polling officers?"
];

// ==========================================
// OFFLINE NLP ENGINE — Fallback
// ==========================================

/**
 * Scores a user message against the 22-intent civic knowledge base.
 * Used as fallback when Gemini API is unavailable.
 *
 * Scoring algorithm:
 *   - Word-boundary regex match → keyword.length points  (strong signal)
 *   - Substring match           → keyword.length × 0.5  (weak signal)
 *   - Score threshold           → must exceed 2 to avoid false positives
 *
 * @param  {string} message - Sanitized user message (lowercase, trimmed)
 * @returns {string}         - Civic guidance response string
 */
function getSmartResponse(message) {
    const text = message.toLowerCase().trim();

    // Fast-path: common greetings
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
                score += keyword.length;           // Strong: full word match
            } else if (text.includes(keyword)) {
                score += keyword.length * 0.5;    // Weak: partial match
            }
        }
        if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
        }
    }

    if (bestMatch && highestScore > 2) {
        return bestMatch.response;
    }

    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// ==========================================
// ROUTES
// ==========================================

/** Serve the single-page application */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Cloud Run health check endpoint.
 * Used for readiness and liveness probes.
 *
 * @route  GET /health
 * @returns {{ status: 'ok', engine: string, version: string, timestamp: string }}
 */
app.get('/health', (_req, res) => {
    res.json({
        status:    'ok',
        engine:    geminiModel ? 'gemini-1.5-flash' : 'offline-nlp',
        version:   '3.0.0',
        timestamp: new Date().toISOString(),
    });
});

/**
 * Primary Civic Chatbot Endpoint.
 *
 * Flow:
 *   1. Validate input (type + length)
 *   2. Attempt Google Gemini AI response
 *   3. On Gemini failure → fall back to offline NLP engine
 *   4. Return reply + engine source for transparency
 *
 * @route  POST /api/chat
 * @body   {{ message: string }}
 * @returns {{ reply: string, engine: 'gemini-1.5-flash'|'offline-nlp' }}
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // --- Input Validation ---
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'message is required and must be a string.' });
        }
        if (message.trim().length === 0) {
            return res.status(400).json({ error: 'message cannot be empty.' });
        }
        if (message.length > 1000) {
            return res.status(400).json({ error: 'message must be 1000 characters or fewer.' });
        }

        // --- Primary: Google Gemini AI ---
        if (geminiModel) {
            try {
                const result = await geminiModel.generateContent(message);
                const reply  = result.response.text();
                return res.json({ reply, engine: 'gemini-1.5-flash' });
            } catch (geminiErr) {
                console.warn('[Gemini] API error, switching to offline engine:', geminiErr.message);
            }
        }

        // --- Fallback: Offline NLP ---
        const reply = getSmartResponse(message);
        // Small delay to simulate AI "thinking" — improves perceived quality
        await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 300));
        return res.json({ reply, engine: 'offline-nlp' });

    } catch (serverErr) {
        console.error('[Server] Internal error:', serverErr.message);
        res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
    console.error('[Global]', err.message);
    res.status(500).json({ error: 'Unexpected server error.' });
});

// ==========================================
// SERVER START — guarded for testability
// ==========================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🗳️  VoteGuide AI v3.0.0 running on :${PORT}`);
        console.log(`   Engine  : ${geminiModel ? 'Google Gemini 1.5 Flash' : 'Offline NLP'}`);
        console.log(`   Security: Helmet + Rate-Limit + CORS + Compression`);
    });
}

module.exports = { app, getSmartResponse, intents, fallbackResponses };
