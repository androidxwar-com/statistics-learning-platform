/**
 * Sidebar Manager - Gestione della Navigazione Laterale
 * 
 * Renderizza la struttura gerarchica degli argomenti e gestisce la navigazione.
 */

const SidebarManager = (function () {
    // Configurazione
    const SELECTORS = {
        container: '#app-sidebar',
        toggleBtn: '#sidebar-toggle',
        content: '#sidebar-content',
        overlay: '#sidebar-overlay'
    };

    let topicsData = null;
    let isVisible = false;

    /**
     * Inizializza la sidebar
     */
    function init(topicsStructure) {
        topicsData = topicsStructure;
        render();
        setupEventListeners();
        updateActiveItem();
    }

    /**
     * Renderizza la struttura HTML della sidebar
     */
    function render() {
        const container = document.querySelector(SELECTORS.content);
        if (!container || !topicsData) return;

        let html = '<div class="sidebar-menu">';

        topicsData.macro_topics.forEach((macro, macroIndex) => {
            const macroNum = macro.order;

            html += `
                <div class="sidebar-macro-topic">
                    <h3>${macro.title}</h3>
                    <div class="sidebar-subtopics">
            `;

            macro.subtopics.forEach((sub, subIndex) => {
                const subNum = `${macroNum}.${sub.order}`;

                html += `
                    <div class="sidebar-subtopic">
                        <h4>${subNum} ${sub.title}</h4>
                        <ul class="sidebar-concepts">
                `;

                sub.concepts.forEach((concept, conceptIndex) => {
                    const conceptNum = `${subNum}.${conceptIndex + 1}`;
                    html += `
                        <li class="sidebar-item" 
                            data-topic="${macro.id}" 
                            data-subtopic="${sub.id}" 
                            data-concept="${concept.id}">
                            <span class="item-number">${conceptNum}</span>
                            <span class="item-title">${concept.title}</span>
                            <span class="item-status"></span>
                        </li>
                    `;
                });

                html += `
                        </ul>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Aggiungi click handlers agli item
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => handleItemClick(item));
        });
    }

    /**
     * Gestisce il click su un argomento
     */
    function handleItemClick(item) {
        const topicId = item.dataset.topic;
        const subtopicId = item.dataset.subtopic;
        const conceptId = item.dataset.concept;

        // Chiudi sidebar su mobile dopo selezione
        if (window.innerWidth <= 768) {
            toggleSidebar(false);
        }

        // Naviga tramite EventBus (Decoupled)
        if (window.EventBus) {
            window.EventBus.emit('NAVIGATE_TO_CONCEPT', { topicId, subtopicId, conceptId });
        } else {
            console.error('EventBus non disponibile');
        }
    }

    /**
     * Aggiorna lo stato visivo degli item (corrente, completato)
     */
    function updateActiveItem() {
        // Usa DataManager se disponibile, o StateManager indirettamente
        // In realtà SidebarManager dovrebbe solo reagire allo stato
        if (typeof StateManager === 'undefined') return;

        const state = StateManager.getState();
        const currentId = state.currentConceptId;
        const completedIds = state.completedConcepts || [];

        document.querySelectorAll('.sidebar-item').forEach(item => {
            const itemId = item.dataset.concept;

            // Reset classi
            item.classList.remove('active', 'completed');

            // Set active
            if (itemId === currentId) {
                item.classList.add('active');
                // Scroll into view se necessario
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Set completed
            if (completedIds.includes(itemId)) {
                item.classList.add('completed');
            }
        });
    }

    /**
     * Setup event listeners globali
     */
    function setupEventListeners() {
        // Toggle button (hamburger)
        const toggleBtn = document.querySelector(SELECTORS.toggleBtn);
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => toggleSidebar());
        }

        // Overlay click (chiudi sidebar)
        const overlay = document.querySelector(SELECTORS.overlay);
        if (overlay) {
            overlay.addEventListener('click', () => toggleSidebar(false));
        }

        // Ascolta cambi di stato (EventBus)
        if (window.EventBus) {
            window.EventBus.on('STATE_UPDATED', () => updateActiveItem());
        }
    }

    /**
     * Apre/Chiude la sidebar
     */
    function toggleSidebar(forceState) {
        const container = document.querySelector(SELECTORS.container);
        const overlay = document.querySelector(SELECTORS.overlay);

        if (typeof forceState === 'boolean') {
            isVisible = forceState;
        } else {
            isVisible = !isVisible;
        }

        if (isVisible) {
            container.classList.add('open');
            overlay.classList.add('visible');
        } else {
            container.classList.remove('open');
            overlay.classList.remove('visible');
        }
    }

    // Public API
    return {
        init,
        updateActiveItem,
        toggleSidebar
    };

})();
