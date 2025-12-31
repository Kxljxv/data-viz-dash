/**
 * AEASelect - Singleton controller for custom select inputs
 * Handles state, accessibility, and search filtering.
 */
const AEASelect = (() => {
    let activeSelect = null;

    /**
     * Initializes all AEA Select components on the page.
     */
    const init = () => {
        const selects = document.querySelectorAll('.aea-select');
        selects.forEach(select => setupSelect(select));

        // Global click listener to close open selects
        document.addEventListener('click', (e) => {
            if (activeSelect && !activeSelect.contains(e.target)) {
                closeSelect(activeSelect);
            }
        });

        // Global keyboard listener
        document.addEventListener('keydown', handleGlobalKeydown);
    };

    /**
     * Sets up an individual select component.
     * @param {HTMLElement} selectEl - The select container element.
     */
    const setupSelect = (selectEl) => {
        const trigger = selectEl.querySelector('.aea-select-trigger');
        const menu = selectEl.querySelector('.aea-select-menu');
        const searchInput = selectEl.querySelector('.aea-select-search');
        const options = Array.from(selectEl.querySelectorAll('.aea-select-option'));

        // Toggle menu on trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectEl.classList.contains('is-open')) {
                closeSelect(selectEl);
            } else {
                openSelect(selectEl);
            }
        });

        // Option selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                selectOption(selectEl, option);
                closeSelect(selectEl);
            });
        });

        // Search filtering
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterOptions(selectEl, e.target.value);
            });
            
            // Prevent search clicks from closing the menu
            searchInput.addEventListener('click', (e) => e.stopPropagation());
        }
    };

    const openSelect = (selectEl) => {
        // Close any other open select first
        if (activeSelect && activeSelect !== selectEl) {
            closeSelect(activeSelect);
        }

        selectEl.classList.add('is-open');
        activeSelect = selectEl;
        
        const trigger = selectEl.querySelector('.aea-select-trigger');
        trigger.setAttribute('aria-expanded', 'true');

        // Focus search if present
        const searchInput = selectEl.querySelector('.aea-select-search');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 50);
        } else {
            // Otherwise highlight first selected or first option
            highlightOption(selectEl, 'first');
        }

        // Check if menu overflows viewport bottom
        adjustMenuPosition(selectEl);
    };

    const closeSelect = (selectEl) => {
        selectEl.classList.remove('is-open');
        const trigger = selectEl.querySelector('.aea-select-trigger');
        trigger.setAttribute('aria-expanded', 'false');
        
        // Reset trigger styles
        trigger.style.borderTopLeftRadius = '';
        trigger.style.borderTopRightRadius = '';
        trigger.style.borderBottomLeftRadius = '';
        trigger.style.borderBottomRightRadius = '';

        // Clear highlights and search
        clearHighlights(selectEl);
        const searchInput = selectEl.querySelector('.aea-select-search');
        if (searchInput) {
            searchInput.value = '';
            filterOptions(selectEl, '');
        }

        if (activeSelect === selectEl) {
            activeSelect = null;
        }
    };

    const selectOption = (selectEl, option) => {
        const value = option.dataset.value;
        const label = option.querySelector('.aea-select-option-label')?.textContent || option.textContent;
        const triggerValue = selectEl.querySelector('.aea-select-trigger-value');
        
        // Update trigger display
        if (triggerValue) {
            triggerValue.textContent = label;
        }

        // Update selected state in DOM
        selectEl.querySelectorAll('.aea-select-option').forEach(opt => {
            opt.classList.remove('is-selected');
            opt.setAttribute('aria-selected', 'false');
        });
        option.classList.add('is-selected');
        option.setAttribute('aria-selected', 'true');

        // Dispatch custom event
        const event = new CustomEvent('aea-select-change', {
            detail: { value, label, element: selectEl }
        });
        selectEl.dispatchEvent(event);
    };

    const filterOptions = (selectEl, query) => {
        const options = Array.from(selectEl.querySelectorAll('.aea-select-option'));
        const noResults = selectEl.querySelector('.aea-select-no-results');
        const lowerQuery = query.toLowerCase().trim();
        let visibleCount = 0;

        options.forEach(option => {
            const label = (option.querySelector('.aea-select-option-label')?.textContent || option.textContent).toLowerCase();
            const matches = label.includes(lowerQuery);
            option.style.display = matches ? 'flex' : 'none';
            if (matches) visibleCount++;
        });

        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Highlight first visible result
        if (visibleCount > 0) {
            highlightOption(selectEl, 'first-visible');
        }
    };

    const highlightOption = (selectEl, target) => {
        const options = Array.from(selectEl.querySelectorAll('.aea-select-option:not([style*="display: none"])'));
        if (options.length === 0) return;

        clearHighlights(selectEl);

        let toHighlight;
        if (target === 'first' || target === 'first-visible') {
            toHighlight = options.find(opt => opt.classList.contains('is-selected')) || options[0];
        } else if (target === 'next') {
            const current = options.findIndex(opt => opt.classList.contains('is-highlighted'));
            toHighlight = options[(current + 1) % options.length];
        } else if (target === 'prev') {
            const current = options.findIndex(opt => opt.classList.contains('is-highlighted'));
            toHighlight = options[(current - 1 + options.length) % options.length];
        }

        if (toHighlight) {
            toHighlight.classList.add('is-highlighted');
            toHighlight.scrollIntoView({ block: 'nearest' });
        }
    };

    const clearHighlights = (selectEl) => {
        selectEl.querySelectorAll('.aea-select-option').forEach(opt => {
            opt.classList.remove('is-highlighted');
        });
    };

    const adjustMenuPosition = (selectEl) => {
        const trigger = selectEl.querySelector('.aea-select-trigger');
        const menu = selectEl.querySelector('.aea-select-menu');
        const rect = menu.getBoundingClientRect();
        const overflowBottom = rect.bottom > window.innerHeight;
        
        if (overflowBottom) {
            menu.style.top = 'auto';
            menu.style.bottom = '100%';
            menu.style.marginTop = '0';
            menu.style.marginBottom = '-1px';
            menu.style.borderTop = '1px solid hsla(var(--border-300) / 0.2)';
            menu.style.borderBottom = 'none';
            menu.style.borderTopLeftRadius = '0.75rem';
            menu.style.borderTopRightRadius = '0.75rem';
            menu.style.borderBottomLeftRadius = '0';
            menu.style.borderBottomRightRadius = '0';
            
            trigger.style.borderTopLeftRadius = '0';
            trigger.style.borderTopRightRadius = '0';
            trigger.style.borderBottomLeftRadius = '0.75rem';
            trigger.style.borderBottomRightRadius = '0.75rem';
        } else {
            menu.style.top = '100%';
            menu.style.bottom = 'auto';
            menu.style.marginTop = '-1px';
            menu.style.marginBottom = '0';
            menu.style.borderTop = 'none';
            menu.style.borderBottom = '1px solid hsla(var(--border-300) / 0.2)';
            menu.style.borderTopLeftRadius = '0';
            menu.style.borderTopRightRadius = '0';
            menu.style.borderBottomLeftRadius = '0.75rem';
            menu.style.borderBottomRightRadius = '0.75rem';
            
            trigger.style.borderTopLeftRadius = '0.75rem';
            trigger.style.borderTopRightRadius = '0.75rem';
            trigger.style.borderBottomLeftRadius = '0';
            trigger.style.borderBottomRightRadius = '0';
        }
    };

    const handleGlobalKeydown = (e) => {
        if (!activeSelect) return;

        switch (e.key) {
            case 'Escape':
                closeSelect(activeSelect);
                break;
            case 'ArrowDown':
                e.preventDefault();
                highlightOption(activeSelect, 'next');
                break;
            case 'ArrowUp':
                e.preventDefault();
                highlightOption(activeSelect, 'prev');
                break;
            case 'Enter':
                const highlighted = activeSelect.querySelector('.aea-select-option.is-highlighted');
                if (highlighted) {
                    selectOption(activeSelect, highlighted);
                    closeSelect(activeSelect);
                }
                break;
            case 'Tab':
                closeSelect(activeSelect);
                break;
        }
    };

    return { init, openSelect, closeSelect, selectOption };
})();

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => AEASelect.init());
