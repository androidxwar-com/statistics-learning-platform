/**
 * FASE 1: Teoria Complessa + Feedback Loop
 * 
 * Mostra la spiegazione formale del concetto con:
 * - Contenuto teorico complesso
 * - Formule matematiche
 * - Termini chiave
 * - Bottoni feedback: ✅ "Ti è chiaro" | ❌ "Non mi è chiaro"
 * 
 * Se l'utente clicca ❌, richiede spiegazione alternativa via Groq API
 */

const Phase1ComplexTheory = (function () {
    let currentContent = null;
    let attempts = 0; // Contatore tentativi spiegazione

    /**
     * Renderizza Fase 1
     */
    function render(conceptData) {
        currentContent = conceptData.phase1_complex;
        hasRequestedAlternative = StateManager.getState().requestedAlternativeExplanation;

        const content = `
            <div class="phase-container phase1-container">
                <div class="phase-header">
                    <span class="phase-badge">FASE 1/5</span>
                    <h2>${currentContent.title}</h2>
                    <p class="phase-subtitle">Teoria Formale - Leggi attentamente</p>
                </div>

                <div class="theory-content">
                    <div class="theory-text">
                        ${formatTheoryContent(currentContent.content)}
                    </div>

                    ${currentContent.mathFormulas && currentContent.mathFormulas.length > 0 ? `
                        <div class="formulas-box">
                            <h4>📐 Formule Chiave</h4>
                            ${currentContent.mathFormulas.map(f => `<div class="formula">${escapeHTML(f)}</div>`).join('')}
                        </div>
                    ` : ''}

                    ${currentContent.keyTerms && currentContent.keyTerms.length > 0 ? `
                        <div class="key-terms">
                            <strong>Termini chiave:</strong> 
                            ${currentContent.keyTerms.map(t => `<span class="term-badge">${t}</span>`).join(' ')}
                        </div>
                    ` : ''}
                </div>

                <div id="alternative-explanation-box" style="display: ${hasRequestedAlternative ? 'block' : 'none'};">
                    <!-- Spiegazione alternativa renderizzata qui -->
                </div>

                <div class="clarity-feedback">
                    <p class="feedback-question">✨ Ti è chiaro questo concetto?</p>
                    <div class="feedback-buttons">
                        <button class="btn-feedback btn-clear" onclick="Phase1ComplexTheory.handleClear()">
                            <span class="icon">✅</span> Sì, mi è chiaro
                        </button>
                        <button class="btn-feedback btn-unclear" onclick="Phase1ComplexTheory.handleUnclear()">
                            <span class="icon">❌</span> No, non mi è chiaro
                        </button>
                    </div>
                </div>

                <div id="feedback-message" class="feedback-message"></div>
            </div>
        `;

        document.getElementById('app-content').innerHTML = content;

        // Se aveva già richiesto spiegazione alternativa, ri-renderizzala
        if (hasRequestedAlternative) {
            showStoredAlternativeExplanation();
        }
    }

    /**
     * Gestisce feedback "Sì, mi è chiaro"
     */
    function handleClear() {
        console.log('✅ Utente ha compreso - Avanza a Fase 2');

        // Animazione di conferma
        showFeedbackMessage('Perfetto! Passiamo alla sintesi. 🎉', 'success');

        // Reset flag spiegazione alternativa
        StateManager.setState({ requestedAlternativeExplanation: false });

        // Avanza dopo 1.5s
        setTimeout(() => {
            StateManager.advancePhase();
            AppController.renderCurrentPhase();
        }, 1500);
    }

    /**
     * Gestisce feedback "No, non mi è chiaro"
     */
    /**
     * Gestisce feedback "No, non mi è chiaro" (Infinite Loop)
     */
    async function handleUnclear() {
        attempts++;
        console.log(`❌ Concetto non chiaro - Tentativo spiegazione #${attempts}`);

        showFeedbackMessage(`Generazione spiegazione alternativa (Tentativo ${attempts})... 🤔`, 'info');
        disableFeedbackButtons();

        try {
            // Richiedi spiegazione alternativa via Groq con contesto del tentativo
            const alternative = await GroqAPIClient.generateAlternativeExplanation(
                currentContent.title,
                currentContent.content,
                attempts
            );

            console.log("DEBUG: Alternative content received:", alternative); // Debug log

            if (alternative) {
                displayAlternativeExplanation(alternative, attempts);
            } else {
                console.warn('⚠️ Groq non disponibile, uso fallback');
                displayAlternativeExplanation("Non riesco a generare altre spiegazioni al momento. Prova a rileggere o chiedi al docente.", attempts);
            }

            // Msg successo
            showFeedbackMessage(`Ecco una nuova spiegazione (${getStyleName(attempts)}). È più chiara ora? 📖`, 'success');

        } catch (error) {
            console.error('Errore generazione spiegazione:', error);
            showFeedbackMessage('⚠️ Errore generico. Riprova.', 'error');
        }

        enableFeedbackButtons();
    }

    function getStyleName(n) {
        if (n === 1) return "Analogia Pratica";
        if (n === 2) return "Esempio Numerico";
        if (n === 3) return "Spiegazione Semplificata (ELI5)";
        return "Nuova Prospettiva";
    }

    /**
     * Mostra spiegazione alternativa
     */
    function displayAlternativeExplanation(explanation, attemptNum) {
        const box = document.getElementById('alternative-explanation-box');

        // Stile inline per garantire visibilità immediata (Yellow box)
        box.innerHTML = `
            <div class="alternative-explanation attempt-${attemptNum}" style="background: #fff3cd; color: #856404; padding: 15px; border: 1px solid #ffeeba; border-radius: 8px; margin: 15px 0;">
                <h4 style="margin-top:0">💡 Spiegazione Alternativa #${attemptNum}: ${getStyleName(attemptNum)}</h4>
                <div class="alt-content" style="font-size: 1.05em; line-height: 1.6;">
                    ${formatTheoryContent(explanation)}
                </div>
            </div>
        `;
        box.style.display = 'block';

        // Scroll smooth
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Ripristina spiegazione alternativa memorizzata (dopo reload)
     */
    function showStoredAlternativeExplanation() {
        // In un'implementazione completa, salveremmo la spiegazione in localStorage
        // Per ora, ricarica dalla Fase 2 come fallback
        showFeedbackMessage('Hai già richiesto una spiegazione alternativa. Rileggi sopra. 📖', 'info');
    }

    /**
     * Formatta contenuto teoria (supporta paragrafi, liste, ecc.)
     */
    function formatTheoryContent(text) {
        return text
            .split('\n\n')
            .map(para => `<p>${para.trim()}</p>`)
            .join('');
    }

    /**
     * Mostra messaggio feedback
     */
    function showFeedbackMessage(message, type) {
        const msgEl = document.getElementById('feedback-message');
        msgEl.textContent = message;
        msgEl.className = `feedback-message ${type}`;
        msgEl.style.display = 'block';
    }

    /**
     * Disabilita/abilita bottoni feedback
     */
    function disableFeedbackButtons() {
        document.querySelectorAll('.btn-feedback').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
    }

    function enableFeedbackButtons() {
        document.querySelectorAll('.btn-feedback').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }

    /**
     * Escape HTML per sicurezza
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Public API
    return {
        render,
        handleClear,
        handleUnclear
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase1ComplexTheory;
}
