
import fs from 'fs/promises';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Config
const PDF_PATH = './Documentazione/doc1.pdf';
const API_KEY = process.env.GROQ_API_KEY || 'YOUR_API_KEY';

async function testOCR() {
    console.log("🕵️ TESTING OCR CAPABILITY (Vision API)...");

    // 1. Setup Groq
    const groq = new Groq({ apiKey: API_KEY });

    // 2. Load PDF
    const data = await fs.readFile(PDF_PATH);
    const uint8Array = new Uint8Array(data);

    // Disable worker for Node.js environment
    // We assume pdfjs-dist matches the version that doesn't need external worker file setup if using legacy/build/pdf.mjs?
    // Often we need to set GlobalWorkerOptions.workerSrc. 
    // But let's try basic load.

    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        standardFontDataUrl: './node_modules/pdfjs-dist/standard_fonts/'
    });

    const doc = await loadingTask.promise;
    console.log(`PAGE COUNT: ${doc.numPages}`);

    // 3. Render Page 3 (likely to have text, skip cover)
    const pageNum = Math.min(3, doc.numPages);
    const page = await doc.getPage(pageNum);

    const scale = 1.5; // Good resolution for OCR
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    console.log(`Rendering Page ${pageNum}...`);
    await page.render(renderContext).promise;

    // 4. Convert to Base64
    const buffer = canvas.toBuffer('image/png');
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    console.log(`Image generated (${buffer.length} bytes). Sending to Groq Vision...`);

    // 5. Call Vision API
    try {
        // Dynamic Model Selection
        const models = await groq.models.list();
        const visionModels = models.data.filter(m => m.id.includes('vision'));

        if (visionModels.length === 0) {
            throw new Error("No Vision models found in this Groq account!");
        }

        // Prefer 90b, fallback to others
        const selectedModel = visionModels.find(m => m.id.includes('90b'))?.id || visionModels[0].id;
        console.log(`Using Vision Model: ${selectedModel}`);

        const completion = await groq.chat.completions.create({
            model: selectedModel,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Transcribe the text in this document image exactly as it appears. Output ONLY the text." },
                        { type: "image_url", image_url: { url: dataUrl } }
                    ]
                }
            ],
            temperature: 0.1,
            max_tokens: 1024
        });

        console.log("\n📝 TRANSCRIPTION RESULT:");
        console.log("---------------------------------------------------");
        console.log(completion.choices[0].message.content);
        console.log("---------------------------------------------------");
        console.log("✅ OCR SUCCESS!");

    } catch (e) {
        console.error("❌ Groq Vision Error:", e.message);
        if (e.message.includes("model")) console.log("Try checking model availability.");
    }
}

testOCR().catch(console.error);
