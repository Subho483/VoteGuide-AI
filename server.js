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

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!apiKey) {
      return res.status(503).json({ error: "No API key configured." });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `
You are VoteGuide AI, a neutral civic assistant.
Explain voting rules, NOTA, eligibility, election officers, and election processes simply.
If rules vary by region, say so.
User asks: ${userMessage}
`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ error: "Gemini request failed." });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    res.json({ reply });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
