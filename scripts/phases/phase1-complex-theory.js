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
    let hasRequestedAlternative = false;

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
    async function handleUnclear() {
        console.log('❌ Concetto non chiaro - Richiesta spiegazione alternativa');

        showFeedbackMessage('Un momento, sto preparando una spiegazione più semplice... 🤔', 'info');

        // Disabilita bottoni durante caricamento
        disableFeedbackButtons();

        try {
            // Richiedi spiegazione alternativa via Groq
            const alternative = await GroqAPIClient.generateAlternativeExplanation(
                currentContent.title,
                currentContent.content
            );

            if (alternative) {
                displayAlternativeExplanation(alternative);
                StateManager.setState({ requestedAlternativeExplanation: true });
            } else {
                // Fallback: usa spiegazione semplificata (Fase 2) come alternativa
                console.warn('⚠️ Groq non disponibile, uso fallback da Fase 2');
                const conceptId = StateManager.getState().currentConceptId;
                const theoryData = await DataLoader.loadTheoryContent(conceptId);
                displayAlternativeExplanation(theoryData.phase2_simplified.content);
            }

            showFeedbackMessage('Ecco una spiegazione alternativa! Leggi e dimmi se ti è chiara ora. 📖', 'success');

        } catch (error) {
            console.error('Errore generazione spiegazione alternativa:', error);
            showFeedbackMessage('⚠️ Errore nel caricamento. Riprova o passa alla fase successiva.', 'error');
        }

        enableFeedbackButtons();
    }

    /**
     * Mostra spiegazione alternativa
     */
    function displayAlternativeExplanation(explanation) {
        const box = document.getElementById('alternative-explanation-box');
        box.innerHTML = `
            <div class="alternative-explanation">
                <h4>💡 Spiegazione Alternativa</h4>
                <div class="alt-content">
                    ${formatTheoryContent(explanation)}
                </div>
            </div>
        `;
        box.style.display = 'block';

        // Scroll smooth verso la spiegazione
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
