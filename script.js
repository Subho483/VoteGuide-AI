/**
 * VoteGuide AI - Main Logic
 * Handling UI interactions, theming, Eligibility logic, and smart chatbot logic.
 */

// NOTE: For live Gemini usage, insert key here. Else it will use local intelligence.
const GEMINI_API_KEY = ""; 

document.addEventListener('DOMContentLoaded', () => {
    
    // Set Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // =============== Theme Toggle ===============
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Load from local storage
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.replace('light-mode', 'dark-mode');
        themeBtn.textContent = '☀️';
    }

    themeBtn.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            themeBtn.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            themeBtn.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });

    // =============== Mobile Navbar ===============
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // =============== Progress Tracker & State ===============
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const completedSteps = new Set();
    let quizScore = 0;
    let formScore = 0;

    function updateProgressUI() {
        let knowledgeScore = completedSteps.size * 12 + quizScore + formScore;
        if (knowledgeScore > 100) knowledgeScore = 100;
        progressFill.style.width = knowledgeScore + '%';
        progressText.textContent = Math.floor(knowledgeScore) + '%';
    }

    // =============== Process Cards Interaction ===============
    const processCards = document.querySelectorAll('.process-card');
    processCards.forEach((card, index) => {
        function toggleCard() {
            if (card.classList.contains('active')) {
                card.classList.remove('active');
            } else {
                processCards.forEach(c => c.classList.remove('active')); // close others
                card.classList.add('active');
                completedSteps.add(index);
                updateProgressUI();
            }
        }

        card.addEventListener('click', toggleCard);
        
        // Keyboard Accessibility Fix
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard();
            }
        });
    });

    // =============== FAQ Accordion ===============
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isActive) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });


    // =============== Eligibility Checker ===============
    const form = document.getElementById('eligibility-form');
    const resultBox = document.getElementById('eligibility-result');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const age = parseInt(document.getElementById('age').value);
        const citizen = document.getElementById('citizen').value;
        const history = document.getElementById('history').value;

        resultBox.classList.remove('hidden', 'success-msg', 'error-msg');

        if (age < 18) {
            resultBox.textContent = `You are ${age} years old. You need to be at least 18 to vote. Learn the process now so you're ready when the time comes!`;
            resultBox.classList.add('error-msg');
        } else if (citizen !== 'yes') {
            resultBox.textContent = 'Voting requires citizenship. Please consult the electoral portal regarding naturalization rules.';
            resultBox.classList.add('error-msg');
        } else {
            if (history === 'no') {
                resultBox.textContent = 'You are eligible! Since it is your first time, please ensure you complete Step 1: Voter Registration immediately.';
            } else {
                resultBox.textContent = 'You are eligible to vote. Just make sure your name is active on the current electoral roll.';
            }
            resultBox.classList.add('success-msg');
        }
        formScore = 18;
        updateProgressUI();
    });

    // =============== Quiz Logic ===============
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const quizResult = document.getElementById('quiz-result');
    
    quizBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            quizBtns.forEach(b => b.style.opacity = '0.5');
            btn.style.opacity = '1';
            quizResult.classList.remove('hidden', 'success-msg', 'error-msg');
            
            if (btn.getAttribute('data-correct') === 'true') {
                quizResult.textContent = 'Correct! You cannot vote until you turn 18.';
                quizResult.classList.add('success-msg');
                quizScore = 10;
            } else {
                quizResult.textContent = 'Incorrect! Legal voting age is strictly 18.';
                quizResult.classList.add('error-msg');
                quizScore = 0;
            }
            updateProgressUI();
        });
    });

    // =============== Smart Chatbot Logic ===============
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatClose = document.getElementById('chat-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatBody = document.getElementById('chat-body');
    const voiceBtn = document.getElementById('voice-btn');

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    chatSend.addEventListener('click', handleChatSubmit);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSubmit();
    });

    async function handleChatSubmit() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User message
        appendMessage(text, 'user');
        chatInput.value = '';

        // Bot typing indicator placeholder
        const id = 'msg-' + Date.now();
        appendMessage('', 'assistant', id);
        const typingEl = document.getElementById(id);
        if (typingEl) {
            typingEl.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
            typingEl.style.background = 'transparent';
            typingEl.style.border = 'none';
            typingEl.style.padding = '0';
        }

        // Fetch response
        const reply = await getBotResponse(text);
        
        // Update response
        if (typingEl) {
            typingEl.innerHTML = ''; // clear loading dots
            typingEl.style.cssText = ''; // reset inline styles
            typingEl.textContent = reply;
        }
        
        // Auto Speak Feature
        speakText(reply);
    }

    function appendMessage(text, sender, id = null) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        if (id) div.id = id;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Dual Mode: Uses Gemini if key present, else local intent matching.
    async function getBotResponse(prompt) {
        const p = prompt.toLowerCase();
        
        // Local Smart Logic Matcher (Fallback & Lightweight)
        if (!GEMINI_API_KEY) {
            if (p.includes('18') && (p.includes('vote') || p.includes('how'))) {
                 return "Welcome to adulthood! Since you're 18, check the Eligibility tool. You need to Register first (Step 1). Keep an ID handy!";
            } else if (p.includes('17') || p.includes('underage')) {
                 return "You're almost there! You can't vote yet, but you can learn the process. Some regions allow pre-registration at 17.";
            } else if (p.includes('missed') && p.includes('registration')) {
                 return "If you missed registration, check if your state allows 'Same-Day Voter Registration' options or wait for the next electoral roll revision block.";
            } else if (p.includes('after voting') || p.includes('what happens')) {
                 return "After voting, EVMs/Ballots are secured in a strong room. On Counting Day, they are calculated under CCTV surveillance to declare Results.";
            } else if (p.includes('first time')) {
                 return "Hi first-timer! 1) Check Eligibility 2) Register 3) Find polling booth on Maps. Don't worry, it's very simple on the day!";
            } else if (p.includes('elderly') || p.includes('old') || p.includes('senior')) {
                 return "For elderly voters, the commission provides priority lines, pick-up facilities in some cities, and postal ballot options. Speak to the local booth officer.";
            } else if (p.includes('hello') || p.includes('hi')) {
                 return "Hello! I am your civic assistant. Ask me about registration, voting days, or eligibility.";
            } else {
                 return "I'm not exactly sure, but you can check our Process map or FAQ section. (Add a Gemini API key for smarter AI responses!)";
            }
        }

        // Optional Gemini Integration Mode
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `You are a civic election assistant named VoteGuide AI. Keep answers short, polite, and helpful (under 3 sentences). User asks: ${prompt}` }]
                    }]
                })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (error) {
            console.error("Gemini Error:", error);
            return "Sorry, I am facing network issues connecting to my AI brain. Please check the FAQs.";
        }
    }

    // =============== Accessibility: Voice Readout ===============
    function speakText(text) {
        if ('speechSynthesis' in window) {
            // Optional: prevent overlapping speech
            window.speechSynthesis.cancel(); 
            const msg = new SpeechSynthesisUtterance(text);
            // find english voice if possible
            const voices = window.speechSynthesis.getVoices();
            msg.voice = voices.find(v => v.lang.includes('en')) || null;
            window.speechSynthesis.speak(msg);
        }
    }

    // Voice recognition (Speech to text API)
    voiceBtn.addEventListener('click', () => {
        if('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.start();
            voiceBtn.textContent = '🔴';
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                handleChatSubmit();
                voiceBtn.textContent = '🎤';
            };
            recognition.onerror = function() {
                voiceBtn.textContent = '🎤';
            }
            recognition.onend = function() {
                voiceBtn.textContent = '🎤';
            }
        } else {
            alert('Voice input is not supported in this browser.');
        }
    });

});
