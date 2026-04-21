/**
 * VoteGuide AI - Main Logic
 * Handling UI interactions, theming, Eligibility logic, and smart chatbot logic.
 */

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

    // =============== Accessibility Toggle ===============
    const a11yBtn = document.getElementById('a11y-toggle');
    if (a11yBtn) {
        if (localStorage.getItem('a11y') === 'true') {
            body.classList.add('a11y-mode');
        }
        a11yBtn.addEventListener('click', () => {
            body.classList.toggle('a11y-mode');
            localStorage.setItem('a11y', body.classList.contains('a11y-mode'));
        });
    }

    // =============== Reminder Generator ===============
    const reminderBtn = document.getElementById('reminder-btn');
    if (reminderBtn) {
        reminderBtn.addEventListener('click', () => {
            const icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VoteGuide AI//EN\nBEGIN:VEVENT\nSUMMARY:Election Day Reminder\nDESCRIPTION:Don't forget to cast your vote today! Check your polling booth via VoteGuide AI.\nDTSTART;VALUE=DATE:20261103\nEND:VEVENT\nEND:VCALENDAR";
            const blob = new Blob([icsContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Election_Reminder.ics';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            const originalText = reminderBtn.innerHTML;
            reminderBtn.innerHTML = '✅ Saved!';
            setTimeout(() => reminderBtn.innerHTML = originalText, 3000);
        });
    }

    // =============== Pincode Search ===============
    const pincodeBtn = document.getElementById('pincode-btn');
    const pincodeInput = document.getElementById('pincode-input');
    const mapIframe = document.getElementById('map-iframe');
    
    if (pincodeBtn && pincodeInput && mapIframe) {
        pincodeBtn.addEventListener('click', () => {
            const val = pincodeInput.value.trim();
            if (val) {
                mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(val)}+Polling+Booth&t=&z=14&ie=UTF8&output=embed`;
            }
        });
        pincodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') pincodeBtn.click();
        });
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

    let lastContext = ""; // For smarter chatbot memory

    // Dual Mode: Uses Backend API proxy if present, else local intent matching.
    async function getBotResponse(prompt) {
        const p = prompt.toLowerCase();
        
        // Helper function for local smart logic fallback
        function getLocalFallback() {
            let response = "";
            if (p.includes('18') && (p.includes('vote') || p.includes('how'))) {
                 response = "Welcome to adulthood! Since you're 18, check the Eligibility tool. You need to Register first (Step 1). Keep an ID handy!";
                 lastContext = "registration";
            } else if (lastContext === "registration" && (p.includes('what next') || p.includes('then what') || p.includes('after'))) {
                 response = "After you register, wait for your Voter ID. On Election day, you head to the polling booth on the Map to cast your vote!";
                 lastContext = "voting";
            } else if (p.includes('17') || p.includes('underage')) {
                 response = "You're almost there! You can't vote yet, but you can learn the process. Some regions allow pre-registration at 17.";
                 lastContext = "underage";
            } else if (p.includes('missed') && p.includes('registration')) {
                 response = "If you missed registration, check if your state allows 'Same-Day Voter Registration' options or wait for the next electoral roll revision block.";
            } else if (p.includes('fake') || p.includes('news')) {
                 response = "Misinformation is rampant! Always rely on the official Election Commission websites and trust verified fact-checkers.";
            } else if (p.includes('after voting') || p.includes('what happens')) {
                 response = "After voting, EVMs/Ballots are secured in a strong room. On Counting Day, they are calculated under CCTV surveillance to declare Results.";
            } else if (p.includes('first time')) {
                 response = "Hi first-timer! 1) Check Eligibility 2) Register 3) Find polling booth on Maps. Don't worry, it's very simple on the day!";
                 lastContext = "first-time";
            } else if (p.includes('elderly') || p.includes('old') || p.includes('senior')) {
                 response = "For elderly voters, the commission provides priority lines, pick-up facilities in some cities, and postal ballot options. Speak to the local booth officer.";
            } else if (p.includes('hello') || p.includes('hi')) {
                 response = "Hello! I am your civic assistant. Ask me about registration, voting days, or eligibility.";
            } else {
                 response = "I'm not exactly sure, but you can check our Process map or FAQ section.";
                 lastContext = "";
            }
            return response;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });

            // If API key is missing on backend, parsing fails, or quota exhausted, standard response catches
            if (!response.ok) {
                console.warn("Backend API unavailable or missing API Key. Falling back to local intelligence.");
                return getLocalFallback();
            }

            const data = await response.json();
            if (data && data.reply) {
                return data.reply;
            }
        } catch (error) {
            console.error("Proxy Error:", error);
        }
        
        // Ultimate network fallback
        return getLocalFallback();
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
