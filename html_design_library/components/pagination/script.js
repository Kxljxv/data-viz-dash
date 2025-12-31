/**
 * AEA Pagination Interactive Logic
 * Handles state switching for the demo and provides a base for implementation.
 */

document.addEventListener('DOMContentLoaded', () => {
    initInteractivePagination();
});

function initInteractivePagination() {
    const container = document.getElementById('interactive-pagination');
    if (!container) return;

    const pageButtons = container.querySelectorAll('.aea-pagination-item[data-page]');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const displayVal = document.getElementById('current-page-val');

    let currentPage = 1;
    const totalPages = pageButtons.length;

    const updateUI = () => {
        // Update active state
        pageButtons.forEach(btn => {
            if (parseInt(btn.dataset.page) === currentPage) {
                btn.classList.add('aea-pagination-active');
                btn.setAttribute('aria-current', 'page');
            } else {
                btn.classList.remove('aea-pagination-active');
                btn.removeAttribute('aria-current');
            }
        });

        // Update Prev/Next disabled states
        if (currentPage === 1) {
            prevBtn.classList.add('aea-pagination-disabled');
            prevBtn.setAttribute('aria-disabled', 'true');
        } else {
            prevBtn.classList.remove('aea-pagination-disabled');
            prevBtn.removeAttribute('aria-disabled');
        }

        if (currentPage === totalPages) {
            nextBtn.classList.add('aea-pagination-disabled');
            nextBtn.setAttribute('aria-disabled', 'true');
        } else {
            nextBtn.classList.remove('aea-pagination-disabled');
            nextBtn.removeAttribute('aria-disabled');
        }

        // Update display text
        if (displayVal) {
            displayVal.textContent = currentPage;
        }
    };

    // Page number clicks
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            updateUI();
        });
    });

    // Prev click
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateUI();
        }
    });

    // Next click
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateUI();
        }
    });

    // Initial UI state
    updateUI();
}
