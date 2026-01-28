/**
 * Data Loader - Utility per caricare dati da JSON
 * 
 * Carica:
 * - Struttura argomenti
 * - Contenuti teorici
 * - Banca domande
 */

const DataLoader = (function () {
    let topicsStructure = null;
    let theoryContent = null;
    let questionsBank = null;

    /**
     * Inizializza caricando tutti i dati
     */
    /**
     * Inizializza caricando tutti i dati
     */
    async function init() {
        try {
            console.log('📥 Caricamento dati...');

            const results = await Promise.allSettled([
                loadJSON('config/topics-structure.json'),
                loadJSON('data/theory-content.json'),
                loadJSON('data/questions-bank.json')
            ]);

            // Check failures
            const errors = results
                .filter(r => r.status === 'rejected')
                .map(r => r.reason.message);

            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }

            // Success assignments
            topicsStructure = results[0].value;
            theoryContent = results[1].value;
            questionsBank = results[2].value;

            console.log('✅ Dati caricati con successo');
            return { success: true };

        } catch (error) {
            console.error('❌ Errore caricamento dati:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Carica file JSON con error handling specifico
     */
    async function loadJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`File non trovato o errore server: ${path} (${response.status})`);
            }
            return await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Errore sintassi JSON in ${path}: ${error.message}`);
            }
            throw new Error(`Impossibile caricare ${path}: ${error.message}`);
        }
    }

    /**
     * Ottieni struttura argomenti
     */
    function getTopicsStructure() {
        return topicsStructure;
    }

    /**
     * Carica contenuto teorico per un concetto
     */
    function loadTheoryContent(conceptId) {
        if (!theoryContent || !theoryContent.concepts) {
            console.error('Theory content not loaded');
            return null;
        }
        return theoryContent.concepts[conceptId] || null;
    }

    /**
     * Carica domande per un concetto
     */
    function loadQuestions(conceptId) {
        if (!questionsBank || !questionsBank.questions) {
            console.error('Questions bank not loaded');
            return null;
        }
        return questionsBank.questions[conceptId] || null;
    }

    /**
     * Trova concetto nella struttura per ID
     */
    function getConceptInfo(conceptId) {
        if (!topicsStructure) return null;

        for (const topic of topicsStructure.macro_topics) {
            for (const subtopic of topic.subtopics) {
                const concept = subtopic.concepts.find(c => c.id === conceptId);
                if (concept) {
                    return {
                        topic: topic.title,
                        subtopic: subtopic.title,
                        concept: concept.title,
                        estimatedMinutes: concept.estimatedMinutes
                    };
                }
            }
        }
        return null;
    }

    // Public API
    return {
        init,
        getTopicsStructure,
        loadTheoryContent,
        loadQuestions,
        getConceptInfo
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}
