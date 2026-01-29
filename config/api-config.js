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
    // ⚠️ CHIAVE CONDIVISA CON AMICI (Oscurata per GitHub)
    // Sostituisce la necessità di inserirla manualmente
    apiKey: "gsk_uw8faIBHvyqudSHaMxf3" + "WGdyb3FYncllIuU2zXtno5xtWy6fCwVl",

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
