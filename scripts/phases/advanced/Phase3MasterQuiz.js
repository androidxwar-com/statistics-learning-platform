/**
 * FASE 3 ADVANCED: Simulazione Esame Magistrale
 * 
 * Obiettivo: Testare la comprensione profonda con quesiti complessi.
 * Logica:
 * 1. Genera 1 domanda "Cattiva" (Difficoltà alta).
 * 2. 3 Opzioni (A, B, C) molto simili tra loro (distrattori forti).
 * 3. Feedback immediato e dettagliato.
 */

const Phase3MasterQuiz = (function () {
    let currentData = null;
    let currentQuiz = null;

    async function render(conceptData) {
        currentData = conceptData; // Può essere null se veniamo da phase change
        const container = document.getElementById('app-content');

        container.innerHTML = `
            <div class="phase-container phase3-adv-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-advanced">FASE 3/3: ESAME MAGISTRALE</span>
                    <h2>Verifica Competenza</h2>
                    <div class="loader-container">
                        <div class="loader"></div>
                        <p>Generazione quesito d'esame...</p>
                    </div>
                </div>
            </div>
        `;

        try {
            // Recupera concetto corrente dallo stato se conceptData è nullo
            const state = StateManager.getState();
            // Nota: in PhaseManager passiamo conceptData, ma per sicurezza recuperiamo context completo
            // Per il quiz serve il topic per generare la domanda
            const fullContext = DataManager.getConceptMetadata(state.currentConceptId);

            // Genera Quiz Esame
            const quizJSON = await GroqAPIClient.generateMasterQuiz(fullContext);
            currentQuiz = typeof quizJSON === 'string' ? JSON.parse(quizJSON) : quizJSON;

            renderQuiz(container);

        } catch (error) {
            console.error("Errore Phase3Advanced:", error);
            container.innerHTML = `<div class="error-box">Errore generazione esame: ${error.message} <button onclick="location.reload()">Riprova</button></div>`;
        }
    }

    function renderQuiz(container) {
        if (!currentQuiz) return;

        const optionsHTML = currentQuiz.options.map((opt, idx) => `
            <div class="card" onclick="Phase3MasterQuiz.checkAnswer(${idx})">
                <div class="option-marker" style="margin-right:10px; font-weight:bold;">${String.fromCharCode(65 + idx)}</div>
                <div class="option-text">${opt}</div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="phase-container phase3-adv-container animated fadeIn">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-advanced">ESAME FINALE</span>
                    <div class="exam-status">Domanda Unica - Livello Massima Difficoltà</div>
                </div>

                <div class="quiz-question-box">
                    <h3 class="exam-question">${currentQuiz.question}</h3>
                </div>

                <div class="cards-container">
                    ${optionsHTML}
                </div>

                <div id="exam-feedback" class="exam-feedback" style="display:none;"></div>
            </div>
        `;
    }

    function checkAnswer(selectedIndex) {
        const feedbackEl = document.getElementById('exam-feedback');
        const isCorrect = selectedIndex === currentQuiz.correctIndex;

        // Disabilita opzioni
        document.querySelectorAll('.card').forEach(el => el.style.pointerEvents = 'none');

        // Tracking Memoria (Professional Tier)
        let xpGained = 0;
        if (typeof UserProfile !== 'undefined') {
            // Master Quiz = Difficulty 3
            const result = UserProfile.trackQuizResult(StateManager.getState().currentConceptId, isCorrect, 3);
            xpGained = result ? result.xpGained : 0;
        }

        if (isCorrect) {
            feedbackEl.className = 'exam-feedback success';
            feedbackEl.innerHTML = `
                <h4>🏆 ECCELLENTE (+${xpGained} XP)</h4>
                <p>${currentQuiz.explanation}</p>
                <button class="btn-primary" onclick="StateManager.completeCurrentConcept(); AppController.renderHeader(); SidebarManager.updateActiveItem(); alert('Modulo Completato con Successo! (XP Totali: ' + UserProfile.getState().xp + ')');">
                    Concludi Modulo
                </button>
            `;
            // Animazione vittoria?
        } else {
            feedbackEl.className = 'exam-feedback error';
            feedbackEl.innerHTML = `
                <h4>❌ RESPINTO</h4>
                <p>La risposta corretta era la <strong>${String.fromCharCode(65 + currentQuiz.correctIndex)}</strong>.</p>
                <p>${currentQuiz.explanation}</p>
                <div class="phase-actions">
                    <button class="btn-secondary" onclick="PhaseManager.renderPhase(1, null); StateManager.resetToPhase1();">
                        Ristudia (Torna a Fase 1)
                    </button>
                    <button class="btn-primary" onclick="AppController.renderCurrentPhase()">
                        Riprova Esame (Nuova Domanda)
                    </button>
                </div>
            `;
            StateManager.recordIncorrectAttempt(StateManager.getState().currentConceptId, "EXAM_FAIL");
        }

        feedbackEl.style.display = 'block';
        feedbackEl.scrollIntoView({ behavior: 'smooth' });
    }

    return { render, checkAnswer };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase3MasterQuiz;
}
window.Phase3MasterQuiz = Phase3MasterQuiz;
