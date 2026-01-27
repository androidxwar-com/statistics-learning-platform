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
    apiKey: '', // ← Vuoto per sicurezza GitHub

    // Endpoint API
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',

    // Modello consigliato per bilanciamento qualità/velocità
    model: 'llama-3.3-70b-versatile',

    // Parametri generazione
    maxTokens: 1024,
    temperature: 0.7,

    // Modalità demo (usa spiegazioni pre-caricate se true)
    demoMode: true, // ✅ DEMO MODE per GitHub Pages

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
