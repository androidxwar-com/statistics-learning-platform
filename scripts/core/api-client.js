/**
 * Groq API Client
 * 
 * Gestisce chiamate all'API Groq per:
 * - Spiegazioni alternative (Fase 1)
 * - Generazione domande dinamiche (Fase 4-5)
 * - Feedback su risposte errate
 */

const GroqAPIClient = (function () {
    let config = null;
    let requestQueue = [];
    let isProcessing = false;
    let responseCache = new Map();

    /**
     * Inizializza client con configurazione
     */
    function init(apiConfig) {
        config = apiConfig;
        console.log('🤖 Groq API Client inizializzato:', config.demoMode ? 'DEMO MODE' : 'PRODUCTION MODE');
    }

    /**
     * Chiama API Groq con retry logic
     */
    async function callAPI(prompt, systemPrompt = 'Sei un tutor esperto di statistica e probabilità.') {
        // Check cache
        const cacheKey = `${systemPrompt}:${prompt}`;
        if (responseCache.has(cacheKey)) {
            console.log('📦 Risposta da cache');
            return responseCache.get(cacheKey);
        }

        // Modalità demo: ritorna risposta SIMULATA istantanea
        if (config.demoMode || !config.apiKey || config.apiKey === 'YOUR_GROQ_API_KEY_HERE') {
            console.log('⚡ SIMULATION MODE: Generazione risposta istantanea (Mock)');
            await sleep(1000); // Piccolo delay per realismo
            return simulateResponse(prompt);
        }

        // Verifica API key (se non demo)
        if (!config.apiKey) {
            console.error('❌ API Key non configurata!');
            return simulateResponse(prompt); // Fallback to simulation safeguard
        }

        const requestBody = {
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature
        };

        let lastError = null;

        // Retry loop
        for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
            try {
                console.log(`🚀 Chiamata Groq API (tentativo ${attempt}/${config.maxRetries})...`);

                const response = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown'}`);
                }

                const data = await response.json();
                const content = data.choices[0]?.message?.content;

                if (!content) {
                    throw new Error('Risposta vuota dall\'API');
                }

                // Salva in cache
                responseCache.set(cacheKey, content);
                console.log('✅ Risposta Groq ricevuta');

                return content;

            } catch (error) {
                lastError = error;
                console.error(`❌ Errore tentativo ${attempt}:`, error.message);

                // Attendi prima di retry
                if (attempt < config.maxRetries) {
                    await sleep(config.retryDelay);
                }
            }
        }

        console.error('❌ Tutti i tentativi falliti:', lastError);
        return null;
    }

    /**
     * Genera spiegazione alternativa per concetto non chiaro (Fase 1)
     */
    async function generateAlternativeExplanation(conceptTitle, originalExplanation) {
        const prompt = `L'utente non ha compreso questa spiegazione sul concetto "${conceptTitle}":

"${originalExplanation}"

Per favore, rispiega lo stesso concetto utilizzando:
1. Terminologia più semplice e accessibile
2. Un'analogia concreta e quotidiana
3. Un esempio numerico pratico

Mantieni il rigore matematico ma sii più intuitivo. Rispondi in italiano, max 250 parole.`;

        const systemPrompt = 'Sei un tutor paziente ed esperto di statistica. Il tuo obiettivo è far comprendere i concetti a tutti, usando esempi chiari e linguaggio accessibile.';

        return await callAPI(prompt, systemPrompt);
    }

    /**
     * Genera nuova domanda quiz (Fase 4-5)
     */
    async function generateQuizQuestion(conceptId, mode, difficulty) {
        const modeDesc = mode === 'home'
            ? 'La domanda deve richiedere calcoli matematici (lo studente ha carta e penna)'
            : 'La domanda deve essere puramente logica/concettuale (senza calcoli)';

        const difficultyDesc = difficulty === 'basic'
            ? 'Domanda di difficoltà BASE (concetto singolo, applicazione diretta)'
            : 'Domanda AVANZATA (combinazione di concetti, pensiero critico)';

        const prompt = `Genera UNA domanda a risposta multipla sul concetto "${conceptId}".

Modalità: ${mode.toUpperCase()}
${modeDesc}

Difficoltà: ${difficulty.toUpperCase()}
${difficultyDesc}

Formato JSON richiesto:
{
  "question": "Testo della domanda",
  "options": ["Opzione A", "Opzione B", "Opzione C"],
  "correctIndex": 0,
  "explanation": "Spiegazione della risposta corretta"
}

IMPORTANTE:
- Esattamente 3 opzioni
- correctIndex indica l'indice (0, 1 o 2) della risposta corretta
- Explanation deve spiegare perché la risposta è corretta
- Domanda in ITALIANO`;

        const response = await callAPI(prompt, 'Sei un esperto di statistica che crea quiz educativi.');

        if (!response) return null;

        try {
            // Estrai JSON dalla risposta (può contenere markdown)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Nessun JSON trovato nella risposta');
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Errore parsing JSON da Groq:', error);
            return null;
        }
    }

    /**
     * Genera feedback su risposta errata
     */
    async function generateFeedback(question, wrongAnswer, correctAnswer) {
        const prompt = `L'utente ha risposto ERRONEAMENTE a questa domanda:

Domanda: "${question}"
Ha scelto: "${wrongAnswer}"
Risposta corretta: "${correctAnswer}"

Fornisci un feedback che:
1. Spiega perché la risposta scelta è sbagliata
2. Chiarisce il concetto chiave non compreso
3. Spiega perché la risposta corretta è giusta

Usa un tono incoraggiante ma diretto. Max 150 parole, in italiano.`;

        return await callAPI(prompt, 'Sei un tutor che aiuta gli studenti a capire i loro errori in modo costruttivo.');
    }

    /**
     * Utility: sleep
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Svuota cache risposte
     */
    function clearCache() {
        responseCache.clear();
        console.log('🗑️ Cache Groq svuotata');
    }

    /**
     * Simula una risposta AI intelligente basata sul prompt
     */
    function simulateResponse(prompt) {
        // Riconoscimento pattern semplice per decidere cosa rispondere

        // Caso 1: Feedback Errore
        if (prompt.includes('risposto ERRONEAMENTE')) {
            const feedbacks = [
                "Hai sbagliato perché hai confuso la definizione. Ricorda: La probabilità non può mai essere negativa!",
                "Attenzione! Hai considerato l'insieme sbagliato. Rileggi bene la domanda.",
                "Errore comune. Il valore atteso è una media ponderata, non il valore più frequente."
            ];
            return feedbacks[Math.floor(Math.random() * feedbacks.length)];
        }

        // Caso 2: Quiz JSON (Dynamic Generation)
        if (prompt.includes('Genera UNA domanda a risposta multipla')) {
            // Estrai topic dal prompt
            let topic = "di Statistica";
            if (prompt.includes('variabili-casuali')) topic = "sulle Variabili Casuali";
            if (prompt.includes('teorema')) topic = "sul Teorema";

            const uniqueId = `gen-q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            return JSON.stringify({
                question: `Domanda Generativa ${topic} #${Math.floor(Math.random() * 900) + 100}: Quale delle seguenti affermazioni è corretta?`,
                options: [
                    "Questa è l'opzione corretta basata sui principi fondamentali.",
                    "Questa opzione contiene un errore logico comune.",
                    "Questa opzione è matematicamente errata."
                ],
                correctIndex: 0,
                explanation: `La risposta è corretta perché rispetta le definizioni assiomatiche ${topic}. L'errore nelle altre opzioni deriva da un'errata interpretazione delle proprietà.`
            });
        }

        // Caso 3: Spiegazione Alternativa
        if (prompt.includes('spiegazione sul concetto') || prompt.includes('rispiega lo stesso concetto')) {
            return "Certamente. Proviamo a vedere il concetto da un'altra prospettiva.\n\nImmagina di costruire un edificio: le fondamenta devono essere solide prima di alzare i muri. Allo stesso modo, in questo teorema, le ipotesi iniziali sono le fondamenta. Se ne togliamo una, crolla la tesi. In termini pratici, stiamo calcolando l'equilibrio del sistema.";
        }

        return "Risposta generata dal sistema locale. Per risposte real-time specifiche, configura l'API Key.";
    }

    // Public API
    return {
        init,
        generateAlternativeExplanation,
        generateQuizQuestion,
        generateFeedback,
        clearCache
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroqAPIClient;
}
