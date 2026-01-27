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
    async function init() {
        try {
            console.log('📥 Caricamento dati...');

            // Carica tutti i JSON (percorsi relativi a index.html, non al file .js)
            [topicsStructure, theoryContent, questionsBank] = await Promise.all([
                loadJSON('config/topics-structure.json'),
                loadJSON('data/theory-content.json'),
                loadJSON('data/questions-bank.json')
            ]);

            console.log('✅ Dati caricati con successo');
            return true;

        } catch (error) {
            console.error('❌ Errore caricamento dati:', error);
            return false;
        }
    }

    /**
     * Carica file JSON
     */
    async function loadJSON(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.statusText}`);
        }
        return await response.json();
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
