/**
 * Groq API Client
 * 
 * Gestisce chiamate all'API Groq.
 * REFACTOR v2.0: Usa `config/prompts.js` per i template.
 */

(function (global) {
    console.log('🤖 Loading GroqAPIClient script (Refactored)...');

    const Client = (function () {
        let config = null;
        let responseCache = new Map();

        /**
         * Inizializza client con configurazione
         */
        function init(apiConfig) {
            config = apiConfig;
            // CHECK LOCAL STORAGE FOR OVERRIDE
            const storedKey = localStorage.getItem('groq_api_key');
            if (storedKey && storedKey.startsWith('gsk_')) {
                config.apiKey = storedKey;
                console.log('🔑 API Key caricata da LocalStorage');
            }
            console.log('🤖 Groq API Client inizializzato:', config.demoMode ? 'DEMO MODE' : 'PRODUCTION MODE');
        }

        /**
         * Chiama API Groq con retry logic e caching
         */
        async function callAPI(prompt, systemPrompt) {
            // Check cache
            const cacheKey = `${systemPrompt}:${prompt}`;
            if (responseCache.has(cacheKey)) {
                console.log('📦 Risposta da cache');
                return responseCache.get(cacheKey);
            }

            // Modalità demo o API key mancante
            if (!config || config.demoMode || !config.apiKey || config.apiKey.includes('YOUR_GROQ')) {
                console.log('⚡ SIMULATION MODE: Fallback locale');
                await sleep(1000);
                return simulateResponse(prompt);
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

                    if (!response.ok) throw new Error(`API Error ${response.status}`);

                    const data = await response.json();
                    const content = data.choices[0]?.message?.content;

                    if (!content) throw new Error('Risposta vuota dall\'API');

                    // Post-processing: Sanitizzazione base HTML
                    let cleanContent = content
                        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                        .replace(/\*(.*?)\*/g, '<i>$1</i>');

                    // Salva in cache
                    responseCache.set(cacheKey, cleanContent);
                    return cleanContent;

                } catch (error) {
                    lastError = error;
                    console.error(`❌ Errore tentativo ${attempt}:`, error.message);
                    if (attempt < config.maxRetries) await sleep(config.retryDelay);
                }
            }

            console.error('❌ Tutti i tentativi falliti:', lastError);
            return null; // Fallback handled by caller
        }

        /**
         * Genera spiegazione alternativa (Fase 1 Standard)
         */
        async function generateAlternativeExplanation(conceptTitle, fullData, attempt = 1) {
            // Definisci strategia basata sul tentativo
            let styleInstruction = "";
            let originalText = fullData?.phase1_complex?.content || "Definizione standard";

            switch (attempt) {
                case 1:
                    styleInstruction = `STRATEGIA: ANALOGIA CONCRETA (Life-Based)\n- Usa metafore reali.\n- Usa <b>bold</b> per termini chiave.`;
                    break;
                case 2:
                    styleInstruction = `STRATEGIA: ESEMPIO NUMERICO PASSO-PASSO\n- Calcoli riga per riga.`;
                    break;
                default:
                    styleInstruction = `STRATEGIA: ELI5 (Explain Like I'm 5)\n- Estremamente semplice.`;
                    break;
            }

            const prompt = PromptRegistry.ALTERNATIVE_EXPLANATION(conceptTitle, originalText, attempt, styleInstruction);
            return await callAPI(prompt, PromptRegistry.SYSTEM.TUTOR);
        }

        /**
         * [ADVANCED MODE] Genera Lezione Magistrale (Fase 1/3)
         */
        async function generateAdvancedTheory(conceptData, retryCount = null) {
            let prompt = "";

            if (!retryCount) {
                const context = JSON.stringify(conceptData);
                prompt = PromptRegistry.THEORY_ADVANCED.INITIAL(conceptData.title, context);
            } else {
                prompt = PromptRegistry.THEORY_ADVANCED.RETRY(conceptData.phase1_complex.title);
            }

            const systemPrompt = retryCount ? PromptRegistry.SYSTEM.DATA_SCIENTIST : PromptRegistry.SYSTEM.TUTOR;
            return await callAPI(prompt, systemPrompt);
        }

        /**
         * [ADVANCED MODE] Genera Analisi Dati (Fase 2/3)
         */
        async function generateDataPractice(conceptData, retryContext = null) {
            const title = conceptData.phase1_complex.title;
            const prompt = !retryContext
                ? PromptRegistry.DATA_PRACTICE.INITIAL(title)
                : PromptRegistry.DATA_PRACTICE.RETRY(title);

            return await callAPI(prompt, PromptRegistry.SYSTEM.DATA_SCIENTIST);
        }

        /**
         * [ADVANCED MODE] Genera Esame Magistrale (Fase 3/3)
         */
        async function generateMasterQuiz(conceptData) {
            const title = conceptData.title || conceptData.phase1_complex.title;
            const prompt = PromptRegistry.QUIZ.MASTER(title);

            const response = await callAPI(prompt, PromptRegistry.SYSTEM.EXAMINER);

            // JSON Parsing Resiliente
            return parseJSONResponse(response);
        }

        /**
         * Genera nuova domanda quiz (Fase 4-5 Standard)
         */
        async function generateQuizQuestion(conceptId, mode, difficulty) {
            const descMode = mode === 'home' ? 'Richiede calcoli.' : 'Solo logica.';
            const descDiff = difficulty === 'basic' ? 'Concetto singolo.' : 'Ragionamento complesso.';

            const prompt = PromptRegistry.QUIZ.STANDARD(conceptId, mode, descMode, difficulty, descDiff);
            const response = await callAPI(prompt, "Sei un esperto di statistica che crea quiz educativi.");

            return parseJSONResponse(response);
        }

        /**
         * Genera feedback correzione
         */
        async function generateFeedback(question, wrong, correct) {
            const prompt = PromptRegistry.FEEDBACK(question, wrong, correct);
            return await callAPI(prompt, PromptRegistry.SYSTEM.COACH);
        }

        /**
         * CHATBOT: Invia messaggio al Tutor
         */
        async function sendChatMessage(userMessage, history, contextData) {
            // Costruisci System Prompt con Persona + Contesto
            const contextStr = contextData ? JSON.stringify(contextData) : "Nessun contesto specifico.";

            const systemPrompt = `
SEI UN PROFESSORE UNIVERSITARIO D'ELITE (Stile "Feynman").
Tono: Autorevole ma Accessibile, Coinvolgente, Simpatico (Usa Emoji 🎓🚀💡).
Obiettivo: Spiegare il concetto basandoti SUI DATI FORNITI.

DATI CONCETTO CORRENTE:
${contextStr}

REGOLE:
1. Usa Teoria Formale + Esempi Pratici.
2. Usa LaTeX/Simboli se serve (ma leggibili).
3. Se la domanda è fuori contesto, cerca di collegarla alla statistica o rispondi brevemente.
4. Sii conciso ma ESAUSTIVO.
            `.trim();

            // Prepara messaggi (System + History + New User Msg)
            // History deve essere array [{role: 'user/assistant', content: '...'}]
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];

            // Payload manuale (bypass callAPI standard per custom history)
            // Usiamo comunque la logica di callAPI se possibile? 
            // callAPI accetta solo "prompt" (stringa). Dobbiamo estendere callAPI o fare fetch qui?
            // Facciamo fetch diretta qui per gestire la history complessa.

            if (!config || !config.apiKey) return simulateResponse(userMessage);

            try {
                const response = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify({
                        model: config.model,
                        messages: messages,
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                const data = await response.json();
                return data.choices?.[0]?.message?.content || "Scusa, non ho capito.";

            } catch (e) {
                console.error("Chat API Error:", e);
                return "⚠️ Errore di connessione al cervello del Professore.";
            }
        }

        /**
         * Utility interna per parsing JSON sicuro
         */
        function parseJSONResponse(response) {
            if (!response) return null;
            try {
                const match = response.match(/\{[\s\S]*\}/);
                return match ? JSON.parse(match[0]) : null;
            } catch (e) {
                console.error('JSON Parse Error:', e);
                return null;
            }
        }

        function clearCache() {
            responseCache.clear();
            console.log('🗑️ Cache Groq svuotata');
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        /**
         * Simulatore Fallback (Solo se API Key manca o errore)
         */
        function simulateResponse(prompt) {
            if (prompt.includes('LEZIONE MAGISTRALE')) {
                return `<h3>🏛️ Chiave Mancante</h3><p>Per usare l'IA, clicca su <b>Impostazioni</b> e inserisci la tua API Key.</p>`;
            }
            if (prompt.includes('DOMANDA DI ESAME')) {
                return JSON.stringify({
                    question: "Chiave API Mancante",
                    options: ["Inserisci Key", "Usa Demo", "Annulla"],
                    correctIndex: 0,
                    explanation: "Vai nelle impostazioni per configurare l'IA."
                });
            }
            return "Risposta Simulatore: Inserisci API Key nelle Impostazioni.";
        }

        function setApiKey(key) {
            if (key && key.startsWith('gsk_')) {
                localStorage.setItem('groq_api_key', key);
                if (config) config.apiKey = key;
                return true;
            }
            return false;
        }

        // Public API
        return {
            init,
            generateAlternativeExplanation,
            generateQuizQuestion,
            generateFeedback,
            generateAdvancedTheory,
            generateDataPractice,
            generateMasterQuiz,
            generateMasterQuiz,
            clearCache,
            setApiKey,
            sendChatMessage
        };
    })();

    global.GroqAPIClient = Client;
    console.log('✅ GroqAPIClient defined globally (v2.0 Refactored)');

    if (typeof module !== 'undefined' && module.exports) module.exports = Client;

})(typeof window !== 'undefined' ? window : this);
