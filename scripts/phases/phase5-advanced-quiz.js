/**
 * FASE 5: Quiz Avanzato (Simulazione Esame)
 * 
 * Quiz avanzato con domande complesse:
 * - Stesso meccanismo di Fase 4 (3 carte)
 * - Domande livello "advanced" dal database
 * - Al completamento → Passa al prossimo concetto
 */

const Phase5AdvancedQuiz = (function () {
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let isProcessing = false;

    async function render() {
        const state = StateManager.getState();
        const conceptId = state.currentConceptId;
        const mode = state.currentMode;

        // NEW: DataManager Link
        const questionsData = DataManager.getConceptQuestions(conceptId);

        // NEW: Logica ibrida (Statico + AI Fallback)
        let questions = [];
        if (questionsData && questionsData[mode + '_mode'] && questionsData[mode + '_mode'].advanced) {
            questions = questionsData[mode + '_mode'].advanced;
        }

        // Se non ci sono domande statiche, prova a generarle con IA
        if (questions.length === 0) {
            console.log('⚠️ Nessuna domanda statica avanzata trovata. Avvio Generazione IA...');

            // Mostra Loader
            document.getElementById('app-content').innerHTML = `
                <div class="phase-container phase5-container" style="text-align:center; padding-top: 50px;">
                    <h2>🎓 Generazione Esame IA...</h2>
                    <p>Sto analizzando l'argomento <b>${conceptId}</b> per creare quesiti complessi.</p>
                    <div class="loader" style="margin: 20px auto; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4a90e2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                </div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
            `;

            // ADAPTIVE DIFFICULTY (Professional Tier)
            let difficulty = 'advanced';
            let mastery = 0;

            if (typeof UserProfile !== 'undefined') {
                const userState = UserProfile.getState();
                mastery = userState.concepts[conceptId]?.mastery || 0;

                // Se mastery è bassa (< 40), proponi domande semplici per rinforzo
                if (mastery < 40) difficulty = 'basic';
                console.log(`🧠 Adaptive Difficulty: Mastery ${mastery}% -> ${difficulty.toUpperCase()}`);
            }

            // Genera 3 domande
            for (let i = 0; i < 3; i++) {
                const q = await GroqAPIClient.generateQuizQuestion(conceptId, mode, difficulty);
                if (q) questions.push(q);
            }
            // Store difficulty for UI
            state.currentDifficulty = difficulty;
        }

        // Se ancóra vuoto, allora errore reale
        if (questions.length === 0) {
            showError(`Impossibile generare domande avanzate per questo argomento (${conceptId}).`);
            return;
        }

        currentQuestions = questions;

        // Fix index overflow
        if (state.currentQuestionIndex >= currentQuestions.length) {
            state.currentQuestionIndex = 0;
        }
        currentQuestionIndex = state.currentQuestionIndex;

        const html = `
            <div class="phase-container phase5-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-advanced">FASE 5/5</span>
                    <h2>🎓 Quiz Avanzato - Simulazione Esame</h2>
                    <p class="phase-subtitle">
                        ${mode === 'home' ? '🏠 Modalità Casa - Calcoli complessi' : '🌍 Modalità Fuori Casa - Ragionamento critico'}
                    </p>
                </div>

                <div class="quiz-progress">
                    Domanda ${currentQuestionIndex + 1} di ${currentQuestions.length}
                    <span class="difficulty-badge" style="background-color: ${state.currentDifficulty === 'basic' ? '#17a2b8' : '#dc3545'}">
                        Livello: ${state.currentDifficulty ? state.currentDifficulty.toUpperCase() : 'AVANZATO'}
                    </span>
                </div>

                <div id="quiz-content">
                    ${renderQuestion(currentQuestions[currentQuestionIndex])}
                </div>

                <div id="feedback-message" class="feedback-message"></div>
            </div>
        `;

        document.getElementById('app-content').innerHTML = html;
        isProcessing = false;
    }

    function renderQuestion(questionData) {
        return `
            <div class="question-box advanced-question" id="question-box">
                ${questionData.question}
            </div>

            <div class="cards-container">
                ${questionData.options.map((option, index) => `
                    <div class="card card-advanced" id="card-${index}" onclick="window.Phase5AdvancedQuiz.checkAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function checkAnswer(selectedIndex) {
        if (isProcessing) return;
        isProcessing = true;

        const questionData = currentQuestions[currentQuestionIndex];
        const correctIndex = questionData.correctIndex;
        const cards = document.querySelectorAll('.card');
        const selectedCard = document.getElementById(`card-${selectedIndex}`);

        cards.forEach(card => card.style.pointerEvents = 'none');

        // Tracking & XP (Professional Tier)
        const difficultyLevel = StateManager.getState().currentDifficulty === 'basic' ? 1 : 2;
        let xpGained = 0;
        if (typeof UserProfile !== 'undefined') {
            const result = UserProfile.trackQuizResult(StateManager.getState().currentConceptId, selectedIndex === correctIndex, difficultyLevel);
            xpGained = result ? result.xpGained : 0;
        }

        if (selectedIndex === correctIndex) {
            // ✅ CORRETTO
            selectedCard.classList.add('correct');
            showFeedback(`Eccellente! Risposta corretta! (+${xpGained} XP) 🎉`, 'success');

            setTimeout(() => {
                if (StateManager.nextQuizQuestion()) {
                    currentQuestionIndex = StateManager.getState().currentQuestionIndex;
                    render();
                } else {
                    completeConcept();
                }
            }, 2000);

        } else {
            // ❌ ERRATO
            selectedCard.classList.add('wrong');
            showFeedback('Risposta errata. Analizza bene! 🤔', 'error');

            StateManager.recordIncorrectAttempt(
                StateManager.getState().currentConceptId,
                questionData.id
            );

            setTimeout(() => {
                showRecoveryModal(questionData);
            }, 1500);
        }
    }

    function completeConcept() {
        StateManager.completeCurrentConcept();
        showCompletionScreen();
    }

    function showCompletionScreen() {
        const html = `
            <div class="completion-screen">
                <div class="completion-content">
                    <h1>🎉 Concetto Completato! 🎉</h1>
                    <p>Hai superato tutte e 5 le fasi con successo.</p>
                    <p class="completion-subtitle">Sei ora pronto per il prossimo concetto!</p>
                    
                    <div class="completion-actions">
                        <button class="btn-primary btn-large" onclick="window.Phase5AdvancedQuiz.loadNextConcept()">
                            ➡️ Prossimo Concetto
                        </button>
                        <button class="btn-secondary" onclick="StateManager.resetProgress()">
                            🔄 Ricomincia da Zero
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('app-content').innerHTML = html;
    }

    async function loadNextConcept() {
        // Logica semplice per demo: torna al primo concetto o trova il successivo
        showFeedback('Caricamento prossimo concetto...', 'info');

        // Qui si dovrebbe usare DataManager per trovare il prossimo ID nella lista
        // Per ora resetta alla home page o primo concetto
        // TODO: Implementare DataManager.getNextConceptId()

        StateManager.setCurrentConcept('variabili-casuali-discrete', 'vcd-definizione', 'vcd-funzione-massa');
        if (window.PhaseManager) {
            // Reset a fase 1 del nuovo concetto
            const conceptId = 'vcd-funzione-massa';
            const data = DataManager.getConceptTheory(conceptId);
            PhaseManager.renderPhase(1, data);
        } else {
            location.reload();
        }
    }

    function showRecoveryModal(questionData) {
        const modal = `
            <div class="modal-overlay" id="recovery-modal">
                <div class="modal-content">
                    <h3>❌ Risposta Errata</h3>
                    <p><strong>Spiegazione:</strong> ${questionData.explanation}</p>
                    
                    <div class="modal-question">
                        <p>Cosa preferisci fare?</p>
                    </div>

                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="window.Phase5AdvancedQuiz.reviewTheory()">
                            📚 Rivedere la Teoria
                        </button>
                        <button class="btn-primary" onclick="window.Phase5AdvancedQuiz.tryNewQuiz()">
                            🔄 Provare Nuovo Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    function reviewTheory() {
        closeModal();
        StateManager.resetToPhase1();
        if (window.PhaseManager) {
            const conceptId = StateManager.getState().currentConceptId;
            const data = DataManager.getConceptTheory(conceptId);
            PhaseManager.renderPhase(1, data);
        } else {
            location.reload();
        }
    }

    async function tryNewQuiz() {
        closeModal();
        const state = StateManager.getState();
        const newQuestion = await GroqAPIClient.generateQuizQuestion(
            state.currentConceptId,
            state.currentMode,
            'advanced'
        );

        if (newQuestion) {
            currentQuestions[currentQuestionIndex] = newQuestion;
            render();
        } else {
            showFeedback('⚠️ Generazione fallita. Riprova.', 'warning');
            render();
        }
    }

    function closeModal() {
        const modal = document.getElementById('recovery-modal');
        if (modal) modal.remove();
    }

    function showFeedback(message, type) {
        const feedbackEl = document.getElementById('feedback-message');
        if (feedbackEl) {
            feedbackEl.textContent = message;
            feedbackEl.className = `feedback-message ${type}`;
            feedbackEl.style.display = 'block';
        }
    }

    function showError(message) {
        document.getElementById('app-content').innerHTML = `
            <div class="error-box">
                <h3>⚠️ Errore</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Ricarica App</button>
            </div>
        `;
    }

    return {
        render,
        checkAnswer,
        reviewTheory,
        tryNewQuiz,
        loadNextConcept
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase5AdvancedQuiz;
}

// Expose to window for inline onclick handlers
window.Phase5AdvancedQuiz = Phase5AdvancedQuiz;
