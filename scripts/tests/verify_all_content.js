
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(__dirname, '../../data/theory-content.json');

function verifyAll() {
    console.log("🔍 STARTING FULL CONTENT VERIFICATION...");

    try {
        const raw = fs.readFileSync(CONTENT_PATH, 'utf-8');
        const data = JSON.parse(raw);
        const concepts = Object.values(data.concepts || {});

        let valid = 0;
        let hybrid = 0;
        let broken = 0;
        const brokenIDs = [];
        const hybridIDs = [];

        console.log(`📂 Scanning ${concepts.length} concepts...\n`);

        concepts.forEach(c => {
            const p1 = c.phase1_complex || {};

            if (p1.content && p1.content.trim().length > 0) {
                valid++;
            } else if (p1.definition && p1.definition.trim().length > 0) {
                hybrid++;
                hybridIDs.push(c.id);
            } else {
                broken++;
                brokenIDs.push({ id: c.id, title: c.title });
            }
        });

        console.log("---------------------------------------------------");
        console.log(`✅ STANDARD (Content field):    ${valid}`);
        console.log(`⚠️ HYBRID   (Definition field): ${hybrid}`);
        console.log(`❌ BROKEN   (Empty/Missing):    ${broken}`);
        console.log("---------------------------------------------------");

        if (hybrid > 0) {
            console.log("\n⚠️ HYBRID CONCEPTS (Auto-Fixed by Schema Adaption):");
            console.log(hybridIDs.slice(0, 10).join(', ') + (hybridIDs.length > 10 ? '...' : ''));
        }

        if (broken > 0) {
            console.log("\n❌ BROKEN CONCEPTS (ACTION REQUIRED):");
            brokenIDs.forEach(b => console.log(`   - [${b.id}] ${b.title}`));
        } else {
            console.log("\n✨ ALL CONCEPTS ARE RENDERABLE!");
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e.message);
    }
}

verifyAll();
