# Piattaforma Apprendimento - Probabilità & Statistica

🎓 Piattaforma educativa interattiva per l'apprendimento rigoroso di Probabilità e Inferenza Statistica.

## 🚀 Demo Live

**[Apri la Demo](https://TUOUSERNAME.github.io/NOME-REPO/)** *(aggiorna con il tuo link)*

## ✨ Caratteristiche

- **Sistema a 5 Fasi**: Teoria complessa → Semplificata → Pratica → Quiz Base → Quiz Avanzato
- **Modalità Dual**: 🏠 Casa (calcoli) | 🌍 Fuori Casa (logica)
- **AI Integrato**: Spiegazioni alternative e quiz dinamici via Groq API
- **Design Premium**: Glassmorphism con gradiente rosa-lilla-arancione
- **100% Client-Side**: Nessun backend richiesto

## 📦 Tecnologie

- Vanilla JavaScript (ES6+)
- CSS3 (backdrop-filter, animations)
- Groq API (LLaMA 3.3 70B)
- GitHub Pages ready

## 🎯 Come Usare

1. Scegli modalità (Casa/Fuori Casa)
2. Leggi teoria complessa (Fase 1)
   - Click ❌ "Non mi è chiaro" per spiegazione AI alternativa
3. Teoria semplificata (Fase 2) - auto-advance 30s
4. Esempi pratici (Fase 3)
5. Quiz base (Fase 4) - 3 domande con recovery
6. Quiz avanzato (Fase 5) - simulazione esame

## 🛠️ Setup Locale

```bash
# 1. Clone repository
git clone https://github.com/TUOUSERNAME/NOME-REPO.git
cd NOME-REPO

# 2. Apri in VS Code
code .

# 3. Installa Live Server (estensione VS Code)
# 4. Click destro su index.html → "Open with Live Server"
```

## 🔑 Configurazione Groq API (Opzionale)

Per funzionalità AI complete:

1. Ottieni API key: [console.groq.com](https://console.groq.com)
2. Modifica `config/api-config.js`:
   ```javascript
   apiKey: 'TUA_API_KEY_QUI',
   demoMode: false
   ```

## 📁 Struttura

```
├── index.html              # Entry point
├── config/
│   ├── api-config.js      # Groq API settings
│   └── topics-structure.json
├── data/
│   ├── theory-content.json
│   └── questions-bank.json
├── scripts/
│   ├── core/              # State, API, Controller
│   ├── phases/            # 5 moduli fasi
│   └── utils/             # Data loader
└── styles/                # CSS (main, theory, quiz)
```

## 🚀 Deploy su GitHub Pages

Segui la guida nel file `DEPLOY.md`

## 📚 Contenuti

- ✅ Variabili Casuali Discrete (3 concetti completi)
- ⏳ Variabili Casuali Continue (struttura pronta)
- ⏳ Inferenza Statistica (struttura pronta)

**Totale**: 24 quiz implementati, 14 concetti mappati

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

MIT License - vedi `LICENSE` file

## 🙏 Crediti

- Design: Glassmorphism trend 2024
- AI: Groq (LLaMA 3.3)
- Font: Google Fonts (Poppins)

---

Made with 💜 for education
