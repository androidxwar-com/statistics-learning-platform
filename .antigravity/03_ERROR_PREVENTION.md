# 🛡️ ANTIGRAVITY STABILITY PROTOCOL
**Authority:** SYSTEM STABILITY GUARDIAN
**Focus:** Error Prevention, Smart Chunking, High-Value Output

## 1. LA REGOLA DEL "500 RIGHE" (ANTI-CRASH)
> **ERRORE RILEVATO:** "Agent terminated due to error".
> **CAUSA:** Tentativo di generare output monolitici giganti.
> **SOLUZIONE:** Frammentazione obbligatoria.

**Protocollo:**
Se il codice richiesto supera mentalmente le 300 righe o i 3 file diversi, **NON** generarlo tutto insieme.
1.  Dichiara all'utente: "La richiesta è complessa. Attivo la modalità Chunking."
2.  Genera solo il **Core** (es. la logica di backend).
3.  Usa il `NEXT STEP NAVIGATOR` per farti chiedere esplicitamente la parte successiva (es. "Ora chiedimi di generare il Frontend").

## 2. ARRICCHIMENTO MODULARE (SMART SPLIT)
Non limitarti a dividere. **Migliora mentre dividi.**
Invece di darti un file unico "pesante", l'IA deve proporti moduli separati ma più potenti:

* **Invece di:** "Ecco tutto il codice auth." (Rischio Crash)
* **Fai questo:**
    * **Chunk 1 (Struttura):** Configurazione Database + Modelli Utente (Arricchiti con campi per 2FA e Audit Log).
    * **Chunk 2 (Logica):** API Routes per Login/Register (Arricchite con Rate Limiting e controlli IP).
    * **Chunk 3 (UI):** Componenti React per il Form (Arricchiti con validazione Zod in tempo reale e accessibilità).

## 3. CHECKPOINT DI SALVATAGGIO
Ogni risposta deve essere un "Punto di Salvataggio". Il codice deve essere funzionante anche se parziale.
* **Vietato:** Lasciare funzioni a metà (`// ...rest of code`).
* **Obbligatorio:** Se devi tagliare, chiudi il file in modo pulito e dì: "Continua nel prossimo messaggio".

## 4. ISTRUZIONE DI RECUPERO
Se vedi che stai per raggiungere il limite di token o tempo:
1.  **STOP immediato.**
2.  Chiudi i blocchi di codice.
3.  Scrivi: *"⚠️ **PAUSA TATTICA PER EVITARE ERRORI.** Ho completato la Parte A. Seleziona **CONTINUA** per la Parte B."*
## ... [Mantieni le sezioni precedenti su Chunking] ...

## 5. PROTOCOLLO DI "RIANIMAZIONE" (CRASH RECOVERY)
Se il sistema si interrompe con errore o se l'utente deve premere "Continua", NON limitarti ad appendere testo.

**Regola:** Prima di scrivere la nuova riga di codice, devi ri-leggere le ultime 20 righe generate per ristabilire il contesto logico.

**Se l'utente scrive "CONTINUA" dopo un errore, esegui questo check interno:**
1.  **Analisi Integrità:** L'ultimo blocco di codice era chiuso correttamente?
    * *Se NO:* Riscrivi l'ultimo blocco intero da capo (non incollarci pezzi dopo).
2.  **Analisi Variabili:** Ricordo ancora le variabili definite nel "Chunk 1"?
    * *Se NO:* Rileggi il contesto superiore.
3.  **Azione:** Riprendi a generare con un commento esplicito: `// ...Resuming Antigravity Module [Part X]`

## 6. TECNICA "OVERLAP" (SOVRAPPOSIZIONE)
Per evitare "buchi" nel codice:
Quando riprendi dopo un'interruzione, **ripeti sempre le ultime 2-3 righe di codice** del messaggio precedente per garantire che la sintassi (parentesi graffe, virgole) sia perfettamente allineata.