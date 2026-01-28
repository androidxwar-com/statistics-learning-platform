/**
 * FASE 4: Quiz Base
 * 
 * Quiz a 3 domande a risposta multipla con:
 * - 3 carte interattive (da bozza.txt)
 * - Feedback visivo (verde/rosso + shake)
 * - Recovery flow: se errore → modale "Rivedere teoria" o "Nuovo quiz"
 */

const Phase4BasicQuiz = (function () {
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let isProcessing = false;

    /**
     * Renderizza Fase 4
     */
    async function render() {
        const state = StateManager.getState();
        const conceptId = state.currentConceptId;
        const mode = state.currentMode;

        // NEW: Usa DataManager
        const questionsData = DataManager.getConceptQuestions(conceptId);

        // NEW: Validazione robusta
        if (!questionsData || !questionsData[mode + '_mode'] || !questionsData[mode + '_mode'].basic) {
            showError(`Domande non disponibili per questo concetto in modalità ${mode}.<br>Contatta l'amministratore o cambia modalità.`);
            // Fallback opzionale: prova a caricare l'altra modalità o usa domande generiche
            return;
        }

        currentQuestions = questionsData[mode + '_mode'].basic;
        // Se l'indice salvato è oltre il limite (es. cambio modalità con meno domande), resetta
        if (state.currentQuestionIndex >= currentQuestions.length) {
            state.currentQuestionIndex = 0;
            StateManager.saveState();
        }
        currentQuestionIndex = state.currentQuestionIndex;

        if (currentQuestions.length === 0) {
            showError('Lista domande vuota.');
            return;
        }

        const html = `
            <div class="phase-container phase4-container">
                <div class="phase-header">
                    <span class="phase-badge">FASE 4/5</span>
                    <h2>Quiz Base</h2>
                    <p class="phase-subtitle">
                        ${mode === 'home' ? '🏠 Modalità Casa - Usa carta e penna per i calcoli' : '🌍 Modalità Fuori Casa - Logica pura'}
                    </p>
                </div>

                <div class="quiz-progress">
                    Domanda ${currentQuestionIndex + 1} di ${currentQuestions.length}
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
     * Renderizza singola domanda con carte
     */
    function renderQuestion(questionData) {
        return `
            <div class="question-box" id="question-box">
                ${questionData.question}
            </div>

            <div class="cards-container">
                ${questionData.options.map((option, index) => `
                    <div class="card" id="card-${index}" onclick="window.Phase4BasicQuiz.checkAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Verifica risposta selezionata
     */
    function checkAnswer(selectedIndex) {
        if (isProcessing) return;
        isProcessing = true;

        const questionData = currentQuestions[currentQuestionIndex];
        const correctIndex = questionData.correctIndex;
        const cards = document.querySelectorAll('.card');
        const selectedCard = document.getElementById(`card-${selectedIndex}`);

        // Disabilita click su tutte le carte
        cards.forEach(card => card.style.pointerEvents = 'none');

        if (selectedIndex === correctIndex) {
            // ✅ RISPOSTA CORRETTA
            selectedCard.classList.add('correct');
            showFeedback('Ottimo lavoro! Risposta esatta! 🎉', 'success');

            // Attendi 2s e passa alla prossima domanda o avanza fase
            setTimeout(() => {
                if (StateManager.nextQuizQuestion()) {
                    // C'è altra domanda
                    currentQuestionIndex = StateManager.getState().currentQuestionIndex;
                    render();
                } else {
                    // Quiz completato, avanza a Fase 5
                    console.log('✅ Quiz base completato!');
                    StateManager.advancePhase();

                    // Usa PhaseManager se disponibile per renderizzare fase successiva
                    if (window.PhaseManager) {
                        PhaseManager.renderPhase(5);
                    } else {
                        AppController.renderCurrentPhase();
                    }
                }
            }, 2000);

        } else {
            // ❌ RISPOSTA ERRATA
            selectedCard.classList.add('wrong');
            showFeedback('Non è corretto. Rifletti ancora! 🤔', 'error');

            // Registra tentativo errato
            StateManager.recordIncorrectAttempt(
                StateManager.getState().currentConceptId,
                questionData.id
            );

            // Dopo 1.5s mostra modale recovery
            setTimeout(() => {
                showRecoveryModal(questionData);
            }, 1500);
        }
    }

    /**
     * Mostra modale di recupero dopo errore
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
                        <button class="btn-secondary" onclick="window.Phase4BasicQuiz.reviewTheory()">
                            📚 Rivedere la Teoria
                        </button>
                        <button class="btn-primary" onclick="window.Phase4BasicQuiz.tryNewQuiz()">
                            🔄 Provare Nuovo Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modal);
    }

    /**
     * Recovery: Torna alla teoria (Fase 1)
     */
    function reviewTheory() {
        closeModal();
        console.log('📚 Utente sceglie di rivedere la teoria');

        StateManager.resetToPhase1();
        if (window.PhaseManager) {
            const conceptId = StateManager.getState().currentConceptId;
            const data = DataManager.getConceptTheory(conceptId);
            PhaseManager.renderPhase(1, data);
        } else {
            AppController.renderCurrentPhase();
        }
    }

    /**
     * Recovery: Genera nuovo quiz (via Groq o carica altro dal database)
     */
    async function tryNewQuiz() {
        closeModal();
        console.log('🔄 Generazione nuovo quiz...');

        const state = StateManager.getState();
        const feedbackEl = document.getElementById('feedback-message');
        if (feedbackEl) feedbackEl.textContent = 'Generazione domanda alternativa...';

        // Opzione 1: Chiama Groq per generare nuova domanda
        const newQuestion = await GroqAPIClient.generateQuizQuestion(
            state.currentConceptId,
            state.currentMode,
            'basic' // Livello
        );

        if (newQuestion) {
            // Sostituisci domanda corrente con quella generata
            currentQuestions[currentQuestionIndex] = newQuestion;
            render();
            showFeedback('Domanda rigenerata! Riprova.', 'info');
        } else {
            // Fallback: semplicemente ricarica domanda diversa dal database
            // (In produzione, potresti shufflare o prendere da pool più ampio)
            showFeedback('⚠️ Generazione fallita. Riprova la stessa domanda.', 'warning');
            render();
        }
    }

    /**
     * Chiudi modale
     */
    function closeModal() {
        const modal = document.getElementById('recovery-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Mostra messaggio feedback
     */
    function showFeedback(message, type) {
        const feedbackEl = document.getElementById('feedback-message');
        if (feedbackEl) {
            feedbackEl.textContent = message;
            feedbackEl.className = `feedback-message ${type}`;
            feedbackEl.style.display = 'block';
        }
    }

    /**
     * Mostra errore generico
     */
    function showError(message) {
        document.getElementById('app-content').innerHTML = `
            <div class="error-box">
                <h3>⚠️ Errore Quiz</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Ricarica Applicazione</button>
            </div>
        `;
    }

    // Public API
    return {
        render,
        checkAnswer,
        reviewTheory,
        tryNewQuiz
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase4BasicQuiz;
}

// Expose to window for inline onclick handlers
window.Phase4BasicQuiz = Phase4BasicQuiz;
