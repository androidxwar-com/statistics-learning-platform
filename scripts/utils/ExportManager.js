/**
 * ExportManager - Generazione PDF Certificati
 * 
 * Permette di scaricare un riassunto "Ufficiale" del concetto appreso.
 * Usa jsPDF.
 */
const ExportManager = (function () {

    /**
     * Genera e scarica il PDF del concetto corrente
     */
    async function downloadSummary(conceptData) {
        if (typeof window.jspdf === 'undefined') {
            console.error("jsPDF not loaded");
            alert("Errore: Libreria PDF non caricata.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Recupera Stats Utente
        let userXP = 0;
        let mastery = 0;
        if (typeof UserProfile !== 'undefined') {
            const state = UserProfile.getState();
            userXP = state.xp;
            mastery = state.concepts[conceptData.id]?.mastery || 0;
        }

        // --- LAYOUT ---

        // Header
        doc.setFillColor(142, 111, 163); // Lilac #8e6fa3
        doc.rect(0, 0, 210, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Ema Project - Learning Certificate", 105, 13, { align: "center" });

        // Titolo Concetto
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(22);
        doc.text(conceptData.title || "Concetto", 20, 40);

        // Stats Badge
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Mastery Level: ${mastery}% | XP Totali: ${userXP}`, 20, 50);

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 55, 190, 55);

        // Contenuto (Sintesi Fase 2 o Teoria Fase 1)
        // Prendiamo la sintesi se esiste, altrimenti phase1
        let textContent = "";
        if (conceptData.phase2_synthesis && conceptData.phase2_synthesis.text) {
            textContent = stripHTML(conceptData.phase2_synthesis.text);
        } else if (conceptData.phase1_complex && conceptData.phase1_complex.content) {
            textContent = stripHTML(conceptData.phase1_complex.content);
        }

        // Formattazione Testo
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const splitText = doc.splitTextToSize(textContent, 170);

        // Paginazione
        let y = 70;
        const pageHeight = 280;

        splitText.forEach(line => {
            if (y > pageHeight) {
                doc.addPage();
                y = 20;
            }
            doc.text(line, 20, y);
            y += 7;
        });

        // Footer "Verified Source"
        const today = new Date().toLocaleDateString();
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generato il: ${today} • Fonte Verificata • Ema Project`, 105, 290, { align: "center" });

        // Save
        doc.save(`${conceptData.title.replace(/\s+/g, '_')}_Summary.pdf`);
    }

    /**
     * Utility: Rimuove tag HTML per il PDF
     */
    function stripHTML(html) {
        const tmp = document.createElement("DIV");
        // Sostituisci <br> e <p> con newline
        html = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    return {
        downloadSummary
    };

})();

window.ExportManager = ExportManager;
