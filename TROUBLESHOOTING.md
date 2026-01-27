# ⚠️ ERRORE: Come Aprire Correttamente l'Applicazione

## 🚫 Problema CORS

Se vedi l'errore **"Errore nel caricamento dei dati"**, probabilmente hai aperto `index.html` con **doppio click** o trascinandolo nel browser.

**Questo NON funziona!** I browser moderni bloccano il caricamento di file JSON quando la pagina è aperta via protocollo `file://` (per sicurezza CORS).

---

## ✅ Soluzione: Usa Live Server

### Metodo 1: Live Server in VS Code (Raccomandato)

1. **Apri la cartella in VS Code**:
   ```
   File → Open Folder → Seleziona "Ema project"
   ```

2. **Installa Live Server** (se non l'hai già):
   - Click sull'icona Extensions (Ctrl+Shift+X)
   - Cerca "Live Server"
   - Click "Install" sull'estensione di Ritwick Dey

3. **Avvia il server**:
   - Click **destro** su `index.html` nella sidebar
   - Seleziona **"Open with Live Server"**
   - Il browser si apre automaticamente su `http://127.0.0.1:5500`

4. **Verifica**:
   - L'app dovrebbe caricarsi senza errori
   - Console (F12) mostra: `✅ Dati caricati con successo`

---

### Metodo 2: Python HTTP Server

Se non hai VS Code:

```bash
# PowerShell (nella cartella "Ema project")
cd "c:/Users/Fedd/Desktop/Ema project"

# Python 3
python -m http.server 8000

# Poi apri browser su:
# http://localhost:8000
```

---

### Metodo 3: Node.js HTTP Server

Se hai Node.js installato:

```bash
# Installa http-server globalmente
npm install -g http-server

# Avvia nella cartella del progetto
cd "c:/Users/Fedd/Desktop/Ema project"
http-server -p 8000

# Apri: http://localhost:8000
```

---

## 🔍 Come Riconoscere il Problema

**URL SBAGLIATO** (non funziona):
```
file:///C:/Users/Fedd/Desktop/Ema%20project/index.html
```

**URL CORRETTO** (funziona):
```
http://127.0.0.1:5500/index.html
http://localhost:8000/index.html
```

Se nella barra indirizzi vedi `file://`, **è sbagliato!**

---

## 🐛 Debug Console

Apri la Console del browser (F12 o tasto destro → Ispeziona → Console):

**Se vedi**:
```
❌ Access to fetch at 'file:///.../config/topics-structure.json' 
   from origin 'null' has been blocked by CORS policy
```

**Significa**: Stai usando `file://` invece di un server HTTP.

**Soluzione**: Usa Live Server (vedi sopra).

---

## ✅ Verifica Corretta

Quando funziona, dovresti vedere nella console:

```
🚀 Inizializzazione App...
🤖 Groq API Client inizializzato: DEMO MODE
📥 Caricamento dati...
✅ Dati caricati con successo
📥 Stato caricato da localStorage
✅ App inizializzata
```

E l'interfaccia mostra la **Fase 1** con la teoria complessa.

---

## 🆘 Se Ancora Non Funziona

1. **Verifica percorso Live Server**: Deve essere nella root (`Ema project`), non in una sottocartella
2. **Porta già in uso**: Se 5500 è occupata, Live Server userà 5501, 5502, etc.
3. **Cache browser**: Prova hard refresh (Ctrl+Shift+R)
4. **File corrotti**: Verifica che i file JSON in `config/` e `data/` esistano

---

## 📱 Contatti

Se il problema persiste, inviami:
- Screenshot della console (F12)
- URL nella barra indirizzi
- Versione browser (Chrome/Firefox/Edge)

---

**TL;DR**: 
1. Apri **VS Code**
2. Installa **Live Server**
3. Click destro su `index.html` → **Open with Live Server**
4. Problema risolto! ✅
