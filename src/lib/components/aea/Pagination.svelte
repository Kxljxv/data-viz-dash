<script>
    import { IconChevronLeft, IconChevronRight } from '@tabler/icons-svelte';

    /**
     * @typedef {Object} Props
     * @property {number} [currentPage] - The current active page
     * @property {number} [totalPages] - Total number of pages
     * @property {boolean} [glass] - Whether to use the glassmorphic variation
     * @property {string} [class] - Additional CSS classes
     * @property {function} [onPageChange] - Callback when page changes
     */

    /** @type {Props} */
    let { 
        currentPage = 1, 
        totalPages = 1, 
        glass = false, 
        class: className = '',
        onPageChange = () => {}
    } = $props();

    function handlePageClick(page, event) {
        event.preventDefault();
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    }

    // Generate page numbers to display
    let pages = $derived.by(() => {
        const items = [];
        const delta = 2; // Number of pages to show around current page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                items.push(i);
            } else if (
                (i === currentPage - delta - 1) || 
                (i === currentPage + delta + 1)
            ) {
                items.push('...');
            }
        }
        return items.filter((item, index, self) => self.indexOf(item) === index);
    });
</script>

<nav 
    class="aea-pagination {glass ? 'aea-pagination-glass' : ''} {className}" 
    aria-label="Page navigation"
>
    <ul class="aea-pagination-list">
        <li>
            <button 
                class="aea-pagination-item {currentPage === 1 ? 'aea-pagination-disabled' : ''}" 
                onclick={(e) => handlePageClick(currentPage - 1, e)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <IconChevronLeft size={16} /> <span class="aea-pagination-desktop-only ml-1">Prev</span>
            </button>
        </li>

        {#each pages as page}
            <li>
                {#if page === '...'}
                    <span class="aea-pagination-ellipsis">...</span>
                {:else}
                    <button 
                        class="aea-pagination-item {currentPage === page ? 'aea-pagination-active' : ''}" 
                        onclick={(e) => handlePageClick(page, e)}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                {/if}
            </li>
        {/each}

        <li>
            <button 
                class="aea-pagination-item {currentPage === totalPages ? 'aea-pagination-disabled' : ''}" 
                onclick={(e) => handlePageClick(currentPage + 1, e)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <span class="aea-pagination-desktop-only mr-1">Next</span> <IconChevronRight size={16} />
            </button>
        </li>
    </ul>
</nav>
