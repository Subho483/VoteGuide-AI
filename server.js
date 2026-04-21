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
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `You are a civic election assistant named VoteGuide AI. Keep answers short, polite, and helpful (under 3 sentences). User asks: ${userMessage}` }]
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
