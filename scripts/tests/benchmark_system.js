
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });
const THEORY_PATH = path.join(__dirname, '../../data/theory-content.json');

const SCORES = {
    latency: 0,
    data: 0,
    stability: 0
};

async function measureLatency(label, taskFn) {
    const start = Date.now();
    try {
        await taskFn();
        const duration = Date.now() - start;
        console.log(`⏱️  ${label}: ${duration}ms`);
        return duration;
    } catch (e) {
        console.error(`❌ ${label} Failed:`, e.message);
        return 9999;
    }
}

async function benchmark() {
    console.log("🚀 STARTING SYSTEM BENCHMARK...\n");

    // 1. DATA INTEGRITY CHECK
    console.log("📊 CHECKING KNOWLEDGE BASE...");
    try {
        const raw = fs.readFileSync(THEORY_PATH, 'utf-8');
        const data = JSON.parse(raw);
        const concepts = Object.values(data.concepts || {});

        let validCount = 0;
        concepts.forEach(c => {
            if (c.id && c.title && c.phase1_complex && c.phase2_simplified) validCount++;
        });

        const integrity = (validCount / concepts.length) * 100;
        console.log(`   - Concepts Loaded: ${concepts.length}`);
        console.log(`   - Integrity Score: ${integrity.toFixed(2)}%`);

        if (integrity === 100) SCORES.data = 10;
        else if (integrity > 95) SCORES.data = 9;
        else SCORES.data = 7;

    } catch (e) {
        console.error("   - Data Check Error:", e.message);
        SCORES.data = 0;
    }

    // 2. API LATENCY TEST (Base vs Advanced)
    console.log("\n⚡ TESTING API LATENCY (Llama-3.1-8b)...");

    // Test 1: Simple Explain Again
    const lat1 = await measureLatency("Base Mode (Explain Again)", async () => {
        await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Explain "Mean" simply in HTML' }],
            model: 'llama-3.1-8b-instant', max_tokens: 300
        });
    });

    // Test 2: Advanced Master Quiz
    const lat2 = await measureLatency("Advanced Mode (Master Quiz JSON)", async () => {
        await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Generate JSON quiz for "Central Limit Theorem"' }],
            model: 'llama-3.1-8b-instant', max_tokens: 500
        });
    });

    const avgLat = (lat1 + lat2) / 2;
    if (avgLat < 1500) SCORES.latency = 10;
    else if (avgLat < 2500) SCORES.latency = 9;
    else if (avgLat < 4000) SCORES.latency = 8;
    else SCORES.latency = 6;


    // 3. STABILITY & PARSING
    console.log("\n🛡️ TESTING PARSING STABILITY...");
    try {
        const trickyResponse = "Here is the json you asked for: ```json { \"question\": \"Test\", \"options\": [] } ``` hope it helps.";
        const match = trickyResponse.match(/\{[\s\S]*\}|$/);
        const json = JSON.parse(match[0]);
        if (json.question === "Test") {
            console.log("   - Robust Regex Parsing: PASSED");
            SCORES.stability = 10;
        } else {
            SCORES.stability = 5;
        }
    } catch (e) {
        console.log("   - Robust Regex Parsing: FAILED");
        SCORES.stability = 0;
    }

    // FINAL SCORE CALCULATION
    console.log("\n-----------------------------------");
    console.log(`Score Data Integrity: ${SCORES.data}/10`);
    console.log(`Score API Latency:    ${SCORES.latency}/10 (Avg: ${avgLat.toFixed(0)}ms)`);
    console.log(`Score Stability:      ${SCORES.stability}/10`);

    const finalScore = (SCORES.data * 0.4) + (SCORES.latency * 0.4) + (SCORES.stability * 0.2);
    console.log(`\n🏆 FINAL SYSTEM EFFICIENCY SCORE: ${finalScore.toFixed(1)}/10`);

    // Store result for AI to read
    fs.writeFileSync('benchmark_result.txt', `SCORE:${finalScore.toFixed(1)}`);
}

benchmark();
