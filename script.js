/**
 * VoteGuide AI - Core Application Logic
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
    
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        if (localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }

    // Accessibility Toggle
    const a11yBtn = document.getElementById('a11y-toggle');
    if (a11yBtn) {
        if (state.a11yMode) body.classList.add('a11y-mode');
        a11yBtn.addEventListener('click', () => {
            body.classList.toggle('a11y-mode');
            state.a11yMode = body.classList.contains('a11y-mode');
            localStorage.setItem('a11y', state.a11yMode);
        });
    }

    // Mobile Navbar
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
    }

    // ==========================================
    // 3. CHATBOT INTERFACE
    // ==========================================
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const closeChat = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');

    // Toggle Chat
    if (chatToggle && chatWidget && closeChat) {
        chatToggle.addEventListener('click', () => {
            chatWidget.classList.toggle('hidden');
            if (!chatWidget.classList.contains('hidden')) {
                chatInput.focus();
            }
        });
        closeChat.addEventListener('click', () => chatWidget.classList.add('hidden'));
    }

    // Quick Chips Logic
    const chatChips = document.querySelectorAll('.chat-chip');
    chatChips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = chip.textContent;
                handleChatSubmit();
            }
        });
    });

    // Append Message UI
    function appendMessage(text, sender, id = null) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        if (id) div.id = id;
        chatBody.appendChild(div);
        scrollToBottom();
    }

    function scrollToBottom() {
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
            const msg = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            msg.voice = voices.find(v => v.lang.includes('en')) || null;
            window.speechSynthesis.speak(msg);
        }
    }

    // Backend Chat Integration
    async function fetchChatResponse(prompt) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt })
            });
            const data = await response.json();
            if (response.ok && data.reply) {
                return data.reply;
            } else {
                return "Sorry, I couldn't process that right now.";
            }
        } catch (error) {
            console.error("Backend Chat Error:", error);
            return "Sorry, I am facing network issues connecting to my AI brain. Please check the FAQs.";
        }
    }

    async function handleChatSubmit() {
        const text = chatInput.value.trim();
        const emptyState = document.getElementById('chat-empty-state');
        if (!text) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        if (emptyState) emptyState.classList.add('hidden');

        appendMessage(text, 'user');
        chatInput.value = '';
        updateProgress('chat_used');

        appendMessage("Typing...", 'bot', 'typing-indicator');

        const reply = await fetchChatResponse(text);
        
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        appendMessage(reply, 'bot');
        speakText(reply);
    }

    if (sendBtn) sendBtn.addEventListener('click', handleChatSubmit);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSubmit();
        });
    }

    if (voiceBtn && 'webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        
        voiceBtn.addEventListener('click', () => {
            recognition.start();
            voiceBtn.textContent = '🔴';
        });
        
        recognition.onresult = (event) => {
            chatInput.value = event.results[0][0].transcript;
            handleChatSubmit();
            voiceBtn.textContent = '🎤';
        };
        recognition.onerror = () => voiceBtn.textContent = '🎤';
        recognition.onend = () => voiceBtn.textContent = '🎤';
    }

    // ==========================================
    // 4. ELIGIBILITY CHECKER
    // ==========================================
    const eligibilityForm = document.getElementById('eligibility-form');
    const resultBox = document.getElementById('eligibility-result');

    if (eligibilityForm && resultBox) {
        eligibilityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ageInput = document.getElementById('age').value;
            const emptyState = document.getElementById('eligibility-empty-state');
            if (!ageInput) {
                if (emptyState) emptyState.classList.remove('hidden');
                resultBox.classList.add('hidden');
                return;
            }
            if (emptyState) emptyState.classList.add('hidden');
            const age = parseInt(ageInput);
            const citizen = document.getElementById('citizen').value;
            const history = document.getElementById('history').value;

            resultBox.classList.remove('hidden', 'success-msg', 'error-msg');
            updateProgress('eligibility_checked');

            if (age < 18) {
                resultBox.classList.add('error-msg');
                resultBox.innerHTML = `<strong>Not Eligible:</strong> You must be at least 18 years old. Wait a bit longer!`;
            } else if (citizen !== 'yes') {
                resultBox.classList.add('error-msg');
                resultBox.innerHTML = `<strong>Not Eligible:</strong> Only citizens can vote in national elections.`;
            } else if (history === 'no') {
                resultBox.classList.add('success-msg');
                resultBox.innerHTML = `<strong>Eligible!</strong> Since you are a first-time voter, you need to Register first. Head to the Official Portal.`;
                triggerConfetti();
            } else {
                resultBox.classList.add('success-msg');
                resultBox.innerHTML = `<strong>Eligible!</strong> You are good to go. Make sure to check your name on the voter list before polling day.`;
                triggerConfetti();
            }
        });
    }

    // ==========================================
    // 5. PROCESS CARDS & FAQ ACCORDION
    // ==========================================
    const processCards = document.querySelectorAll('.process-card');
    processCards.forEach((card, index) => {
        const toggleCard = () => {
            card.classList.toggle('active');
            updateProgress(`card_${index}`);
        };
        card.addEventListener('click', toggleCard);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard();
            }
        });
    });

    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if(btn) {
            btn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => {
                    i.classList.remove('active');
                    const qBtn = i.querySelector('.faq-question');
                    if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
                });
                if (!isActive) {
                    item.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // ==========================================
    // 6. CIVIC QUIZ
    // ==========================================
    const quizForm = document.getElementById('quiz-form');
    const quizResult = document.getElementById('quiz-result');
    if (quizForm && quizResult) {
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let score = 0;
            const q1 = document.querySelector('input[name="q1"]:checked');
            const q2 = document.querySelector('input[name="q2"]:checked');
            if (q1 && q1.value === "18") score++;
            if (q2 && q2.value === "nota") score++;

            quizResult.classList.remove('hidden');
            if (score === 2) {
                quizResult.innerHTML = `Score: 2/2. Excellent! You are fully informed.`;
                quizResult.className = 'success-msg';
            } else {
                quizResult.innerHTML = `Score: ${score}/2. Read through the process guide again!`;
                quizResult.className = 'error-msg';
            }
            updateProgress('quiz_completed');
        });
    }

    // ==========================================
    // 7. ELECTION REMINDER (.ICS DOWNLOAD)
    // ==========================================
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

    // ==========================================
    // 8. SMART POLLING BOOTH SEARCH
    // ==========================================
    const pincodeBtn = document.getElementById('pincode-btn');
    const pincodeInput = document.getElementById('pincode-input');
    const mapIframe = document.getElementById('map-iframe');
    
    if (pincodeBtn && pincodeInput && mapIframe) {
        const executeSearch = () => {
            const val = pincodeInput.value.trim();
            const status = document.getElementById('map-status');
            if (!val) {
                if (status) {
                    status.textContent = "“Enter pincode or location.”";
                    status.classList.remove('hidden');
                }
                return;
            }
            if (status) {
                status.textContent = "Loading map...";
                status.classList.remove('hidden');
            }
            setTimeout(() => {
                mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(val)}+Polling+Booth&t=&z=14&ie=UTF8&output=embed`;
                if (status) status.classList.add('hidden');
            }, 800);
        };
        pincodeBtn.addEventListener('click', executeSearch);
        pincodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeSearch();
        });
    }

    // ==========================================
    // 9. AI DEBATE SIMULATOR
    // ==========================================
    const debateData = {
        'online': {
            pro: 'Increases accessibility, convenience, and potentially massive turnout for younger voters.',
            neutral: 'A digital transition requires balancing extreme convenience against absolute security necessities.',
            con: 'High risk of cyber manipulation, deep state hacking, and loss of secret ballot integrity.'
        },
        'compulsory': {
            pro: 'Ensures the elected government truly reflects the will of the entire population.',
            neutral: 'Raises the question of whether voting is a strict civic duty or a democratic choice.',
            con: 'Forces disengaged or grossly uninformed citizens to vote, potentially leading to random elections.'
        },
        'youth': {
            pro: 'Engages the next generation in policies that will directly affect their entire future trajectory.',
            neutral: 'Youth are passionate but may lack historical perspective; integrating them requires intensive civic education.',
            con: 'Younger demographics can be too easily swayed by viral social media trends or influencers.'
        },
        'nota': {
            pro: 'Provides a powerful democratic megaphone to express systemic dissatisfaction without boycotting.',
            neutral: 'Primarily a symbolic gesture in many systems, unless NOTA majorities trigger mandatory re-elections.',
            con: 'Can dilute valid votes, potentially allowing less popular candidates to win through fractured polling.'
        }
    };

    const debateBtns = document.querySelectorAll('.debate-btn');
    const proText = document.getElementById('debate-pro');
    const neutralText = document.getElementById('debate-neutral');
    const conText = document.getElementById('debate-con');

    if(debateBtns.length > 0) {
        debateBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                debateBtns.forEach(b => {
                    b.classList.remove('primary-btn');
                    b.classList.add('secondary-btn');
                });
                btn.classList.add('primary-btn');
                btn.classList.remove('secondary-btn');

                const topic = btn.getAttribute('data-topic');
                if(debateData[topic]) {
                    proText.textContent = debateData[topic].pro;
                    neutralText.textContent = debateData[topic].neutral;
                    conText.textContent = debateData[topic].con;
                }
            });
        });
    }

    // ==========================================
    // 10. ELECTION EMERGENCY ASSISTANT
    // ==========================================
    const emergencyData = {
        'lost-id': { title: 'Lost Voter ID (EPIC)?', solution: 'Don\'t panic! You can still vote. Bring any state-approved alternative ID: Aadhar Card, Driver\'s License, Passport, or PAN Card.' },
        'missing-name': { title: 'Name Missing from List?', solution: 'Check with the Booth Level Officer (BLO). If you have an EPIC but your name is missing due to a clerical delete, standardly you cannot vote today. File a dispute form for the next cycle.' },
        'no-booth': { title: 'Can\'t Find Your Booth?', solution: 'Use our Smart Pincode tool above, or SMS "EPIC <Your Voter ID Number>" to the Election Commission hotline (1950) to instantly get your booth address.' },
        'queue': { title: 'Long Queues?', solution: 'If you join the queue before the official closing time (usually 6 PM), the officers are legally required to let you vote, regardless of how late it gets. Stay in line!' },
        'panic': { title: 'First-Time Panic?', solution: 'Take a deep breath! Approach the first officer, show your ID, and they will direct you step-by-step. Nobody is judging you.' },
        'a11y': { title: 'Require Accessibility Support?', solution: 'By law, all polling booths must have wheelchair ramps. Look for the Presiding Officer to request priority access or companion assistance.' }
    };

    const emergencyBtns = document.querySelectorAll('.emergency-btn');
    const emergencyResult = document.getElementById('emergency-result');
    const emergencyTitle = document.getElementById('emergency-title');
    const emergencyDesc = document.getElementById('emergency-desc');

    if (emergencyBtns.length > 0 && emergencyResult) {
        emergencyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                if(emergencyData[type]) {
                    emergencyTitle.textContent = emergencyData[type].title;
                    emergencyDesc.textContent = emergencyData[type].solution;
                    emergencyResult.classList.remove('hidden');
                    emergencyResult.style.display = 'block';
                }
            });
        });
    }

    // Set Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // ==========================================
    // 11. DEMO MODE & CHECKLIST
    // ==========================================
    const demoBtn = document.getElementById('demo-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            demoBtn.textContent = '🚀 Running Demo...';
            demoBtn.disabled = true;
            
            document.getElementById('eligibility').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                document.getElementById('age').value = '21';
                document.getElementById('citizen').value = 'yes';
                document.getElementById('history').value = 'no';
                if (eligibilityForm) eligibilityForm.dispatchEvent(new Event('submit', { cancelable: true }));
            }, 1500);

            setTimeout(() => {
                if (chatToggle) chatToggle.click();
                if (chatInput) chatInput.value = 'What is NOTA?';
            }, 3500);
            setTimeout(() => { if (sendBtn) sendBtn.click(); }, 5000);

            setTimeout(() => {
                if (closeChat) closeChat.click();
                document.getElementById('pincode-input').value = '700001';
                if (pincodeBtn) pincodeBtn.click();
            }, 9000);

            setTimeout(() => {
                document.getElementById('quick-links').scrollIntoView({ behavior: 'smooth' });
                demoBtn.textContent = '🚀 Try Demo';
                demoBtn.disabled = false;
            }, 12000);
        });
    }

    const checklistBtn = document.getElementById('checklist-btn');
    if (checklistBtn) {
        checklistBtn.addEventListener('click', () => {
            checklistBtn.textContent = 'Preparing...';
            setTimeout(() => {
                const text = "🗳️ VOTEGUIDE AI - OFFICIAL VOTER CHECKLIST 🗳️\n\n1. ✅ Carry Valid ID (Voter ID, Passport, or DL)\n2. ✅ Verify Booth Location in Advance\n3. ✅ Reach Early to Avoid Long Queues\n4. ✅ Follow Polling Booth Queue Rules\n5. ✅ Cast Your Secret Vote\n6. ✅ Help Others Responsibly\n\nDemocracy works when you participate!";
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Voter_Checklist.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                checklistBtn.textContent = '📄 Download Checklist';
            }, 800);
        });
    }

    // ==========================================
    // 12. METRICS ANIMATION & KEYBOARD SHORTCUTS
    // ==========================================
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    let current = 0;
                    const increment = target / 40;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            counter.textContent = target.toLocaleString() + "+";
                            clearInterval(timer);
                        } else {
                            counter.textContent = Math.ceil(current).toLocaleString();
                        }
                    }, 30);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => observer.observe(counter));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatWidget && !chatWidget.classList.contains('hidden')) {
            closeChat.click();
        }
        if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (chatWidget && chatWidget.classList.contains('hidden')) chatToggle.click();
            else if (chatInput) chatInput.focus();
        }
    });

    // ==========================================
    // 13. ELECTION SIMULATION LAB
    // ==========================================
    const simState = {
        voteEnabled: false,
        voted: false,
        tally: { 'Candidate A': 0, 'Candidate B': 0, 'Candidate C': 0, 'NOTA': 0 },
        vvpatTimer: null
    };

    const enableVoteBtn  = document.getElementById('enable-vote-btn');
    const controlStatus  = document.getElementById('control-status');
    const candidateBtns  = document.querySelectorAll('.sim-candidate-btn');
    const vvpatSlip      = document.getElementById('vvpat-slip');
    const vvpatText      = document.getElementById('vvpat-candidate-text');
    const vvpatTimerEl   = document.getElementById('vvpat-timer');
    const vvpatIdle      = document.getElementById('vvpat-idle-text');
    const simResetBtn    = document.getElementById('sim-reset-btn');
    const tallyTotal     = document.getElementById('tally-total');

    const tallyMap = {
        'Candidate A': document.getElementById('tally-a'),
        'Candidate B': document.getElementById('tally-b'),
        'Candidate C': document.getElementById('tally-c'),
        'NOTA':        document.getElementById('tally-nota')
    };

    function simBumpCount(el) {
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 250);
    }

    function simEnableVoting() {
        if (simState.voted) return; // already voted this round, wait for reset
        simState.voteEnabled = true;
        enableVoteBtn.disabled = true;
        enableVoteBtn.textContent = '✅ Vote Enabled';
        controlStatus.textContent = '🟢 Voting Enabled';
        controlStatus.classList.replace('sim-status--idle', 'sim-status--active');
        candidateBtns.forEach(btn => btn.disabled = false);
    }

    function simCastVote(candidate) {
        if (!simState.voteEnabled || simState.voted) return;
        simState.voted = true;

        // Highlight selected button
        candidateBtns.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('selected');
            if (btn.dataset.candidate === candidate) btn.classList.add('selected');
        });

        // Show VVPAT
        vvpatText.innerHTML = `You voted for: <strong>${candidate}</strong>`;
        vvpatIdle.classList.add('hidden');
        vvpatSlip.classList.remove('hidden');

        // Countdown
        let seconds = 3;
        vvpatTimerEl.textContent = seconds;
        clearInterval(simState.vvpatTimer);
        simState.vvpatTimer = setInterval(() => {
            seconds--;
            if (vvpatTimerEl) vvpatTimerEl.textContent = seconds;
            if (seconds <= 0) {
                clearInterval(simState.vvpatTimer);
                vvpatSlip.classList.add('hidden');
                vvpatIdle.classList.remove('hidden');
                vvpatIdle.textContent = '✅ Vote sealed in EVM.';
                vvpatIdle.style.background = '#d1fae5';
                vvpatIdle.style.color = '#065f46';
            }
        }, 1000);

        // Update tally
        simState.tally[candidate]++;
        const el = tallyMap[candidate];
        if (el) {
            el.textContent = simState.tally[candidate];
            simBumpCount(el);
        }
        const total = Object.values(simState.tally).reduce((a, b) => a + b, 0);
        if (tallyTotal) tallyTotal.textContent = total;

        // Lock Control Unit button label
        controlStatus.textContent = '🔴 Vote Cast — Awaiting Reset';
        controlStatus.classList.replace('sim-status--active', 'sim-status--idle');
    }

    function simReset() {
        simState.voteEnabled = false;
        simState.voted = false;
        clearInterval(simState.vvpatTimer);

        enableVoteBtn.disabled = false;
        enableVoteBtn.textContent = 'Enable Vote';
        controlStatus.textContent = '🔴 Voting Disabled';
        controlStatus.classList.replace('sim-status--active', 'sim-status--idle');

        candidateBtns.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('selected');
        });

        vvpatSlip.classList.add('hidden');
        vvpatIdle.classList.remove('hidden');
        vvpatIdle.textContent = 'Awaiting vote…';
        vvpatIdle.style.background = '';
        vvpatIdle.style.color = '';
    }

    if (enableVoteBtn)  enableVoteBtn.addEventListener('click', simEnableVoting);
    if (simResetBtn)    simResetBtn.addEventListener('click', simReset);
    candidateBtns.forEach(btn => {
        btn.addEventListener('click', () => simCastVote(btn.dataset.candidate));
    });

});
