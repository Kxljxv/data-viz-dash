/**
 * AEA Datepicker Component
 * 
 * A technical, glassmorphic calendar for date selection.
 * Handles month navigation, selection states, and input synchronization.
 */

export class Datepicker {
    constructor(element, options = {}) {
        if (!element) return;
        this.container = element;
        this.options = {
            onSelect: null,
            startDay: 1, // 1 = Monday, 0 = Sunday
            ...options
        };

        // State
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);
        
        const initialDateStr = this.container.dataset.date;
        this.selectedDate = initialDateStr ? new Date(initialDateStr) : null;
        if (this.selectedDate) this.selectedDate.setHours(0, 0, 0, 0);

        this.viewDate = this.selectedDate ? new Date(this.selectedDate) : new Date(this.today);
        this.viewDate.setDate(1); // Start view at 1st of month

        this.init();
    }

    init() {
        this.render();
        this.setupEvents();
    }

    render() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(this.viewDate);

        this.container.innerHTML = `
            <div class="aea-datepicker-header">
                <span class="aea-datepicker-month-year">${monthName} ${year}</span>
                <div class="aea-datepicker-nav">
                    <button class="aea-datepicker-nav-btn" data-nav="prev" aria-label="Previous Month">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button class="aea-datepicker-nav-btn" data-nav="next" aria-label="Next Month">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>
            <div class="aea-datepicker-grid">
                ${this.renderDayHeaders()}
                ${this.renderDays()}
            </div>
        `;
    }

    renderDayHeaders() {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        // Rotate days if startDay is Monday
        const rotatedDays = [...days.slice(this.options.startDay), ...days.slice(0, this.options.startDay)];
        return rotatedDays.map(d => `<div class="aea-datepicker-day-header">${d}</div>`).join('');
    }

    renderDays() {
        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();

        // First day of current month
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        // Adjust for startDay (Monday = 1)
        let emptySlots = (firstDayOfMonth - this.options.startDay + 7) % 7;

        // Days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Days in previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        let html = '';

        // Previous Month's Days
        for (let i = emptySlots - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="aea-datepicker-day aea-datepicker-other-month">${day}</div>`;
        }

        // Current Month's Days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.getTime() === this.today.getTime();
            const isSelected = this.selectedDate && date.getTime() === this.selectedDate.getTime();
            
            const classes = ['aea-datepicker-day'];
            if (isToday) classes.push('aea-datepicker-today');
            if (isSelected) classes.push('aea-datepicker-selected');

            html += `<div class="aea-datepicker-day ${classes.join(' ')}" data-day="${day}">${day}</div>`;
        }

        // Next Month's Days (to fill the grid to 42 cells or just end of row)
        const totalSlots = emptySlots + daysInMonth;
        const remainingSlots = (7 - (totalSlots % 7)) % 7;
        for (let day = 1; day <= remainingSlots; day++) {
            html += `<div class="aea-datepicker-day aea-datepicker-other-month">${day}</div>`;
        }

        return html;
    }

    setupEvents() {
        this.container.addEventListener('click', (e) => {
            const navBtn = e.target.closest('.aea-datepicker-nav-btn');
            if (navBtn) {
                const direction = navBtn.dataset.nav === 'next' ? 1 : -1;
                this.viewDate.setMonth(this.viewDate.getMonth() + direction);
                this.render();
                return;
            }

            const dayEl = e.target.closest('.aea-datepicker-day');
            if (dayEl && !dayEl.classList.contains('aea-datepicker-other-month')) {
                const day = parseInt(dayEl.dataset.day);
                this.selectDate(new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day));
            }
        });
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        this.selectedDate.setHours(0, 0, 0, 0);
        this.render();

        const formatted = this.selectedDate.toISOString().split('T')[0];
        this.container.dataset.date = formatted;

        // Dispatch Event
        this.container.dispatchEvent(new CustomEvent('aea-date-change', {
            detail: { date: this.selectedDate, formatted }
        }));

        if (this.options.onSelect) {
            this.options.onSelect(this.selectedDate, formatted);
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const pickers = document.querySelectorAll('.aea-datepicker');
    pickers.forEach(el => new Datepicker(el));
});
