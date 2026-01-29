
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

dotenv.config();

// Load GroqAPIClient manually since it is UMD
const GroqAPIClient = require('../core/api-client.js');

// Mock Config
const config = {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant', // Fast model for interaction
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 1024,
    temperature: 0.7,
    maxRetries: 3,
    retryDelay: 1000
};

async function testExplainAgain() {
    console.log("🧪 TESTING 'Explain Again' Feature (Base Mode Task 1/5)...");

    // Initialize
    GroqAPIClient.init(config);

    // Test Data (from theory-content.json)
    const testConcept = {
        title: "Teorema del Limite Centrale",
        phase1_complex: {
            title: "Teorema del Limite Centrale",
            content: "Il teorema del limite centrale afferma che la somma di variabili casuali indipendenti e identicamente distribuite converge in distribuzione a una normale standard.",
            mathFormulas: ["\\sqrt{n}(\\bar{X}_n - \\mu) \\xrightarrow{d} N(0, \\sigma^2)"]
        }
    };

    const originalExplanation = testConcept.phase1_complex.content;

    console.log(`\n📝 Concept: ${testConcept.title}`);
    console.log(`📄 Original: "${originalExplanation}"`);
    console.log("\n🔄 Simulating User Click: '❌ Non mi è chiaro'...");

    const startTime = Date.now();

    try {
        // Simulate Attempt 1 (Analogy Strategy)
        const attempt1 = await GroqAPIClient.generateAlternativeExplanation(
            testConcept.title,
            testConcept, // Full context
            1
        );

        const duration = Date.now() - startTime;

        console.log(`\n✅ Response Received in ${duration}ms`);
        console.log("---------------------------------------------------");
        console.log(attempt1); // Output raw HTML
        console.log("---------------------------------------------------");

        // VALIDATION
        if (!attempt1) throw new Error("Empty response");
        if (!attempt1.includes('<h3>')) throw new Error("Missing HTML headers <h3>");
        if (attempt1.includes('**')) console.warn("⚠️ Warning: Output contains Markdown (**), expected pure HTML.");

        console.log("\n✨ TEST PASSED: 'Explain Again' is functional and responsive.");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e.message);
        process.exit(1);
    }
}

testExplainAgain();
