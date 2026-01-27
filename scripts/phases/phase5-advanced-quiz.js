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

    /**
     * Renderizza Fase 5
     */
    async function render() {
        const state = StateManager.getState();
        const conceptId = state.currentConceptId;
        const mode = state.currentMode;

        // Carica domande AVANZATE
        const questionsData = await DataLoader.loadQuestions(conceptId);
        currentQuestions = questionsData[mode + '_mode'].advanced;
        currentQuestionIndex = state.currentQuestionIndex;

        if (!currentQuestions || currentQuestions.length === 0) {
            showError('Nessuna domanda avanzata disponibile');
            return;
        }

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
                    <span class="difficulty-badge">Livello: AVANZATO</span>
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

    /**
     * Renderizza domanda (uguale a Fase 4)
     */
    function renderQuestion(questionData) {
        return `
            <div class="question-box advanced-question" id="question-box">
                ${questionData.question}
            </div>

            <div class="cards-container">
                ${questionData.options.map((option, index) => `
                    <div class="card card-advanced" id="card-${index}" onclick="Phase5AdvancedQuiz.checkAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Verifica risposta
     */
    function checkAnswer(selectedIndex) {
        if (isProcessing) return;
        isProcessing = true;

        const questionData = currentQuestions[currentQuestionIndex];
        const correctIndex = questionData.correctIndex;
        const cards = document.querySelectorAll('.card');
        const selectedCard = document.getElementById(`card-${selectedIndex}`);

        cards.forEach(card => card.style.pointerEvents = 'none');

        if (selectedIndex === correctIndex) {
            // ✅ RISPOSTA CORRETTA
            selectedCard.classList.add('correct');
            showFeedback('Eccellente! Risposta corretta! 🎉', 'success');

            setTimeout(() => {
                if (StateManager.nextQuizQuestion()) {
                    // Prossima domanda
                    currentQuestionIndex = StateManager.getState().currentQuestionIndex;
                    render();
                } else {
                    // QUIZ COMPLETATO → Concetto terminato
                    completeConcept();
                }
            }, 2000);

        } else {
            // ❌ RISPOSTA ERRATA
            selectedCard.classList.add('wrong');
            showFeedback('Risposta errata.  Analizza bene! 🤔', 'error');

            StateManager.recordIncorrectAttempt(
                StateManager.getState().currentConceptId,
                questionData.id
            );

            setTimeout(() => {
                showRecoveryModal(questionData);
            }, 1500);
        }
    }

    /**
     * Concetto completato → Passa al successivo
     */
    function completeConcept() {
        const state = StateManager.getState();

        StateManager.completeCurrentConcept();

        // Mostra schermata celebrativa
        showCompletionScreen();
    }

    /**
     * Schermata di completamento
     */
    function showCompletionScreen() {
        const html = `
            <div class="completion-screen">
                <div class="completion-content">
                    <h1>🎉 Concetto Completato! 🎉</h1>
                    <p>Hai superato tutte e 5 le fasi con successo.</p>
                    <p class="completion-subtitle">Sei ora pronto per il prossimo concetto!</p>
                    
                    <div class="completion-actions">
                        <button class="btn-primary btn-large" onclick="Phase5AdvancedQuiz.loadNextConcept()">
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

    /**
     * Carica prossimo concetto
     */
    async function loadNextConcept() {
        // In un'implementazione completa, caricheremmo il prossimo dalla struttura
        // Per ora, torna al primo concetto (loop demo)
        const state = StateManager.getState();

        showFeedback('Caricamento prossimo concetto...', 'info');

        // Placeholder: ricarica primo concetto
        StateManager.setCurrentConcept(
            'variabili-casuali-discrete',
            'vcd-definizione',
            'vcd-funzione-massa' // Passa al secondo concetto
        );

        AppController.renderCurrentPhase();
    }

    /**
     * Modale recovery (stessa di Fase 4)
     */
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
                        <button class="btn-secondary" onclick="Phase5AdvancedQuiz.reviewTheory()">
                            📚 Rivedere la Teoria
                        </button>
                        <button class="btn-primary" onclick="Phase5AdvancedQuiz.tryNewQuiz()">
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
        AppController.renderCurrentPhase();
    }

    async function tryNewQuiz() {
        closeModal();

        const state = StateManager.getState();
        const newQuestion = await GroqAPIClient.generateQuizQuestion(
            state.currentConceptId,
            state.currentMode,
            'advanced' // Livello avanzato
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
                <button class="btn-primary" onclick="AppController.init()">Torna all'inizio</button>
            </div>
        `;
    }

    // Public API
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
