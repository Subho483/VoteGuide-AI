/**
 * VoteGuide AI - Core Application Logic v4.0.0
 * Clean, modular, and optimized for performance.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. STATE & UTILITIES
    // ==========================================
    const state = {
        lastContext: "",
        a11yMode: localStorage.getItem('a11y') === 'true',
        progress: new Set(),
        confettiFired: false
    };

    function triggerConfetti() {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 1 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => { confetti.remove(); }, 6000);
        }
    }

    function updateProgress(actionId) {
        state.progress.add(actionId);
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        if (progressFill && progressText) {
            const percentage = Math.min((state.progress.size / 6) * 100, 100);
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}%`;
            if (percentage === 100 && !state.confettiFired) {
                state.confettiFired = true;
                triggerConfetti();
            }
        }
    }

    // ==========================================
    // 2. THEME & ACCESSIBILITY
    // ==========================================
    const body = document.body;
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    const a11yBtn = document.getElementById('a11y-toggle');
    if (a11yBtn) {
        if (state.a11yMode) body.classList.add('a11y-mode');
        a11yBtn.addEventListener('click', () => {
            body.classList.toggle('a11y-mode');
            state.a11yMode = body.classList.contains('a11y-mode');
            localStorage.setItem('a11y', state.a11yMode);
        });
    }

    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // ==========================================
    // 3. CHATBOT INTERFACE (Gemini Grounded)
    // ==========================================
    const chatWindow = document.getElementById('chat-window');
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose  = document.getElementById('chat-close');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatEngineBadge = document.getElementById('chat-engine-badge');

    if (chatToggle && chatWindow && chatClose) {
        chatToggle.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
        chatClose.addEventListener('click', () => chatWindow.classList.add('hidden'));
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';
        updateProgress('chat');

        const typing = document.createElement('div');
        typing.className = 'msg bot typing';
        typing.textContent = 'AI is researching...';
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            typing.remove();
            
            if (data.reply) {
                addMessage(data.reply, 'bot');
                if (chatEngineBadge) {
                    chatEngineBadge.textContent = `Engine: ${data.engine === 'gemini-grounded' ? 'Gemini 1.5 Flash (Grounded)' : 'Civic NLP Engine'}`;
                }
            } else {
                addMessage("I'm having trouble connecting to my civic knowledge base. Please try again.", 'bot');
            }
        } catch (err) {
            typing.remove();
            addMessage("Network error. Please ensure you are online.", 'bot');
        }
    }

    function addMessage(text, type) {
        const msg = document.createElement('div');
        msg.className = `msg ${type}`;
        msg.textContent = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    if (chatSend) chatSend.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.textContent;
            sendMessage();
        });
    });

    // ==========================================
    // 4. ELIGIBILITY CHECKER
    // ==========================================
    const checkBtn = document.getElementById('check-btn');
    const checkResult = document.getElementById('check-result');

    if (checkBtn) {
        checkBtn.addEventListener('click', () => {
            const age = parseInt(document.getElementById('age-input').value);
            const citizen = document.getElementById('citizen-select').value;
            const history = document.getElementById('history-select').value;

            if (!age) {
                checkResult.textContent = "Please enter your age first.";
                checkResult.className = "result-panel warning";
                checkResult.classList.remove('hidden');
                return;
            }

            let msg = "";
            let type = "success";

            if (age < 18) {
                msg = "❌ You are not eligible yet. You must be 18 to vote. Keep learning!";
                type = "error";
            } else if (citizen === 'no') {
                msg = "❌ Voting in national elections requires citizenship. Check local resident rules.";
                type = "error";
            } else {
                msg = history === 'first' 
                    ? "✅ You are eligible! Please register via Form 6 on the Voter Portal immediately."
                    : "✅ You are eligible! Ensure your name is in the local electoral roll.";
                triggerConfetti();
                updateProgress('eligibility');
            }

            checkResult.textContent = msg;
            checkResult.className = `result-panel ${type}`;
            checkResult.classList.remove('hidden');
        });
    }

    // ==========================================
    // 5. MAP FINDER
    // ==========================================
    const mapBtn = document.getElementById('map-btn');
    const mapSearch = document.getElementById('map-search');
    const boothMap = document.getElementById('booth-map');
    const mapStatus = document.getElementById('map-status');

    if (mapBtn && mapSearch && boothMap) {
        mapBtn.addEventListener('click', () => {
            const val = mapSearch.value.trim();
            if (!val) {
                mapStatus.textContent = "Please enter a pincode or area.";
                return;
            }
            mapStatus.textContent = "Searching near " + val + "...";
            // Upgrade to dynamic search via Embed API
            boothMap.src = `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${encodeURIComponent(val)}+Polling+Booth+Election+Commission`;
            updateProgress('map');
        });
    }

    // ==========================================
    // 6. SIMULATION LAB
    // ==========================================
    const enableVoteBtn = document.getElementById('enable-vote-btn');
    const resetSimBtn = document.getElementById('reset-sim-btn');
    const evmStatus = document.getElementById('evm-status');
    const evmButtons = document.querySelectorAll('.evm-btn');
    const vvpatSlip = document.getElementById('vvpat-slip');
    const slipCand = document.getElementById('slip-cand');

    const tally = { A: 0, B: 0, C: 0, NOTA: 0 };

    if (enableVoteBtn) {
        enableVoteBtn.addEventListener('click', () => {
            evmStatus.textContent = "Ready to Vote";
            evmStatus.className = "evm-status green";
            evmButtons.forEach(b => b.disabled = false);
        });
    }

    evmButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cand = btn.getAttribute('data-cand');
            tally[cand]++;
            document.getElementById(`tally-${cand}`).textContent = tally[cand];

            // VVPAT Flow
            slipCand.textContent = cand;
            vvpatSlip.classList.remove('hidden');
            evmButtons.forEach(b => b.disabled = true);
            evmStatus.textContent = "Vote Recorded";
            evmStatus.className = "evm-status blue";

            setTimeout(() => {
                vvpatSlip.classList.add('hidden');
                evmStatus.textContent = "Wait for Officer...";
                evmStatus.className = "evm-status red";
                updateProgress('sim');
            }, 5000);
        });
    });

    if (resetSimBtn) {
        resetSimBtn.addEventListener('click', () => {
            Object.keys(tally).forEach(k => {
                tally[k] = 0;
                document.getElementById(`tally-${k}`).textContent = '0';
            });
            evmStatus.textContent = "Wait for Officer...";
            evmStatus.className = "evm-status red";
            evmButtons.forEach(b => b.disabled = true);
            vvpatSlip.classList.add('hidden');
        });
    }

    // ==========================================
    // 7. EMERGENCY & FAQ
    // ==========================================
    document.querySelectorAll('.emergency-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.getAttribute('data-type');
            const panel = document.getElementById('emergency-panel');
            let content = "";

            if (type === 'lost') content = "<h4>Lost Voter ID</h4><p>You can still vote! Bring any government photo ID (Passport, DL, Aadhaar) if your name is in the electoral roll.</p>";
            if (type === 'missing') content = "<h4>Name Missing</h4><p>Immediately contact the Booth Level Officer (BLO). If your name is truly missing, you cannot vote today but should register for the next cycle.</p>";
            if (type === 'queue') content = "<h4>Long Queue</h4><p>If you join the line before official closing time, you are legally entitled to cast your vote even after hours.</p>";
            if (type === 'a11y') content = "<h4>Need Ramp</h4><p>All polling stations must have ramps. Inform the presiding officer for priority access or assistance.</p>";

            panel.innerHTML = content;
            panel.classList.remove('hidden');
            updateProgress('emergency');
        });
    });

    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            item.classList.toggle('active');
        });
    });
});
