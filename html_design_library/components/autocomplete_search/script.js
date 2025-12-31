/**
 * AEAAutocomplete - Singleton controller for custom autocomplete/search components
 * Handles state, accessibility, debouncing, and result rendering.
 */
const AEAAutocomplete = (() => {
    let activeAutocomplete = null;
    let debounceTimer = null;
    let activeIndex = -1;

    /**
     * Initializes all AEA Autocomplete components on the page.
     */
    const init = () => {
        const autocompletes = document.querySelectorAll('.aea-autocomplete');
        autocompletes.forEach(ac => setupAutocomplete(ac));

        // Global click listener to close open autocompletes
        document.addEventListener('click', (e) => {
            if (activeAutocomplete && !activeAutocomplete.contains(e.target)) {
                closeResults(activeAutocomplete);
            }
        });
    };

    /**
     * Sets up event listeners for a single autocomplete instance.
     * @param {HTMLElement} acEl - The autocomplete root element.
     */
    const setupAutocomplete = (acEl) => {
        const input = acEl.querySelector('.aea-autocomplete-input');
        const clearBtn = acEl.querySelector('.aea-autocomplete-clear');

        if (!input) return;

        input.addEventListener('input', (e) => handleInput(acEl, e.target.value));
        input.addEventListener('focus', () => {
            if (input.value.trim().length > 0) {
                openResults(acEl);
            }
        });

        input.addEventListener('keydown', (e) => handleKeydown(acEl, e));

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                acEl.classList.remove('has-value');
                closeResults(acEl);
                input.focus();
            });
        }
    };

    /**
     * Handles input events with debouncing.
     */
    const handleInput = (acEl, value) => {
        const hasValue = value.trim().length > 0;
        acEl.classList.toggle('has-value', hasValue);

        if (debounceTimer) clearTimeout(debounceTimer);

        if (!hasValue) {
            closeResults(acEl);
            return;
        }

        debounceTimer = setTimeout(() => {
            // Trigger the search logic
            performSearch(acEl, value);
        }, 300);
    };

    /**
     * Simulates or triggers a search. In a real app, this would be an API call or local filter.
     */
    const performSearch = (acEl, query) => {
        const resultsContainer = acEl.querySelector('.aea-autocomplete-results');
        if (!resultsContainer) return;

        // Show loading state
        showLoading(acEl);
        openResults(acEl);

        // Simulate API delay
        setTimeout(() => {
            // This is where you would filter your data
            // For the demo, we'll assume data is passed or we use a demo set
            const event = new CustomEvent('aea-autocomplete-search', {
                detail: { query, resultsContainer }
            });
            acEl.dispatchEvent(event);
        }, 400);
    };

    /**
     * Handles keyboard navigation.
     */
    const handleKeydown = (acEl, e) => {
        if (!acEl.classList.contains('is-open')) return;

        const items = acEl.querySelectorAll('.aea-autocomplete-item');
        if (items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
                updateActiveItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                updateActiveItem(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0) {
                    selectItem(acEl, items[activeIndex]);
                }
                break;
            case 'Escape':
                closeResults(acEl);
                break;
            case 'Tab':
                closeResults(acEl);
                break;
        }
    };

    const updateActiveItem = (items) => {
        items.forEach((item, index) => {
            item.classList.toggle('is-active', index === activeIndex);
            if (index === activeIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    const selectItem = (acEl, itemEl) => {
        const value = itemEl.getAttribute('data-value');
        const label = itemEl.querySelector('.aea-autocomplete-item-label').textContent;
        const input = acEl.querySelector('.aea-autocomplete-input');

        input.value = label;
        closeResults(acEl);

        const event = new CustomEvent('aea-autocomplete-select', {
            detail: { value, label, originalItem: itemEl }
        });
        acEl.dispatchEvent(event);
    };

    const openResults = (acEl) => {
        if (activeAutocomplete && activeAutocomplete !== acEl) {
            closeResults(activeAutocomplete);
        }
        acEl.classList.add('is-open');
        activeAutocomplete = acEl;
        activeIndex = -1;
    };

    const closeResults = (acEl) => {
        acEl.classList.remove('is-open');
        if (activeAutocomplete === acEl) {
            activeAutocomplete = null;
        }
        activeIndex = -1;
    };

    const showLoading = (acEl) => {
        const resultsContainer = acEl.querySelector('.aea-autocomplete-results');
        resultsContainer.innerHTML = `
            <div class="aea-autocomplete-loading">
                <div class="aea-autocomplete-spinner"></div>
                Searching...
            </div>
        `;
    };

    /**
     * Helper to render results with highlighting.
     */
    const renderResults = (acEl, groups, query) => {
        const resultsContainer = acEl.querySelector('.aea-autocomplete-results');
        if (!resultsContainer) return;

        if (Object.keys(groups).length === 0) {
            resultsContainer.innerHTML = `<div class="aea-autocomplete-no-results">No results found for "${query}"</div>`;
            return;
        }

        let html = '';
        for (const [groupName, items] of Object.entries(groups)) {
            html += `<div class="aea-autocomplete-group">${groupName}</div>`;
            items.forEach(item => {
                const highlightedLabel = highlightText(item.label, query);
                html += `
                    <div class="aea-autocomplete-item" role="option" data-value="${item.value}">
                        ${item.icon ? `<div class="aea-autocomplete-item-icon">${item.icon}</div>` : ''}
                        <div class="aea-autocomplete-item-label">${highlightedLabel}</div>
                        ${item.meta ? `<div class="aea-autocomplete-item-meta">${item.meta}</div>` : ''}
                    </div>
                `;
            });
        }
        resultsContainer.innerHTML = html;

        // Re-attach click listeners to items
        resultsContainer.querySelectorAll('.aea-autocomplete-item').forEach(item => {
            item.addEventListener('click', () => selectItem(acEl, item));
        });
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="aea-autocomplete-highlight">$1</span>');
    };

    return { init, renderResults, openResults, closeResults };
})();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AEAAutocomplete.init);
} else {
    AEAAutocomplete.init();
}
