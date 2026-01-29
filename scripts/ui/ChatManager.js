/**
 * ChatManager - Gestione del Tutor Virtuale
 * 
 * Gestisce l'interfaccia "Drawer" laterale della chat.
 * Integra chiamate a GroqAPIClient mantenendo il contesto.
 */

const ChatManager = (function () {

    // Configurazione UI
    const SELECTORS = {
        container: '#chat-drawer',
        input: '#chat-input',
        sendBtn: '#chat-send-btn',
        messages: '#chat-messages',
        toggleBtn: '#chat-toggle-btn',
        closeBtn: '#chat-close-btn',
        overlay: '#chat-overlay', // Backgound dim
        floatingBtn: '#chat-floating-btn'
    };

    let chatHistory = [];
    let isOpen = false;

    /**
     * Inizializza il Chat Manager
     */
    function init() {
        injectHTML();
        setupEventListeners();
        console.log("🤖 ChatManager caricato.");
    }

    /**
     * Inietta l'HTML del Drawer nella pagina
     */
    function injectHTML() {
        if (document.getElementById('chat-drawer')) return;

        const html = `
            <!-- Floating Button for Easy Access -->
            <button id="chat-floating-btn" title="Chiedi al Tutor">
                🤖
            </button>

            <div id="chat-overlay" class="chat-overlay"></div>
            <div id="chat-drawer" class="chat-drawer">
                <div class="chat-header">
                    <div class="chat-title">
                        <span class="chat-icon">🎓</span> 
                        <div class="chat-info">
                            <h3>Prof. Statistica</h3>
                            <span id="chat-context-status">Pronto ad aiutarti</span>
                        </div>
                    </div>
                    <button id="chat-close-btn" class="btn-icon">✖</button>
                </div>
                
                <div id="chat-messages" class="chat-messages">
                    <div class="message ai">
                        <div class="bubble">
                            Ciao! 👋 Sono il tuo Tutor personale.<br>
                            Sto seguendo la tua lezione. Chiedimi pure spiegazioni su formule o concetti! 
                        </div>
                    </div>
                </div>

                <div class="chat-footer">
                    <div class="input-group">
                        <textarea id="chat-input" placeholder="Chiedi qualcosa sul concetto..." rows="1"></textarea>
                        <button id="chat-send-btn">➤</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    /**
     * Setup Event Listeners
     */
    function setupEventListeners() {
        document.getElementById('chat-close-btn').addEventListener('click', () => toggleChat(false));
        document.getElementById('chat-overlay').addEventListener('click', () => toggleChat(false));

        // Floating Button
        const floatBtn = document.getElementById('chat-floating-btn');
        if (floatBtn) floatBtn.addEventListener('click', () => toggleChat(true));

        const sendBtn = document.getElementById('chat-send-btn');
        const input = document.getElementById('chat-input');

        sendBtn.addEventListener('click', handleSend);

        // Send on Enter (shift+enter per a capo)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.value === '') this.style.height = 'auto';
        });
    }

    /**
     * Apre/Chiude la chat
     */
    function toggleChat(open) {
        // Se non specificato, toggle
        if (typeof open !== 'boolean') {
            open = !isOpen;
        }
        isOpen = open;

        const drawer = document.querySelector(SELECTORS.container);
        const overlay = document.querySelector(SELECTORS.overlay);

        if (isOpen) {
            drawer.classList.add('open');
            overlay.classList.add('visible');
            setTimeout(() => document.querySelector(SELECTORS.input).focus(), 300);

            // Aggiorna contesto visivo
            updateContextStatus();
        } else {
            drawer.classList.remove('open');
            overlay.classList.remove('visible');
        }
    }

    /**
     * Aggiorna l'indicatore del contesto
     */
    function updateContextStatus() {
        const statusEl = document.getElementById('chat-context-status');
        const state = StateManager.getState();
        const meta = DataManager.getConceptMetadata(state.currentConceptId);

        if (meta) {
            statusEl.textContent = `Contesto: ${meta.title}`;
            statusEl.classList.add('active');
        } else {
            statusEl.textContent = "Contesto Generale";
            statusEl.classList.remove('active');
        }
    }

    /**
     * Gestisce l'invio del messaggio
     */
    async function handleSend() {
        const input = document.querySelector(SELECTORS.input);
        const text = input.value.trim();

        if (!text) return;

        // 1. Pulisci input e mostra messaggio utente
        input.value = '';
        input.style.height = 'auto';
        appendMessage('user', text);

        // 2. Mostra typing indicator
        const loadingId = appendTypingIndicator();

        // 3. Prepara Contesto
        const state = StateManager.getState();
        const contextData = DataManager.getConceptTheory(state.currentConceptId);

        try {
            // 4. Chiama API
            const response = await GroqAPIClient.sendChatMessage(text, chatHistory, contextData);

            // 5. Rimuovi typing e mostra risposta
            removeMessage(loadingId);
            appendMessage('ai', response);

        } catch (error) {
            console.error("Chat Error:", error);
            removeMessage(loadingId);
            appendMessage('ai', "⚠️ Errore di connessione. Riprova tra poco.");
        }
    }

    /**
     * Aggiunge un messaggio alla UI
     */
    function appendMessage(role, text) {
        const container = document.querySelector(SELECTORS.messages);

        // Aggiorna entry history interna
        if (role !== 'system') { // System messages/typing not stored in API history usually
            chatHistory.push({ role: role === 'user' ? 'user' : 'assistant', content: text });
            // Limita history a ultimi 10 msg per risparmiare token
            if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role} animated fadeInUp`;

        // Formatta markdown semplice nel rendering
        // (Per ora HTML grezzo sicuro o text content)
        const formattedText = formatText(text);

        msgDiv.innerHTML = `
            <div class="bubble">
                ${formattedText}
            </div>
        `;

        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        return msgDiv.id = 'msg-' + Date.now();
    }

    function appendTypingIndicator() {
        const container = document.querySelector(SELECTORS.messages);
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ai typing`;
        msgDiv.id = 'typing-' + Date.now();
        msgDiv.innerHTML = `
            <div class="bubble">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
        `;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        return msgDiv.id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function formatText(text) {
        // Simple formatter: Bold e Newlines
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
            .replace(/\n/g, '<br>'); // Newlines

        // Latex-style math handling (basic)
        // Se Groq ritorna LaTeX blocks \[ ... \]
        // html = html.replace(/\\\[(.*?)\\\]/g, '<div class="math-block">$1</div>');

        return html;
    }

    // Public API
    return {
        init,
        toggleChat
    };

})();

// Export globale
window.ChatManager = ChatManager;
