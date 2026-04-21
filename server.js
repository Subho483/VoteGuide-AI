const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Secure API Proxy for Gemini
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!userMessage) return res.status(400).json({ error: "Message is required." });

        if (!apiKey) return res.status(503).json({ error: "No API Key configured on server." });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const systemPrompt = `You are VoteGuide AI, a helpful civic assistant. Your job is to explain elections, voting rules, voter eligibility, election officers, election procedures, and civic participation in a clear, simple, beginner-friendly way.
Rules:
- Be accurate and neutral
- Use simple language
- If rules vary by country or state, clearly say so
- Encourage users to verify with official election authorities
- Never give partisan political opinions
- Never persuade users who to vote for
- Explain terms like NOTA, Model Code of Conduct, Returning Officer, Presiding Officer, secret ballot, voter registration, polling booth, etc.
- Help with practical voting problems
- If asked about current elections, provide general guidance unless live data is unavailable
- Keep responses concise but useful

User asks: ${userMessage}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            })
        });

        const data = await response.json();
        
        if (data && data.candidates && data.candidates[0]) {
            res.json({ reply: data.candidates[0].content.parts[0].text });
        } else {
            console.error("Gemini Response Structure Error:", data);
            res.status(500).json({ error: "Failed to parse API response." });
        }
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
