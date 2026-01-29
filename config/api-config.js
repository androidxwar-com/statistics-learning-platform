/**
 * Groq API Configuration
 * 
 * ⚠️ SICUREZZA: Questa è una versione SAFE per GitHub Pages
 * 
 * Se stai deployando su repository PUBBLICO:
 * - Mantieni apiKey vuota
 * - demoMode: true
 * 
 * Per uso LOCALE con API:
 * - Copia la tua key da .env.txt
 * - demoMode: false
 * - NON fare commit di questo file con la key!
 */

const GROQ_CONFIG = {
    // ⚠️ IMPORTANTE: NON inserire API Key se repository è pubblico!
    // Per uso locale, copia da .env.txt (file ignorato da git)
    // KEY INSERITA AUTOMATICAMENTE
    // ⚠️ IMPORTANT: Never commit real keys to GitHub!
    // Usare variabili d'ambiente o placeholder per il repo pubblico
    apiKey: "YOUR_GROQ_API_KEY_HERE",

    // Endpoint API
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',

    // Modello consigliato per bilanciamento qualità/velocità
    model: 'llama-3.1-8b-instant',

    // Parametri generazione
    maxTokens: 2048,
    temperature: 0.7,

    // Modalità demo (usa spiegazioni pre-caricate se true)
    demoMode: false, // ✅ PRODUCTION MODE LOCAL

    // Rate limiting (millisecondi tra chiamate consecutive)
    rateLimitDelay: 1000,

    // Numero massimo di retry in caso di errore
    maxRetries: 3,

    // Timeout richieste (millisecondi)
    requestTimeout: 30000
};

// ========================================
// 🔧 SETUP LOCALE (non committare!)
// ========================================
// Per attivare API in locale:
// 1. Leggi key da .env.txt
// 2. Decommentare e modificare:
//
// GROQ_CONFIG.apiKey = 'gsk_...'; // Tua key qui
// GROQ_CONFIG.demoMode = false;
//
// 3. Ricorda: .env.txt è in .gitignore
// ========================================
