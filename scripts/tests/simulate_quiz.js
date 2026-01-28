// scripts/tests/simulate_quiz.js
import GroqAPIClient from '../core/api-client.js';

// Mock config for Demo Mode
const demoConfig = {
    apiKey: 'YOUR_GROQ_API_KEY_HERE',
    demoMode: true,
    model: 'mock-model',
    maxRetries: 3,
    retryDelay: 100,
    endpoint: 'http://localhost'
};

async function runSimulation() {
    console.log("🧪 AVVIO SIMULAZIONE QUIZ & AI...\n");

    try {
        // 1. Init
        GroqAPIClient.init(demoConfig);

        // 2. Test Quiz Generation (Caso Base)
        console.log("--- TEST 1: Generazione Quiz (Demo) ---");
        const quiz = await GroqAPIClient.generateQuizQuestion('test-concept', 'home', 'basic');

        if (quiz && quiz.question && Array.isArray(quiz.options) && typeof quiz.correctIndex === 'number') {
            console.log("✅ Quiz generato correttamente (JSON valido).");
            console.log("   Q:", quiz.question);
        } else {
            console.error("❌ Errore schema quiz JSON:", quiz);
        }

        // 3. Test Quiz Generation (Caso Avanzato - Altro Topic)
        console.log("\n--- TEST 2: Generazione Quiz (Altro Topic) ---");
        const quiz2 = await GroqAPIClient.generateQuizQuestion('teorema-bayes', 'away', 'advanced');
        if (quiz2 && quiz2.question) {
            console.log("✅ Quiz 2 generato correttamente.");
        } else {
            console.error("❌ Errore schema quiz 2:", quiz2);
        }

        // 4. Test Spiegazione Alternativa
        console.log("\n--- TEST 3: Spiegazione Alternativa ---");
        const expl = await GroqAPIClient.generateAlternativeExplanation('Teorema Bayes', 'La probabilità condizionata è...');
        if (typeof expl === 'string' && expl.length > 10) {
            console.log("✅ Spiegazione generata correttamente.");
        } else {
            console.error("❌ Errore spiegazione:", expl);
        }

        // 5. Test Feedback Errore
        console.log("\n--- TEST 4: Feedback Errore ---");
        const feedback = await GroqAPIClient.generateFeedback('Quanto fa 2+2?', '5', '4');
        if (typeof feedback === 'string') {
            console.log("✅ Feedback generato correttamente.");
        } else {
            console.error("❌ Errore feedback:", feedback);
        }

        console.log("\n✅ SIMULAZIONE COMPLETATA CON SUCCESSO.");

    } catch (e) {
        console.error("\n❌ ERRORE FATALE SIMULAZIONE:", e);
    }
}

runSimulation();
