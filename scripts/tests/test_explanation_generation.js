import dotenv from 'dotenv';
import GroqAPIClient from '../core/api-client.js';

dotenv.config();

// Configura mock client se serve, o usa quello vero
const mockConfig = {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    demoMode: false,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 1024,
    temperature: 0.7,
    maxRetries: 2,
    retryDelay: 1000
};

GroqAPIClient.init(mockConfig);

async function testTopics() {
    const testCases = [
        { id: 'vcd-def-base', title: 'Definizione Variabile Casuale', content: 'Una variabile casuale è una funzione...' },
        { id: 'vcd-varianza', title: 'Varianza', content: 'La varianza misura la dispersione...' },
        { id: 'inf-test-errori', title: 'Errori Test Ipotesi', content: 'Errore I tipo è rifiutare H0 vera...' }
    ];

    console.log("🧪 Inizio Test Generazione Spiegazioni su 3 argomenti...\n");

    for (const test of testCases) {
        console.log(`--- Test Argomento: ${test.title} ---`);
        try {
            const explanation = await GroqAPIClient.generateAlternativeExplanation(test.title, test.content, 1);
            if (explanation && explanation.length > 50) {
                console.log(`✅ Successo! Risposta ricevuta (${explanation.length} chars).`);
                console.log(`SAMPLE: ${explanation.substring(0, 60)}...\n`);
            } else {
                console.error(`❌ Fallito: Risposta vuota o troppo breve.`);
            }

            // Test tentativo 2
            console.log(`--- Test Tentativo 2 (Esempio Numerico) per: ${test.title} ---`);
            const explanation2 = await GroqAPIClient.generateAlternativeExplanation(test.title, test.content, 2);
            if (explanation2 && explanation2.includes('2')) { // Check euristico numeri
                console.log(`✅ Successo Tentativo 2! Risposta ricevuta.\n`);
            } else {
                console.log(`⚠️ Tentativo 2 ricevuto ma check numeri non rigoroso. OK comunque.\n`);
            }

        } catch (e) {
            console.error(`❌ Errore critico su ${test.id}:`, e);
        }
    }
}

testTopics();
