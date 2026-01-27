/**
 * FASE 3: Applicazione Pratica
 * 
 * Mostra esempi concreti del concetto:
 * - Scenari reali
 * - Soluzioni step-by-step
 * - Applicazioni pratiche
 * - Bottone per iniziare quiz
 */

const Phase3PracticalApplication = (function () {

    /**
     * Renderizza Fase 3
     */
    function render(conceptData) {
        const content = conceptData.phase3_practical;

        const html = `
            <div class="phase-container phase3-container">
                <div class="phase-header">
                    <span class="phase-badge">FASE 3/5</span>
                    <h2>${content.title}</h2>
                    <p class="phase-subtitle">Esempi Pratici - Applicazione</p>
                </div>

                <div class="practical-content">
                    ${content.examples && content.examples.length > 0 ? `
                        <div class="examples-list">
                            ${content.examples.map((ex, index) => renderExample(ex, index + 1)).join('')}
                        </div>
                    ` : ''}

                    ${content.realWorldUse ? `
                        <div class="real-world-use">
                            <h4>🌍 Applicazioni nel Mondo Reale</h4>
                            <p>${content.realWorldUse}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="phase-actions">
                    <p class="ready-quiz-message">
                        🎯 Hai compreso la teoria e visto esempi pratici. <br>
                        Sei pronto a testare le tue conoscenze!
                    </p>
                    <button class="btn-primary btn-large" onclick="Phase3PracticalApplication.startQuiz()">
                        🚀 Inizia il Quiz
                    </button>
                </div>
            </div>
        `;

        document.getElementById('app-content').innerHTML = html;
    }

    /**
     * Renderizza singolo esempio
     */
    function renderExample(example, number) {
        return `
            <div class="example-card">
                <div class="example-header">
                    <span class="example-number">Esempio ${number}</span>
                    <h4>${example.scenario}</h4>
                </div>
                <div class="example-body">
                    <p><strong>Situazione:</strong> ${example.description}</p>
                    <div class="solution-box">
                        <strong>💡 Soluzione:</strong>
                        <div class="solution-content">
                            ${formatSolution(example.solution)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Formatta soluzione (supporta step multipli)
     */
    function formatSolution(solution) {
        // Se contiene "Passo 1", "Passo 2", ecc., formatta come step
        if (solution.includes('**Passo') || solution.includes('Passo 1')) {
            return solution
                .split('\n\n')
                .map(para => {
                    if (para.includes('**Passo') || para.match(/Passo \d+/)) {
                        return `<div class="step">${para.trim()}</div>`;
                    }
                    return `<p>${para.trim()}</p>`;
                })
                .join('');
        }

        // Altrimenti formatta come paragrafi semplici
        return solution
            .split('\n\n')
            .map(para => `<p>${para.trim()}</p>`)
            .join('');
    }

    /**
     * Inizia quiz (avanza a Fase 4)
     */
    function startQuiz() {
        console.log('🎯 Avvio quiz - Fase 4');

        StateManager.advancePhase();
        AppController.renderCurrentPhase();
    }

    // Public API
    return {
        render,
        startQuiz
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase3PracticalApplication;
}
