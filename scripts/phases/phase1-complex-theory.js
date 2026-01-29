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
    let fullConceptData = null; // Store full context (Phase 1-3)
    let attempts = 0; // Contatore tentativi spiegazione

    /**
     * Renderizza Fase 1
     */
    function render(conceptData) {
        fullConceptData = conceptData; // Capture full context
        fullConceptData = conceptData; // Capture full context

        // --- SELF-HEALING: Check if content exists ---
        if (!conceptData || !conceptData.phase1_complex || !conceptData.phase1_complex.content) {
            console.warn('[Phase1] Dati mancanti, avvio generazione IA...');
            renderFallbackWithAI();
            return;
        }

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

                    <!-- VISUALIZATION SLOT -->
                    <div id="visualization-container"></div>
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

        // Tenta Visualizzazione (Professional Tier)
        // Tenta Visualizzazione (Professional Tier)
        if (typeof Visualizer !== 'undefined' && Visualizer.canVisualize(currentContent.title)) {
            setTimeout(() => {
                Visualizer.render('visualization-container', currentContent.title);
            }, 100);
        }
        // End if
        // Brace removed to keep tracking inside render

        // Tracking Memoria (Professional Tier)
        if (typeof UserProfile !== 'undefined') {
            UserProfile.trackVisit(currentContent.title);
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
            // Richiedi spiegazione alternativa via Groq con contesto COMPLETO (Radiated Architecture)
            // Passiamo l'intero oggetto dati affinché l'IA possa "vedere" tutto il materiale disponibile
            const alternative = await GroqAPIClient.generateAlternativeExplanation(
                currentContent.title,
                fullConceptData, // PASSING FULL CONTEXT OBJECT
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
        if (!text) return '<p class="error-text">Contenuto non disponibile.</p>';
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

    /**
     * FALLBACK: Generazione via IA se il JSON locale è vuoto
     */
    async function renderFallbackWithAI() {
        const state = StateManager.getState();
        const meta = DataManager.getConceptMetadata(state.currentConceptId);
        const title = meta ? meta.title : "Concetto sconosciuto";

        const container = document.getElementById('app-content');
        container.innerHTML = `
            <div class="phase-container phase1-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-warning">FASE 1/5 (GENERATA DA IA)</span>
                    <h2>${title}</h2>
                    <p class="phase-subtitle">Teoria Formale - Generazione in corso...</p>
                </div>
                <div class="loader-container">
                    <div class="loader"></div>
                    <p>L'IA sta scrivendo la teoria per te...</p>
                </div>
            </div>
        `;

        try {
            // Simuliamo struttura conceptData minima per l'API
            const mockData = { title: title, phase1_complex: { title: title } };

            // Usa il generatore "AdvancedTheory" che è adatto per spiegazioni formali
            const generatedHTML = await GroqAPIClient.generateAdvancedTheory(mockData);

            if (!generatedHTML) throw new Error("Risposta vuota dall'IA");

            // Costruiamo un oggetto "currentContent" fittizio con l'HTML generato
            currentContent = {
                title: title,
                content: generatedHTML, // L'HTML grezzo andrà bypassato nel formatter o iniettato diretto
                mathFormulas: [], // Non possiamo estrarle facilmente dal RAW HTML per ora
                keyTerms: ["IA", "Generated"]
            };

            // Override della funzione render standard per questo ciclo
            renderGeneratedContent(container, title, generatedHTML);

        } catch (error) {
            console.error("Errore fallback IA:", error);
            container.innerHTML += `<div class="error-box">Errore generazione: ${error.message}</div>`;
        }
    }

    function renderGeneratedContent(container, title, htmlText) {
        container.innerHTML = `
            <div class="phase-container phase1-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-success">FASE 1/5 (GENERATA DA IA)</span>
                    <h2>${title}</h2>
                    <p class="phase-subtitle">Teoria Formale</p>
                </div>

                <div class="theory-content">
                    <div class="theory-text">
                        ${htmlText} 
                    </div>
                     <!-- Visualizer Slot -->
                    <div id="visualization-container"></div>
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
                <div id="alternative-explanation-box" style="display:none"></div>
            </div>
        `;

        // Tenta visualizzazione anche sul generato
        if (typeof Visualizer !== 'undefined' && Visualizer.canVisualize(title)) {
            setTimeout(() => Visualizer.render('visualization-container', title), 100);
        }
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
