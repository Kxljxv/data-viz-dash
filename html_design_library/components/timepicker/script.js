/**
 * AEA Timepicker
 * A glassmorphic, dual-column time selection component for the Cyberpunk-Lite aesthetic.
 */
export class Timepicker {
    constructor(container, options = {}) {
        if (!container) return;
        
        this.container = container;
        this.input = container.querySelector('input');
        this.options = {
            format: '24h',
            onSelect: null,
            ...options
        };

        this.isOpen = false;
        this.selectedHour = null;
        this.selectedMinute = null;
        
        this.init();
    }

    init() {
        // Initialize from input value if present
        if (this.input.value) {
            const [h, m] = this.input.value.split(':');
            this.selectedHour = parseInt(h);
            this.selectedMinute = parseInt(m);
        }

        this.createPopover();
        this.attachEvents();
    }

    createPopover() {
        this.popover = document.createElement('div');
        this.popover.className = 'aea-timepicker-popover';
        
        // Hour Column
        const hourCol = document.createElement('div');
        hourCol.className = 'aea-timepicker-column';
        hourCol.innerHTML = '<div class="aea-timepicker-header">Hour</div>';
        for (let i = 0; i < 24; i++) {
            const opt = this.createOption(i.toString().padStart(2, '0'), i, 'hour');
            hourCol.appendChild(opt);
        }

        // Separator
        const separator = document.createElement('div');
        separator.className = 'aea-timepicker-separator';
        separator.textContent = ':';

        // Minute Column
        const minuteCol = document.createElement('div');
        minuteCol.className = 'aea-timepicker-column';
        minuteCol.innerHTML = '<div class="aea-timepicker-header">Min</div>';
        for (let i = 0; i < 60; i += 5) { // 5-minute increments by default
            const opt = this.createOption(i.toString().padStart(2, '0'), i, 'minute');
            minuteCol.appendChild(opt);
        }

        this.popover.appendChild(hourCol);
        this.popover.appendChild(separator);
        this.popover.appendChild(minuteCol);
        
        this.container.appendChild(this.popover);
    }

    createOption(label, value, type) {
        const opt = document.createElement('div');
        opt.className = 'aea-timepicker-option';
        opt.textContent = label;
        opt.dataset.value = value;
        opt.dataset.type = type;
        
        if (type === 'hour' && value === this.selectedHour) opt.classList.add('aea-selected');
        if (type === 'minute' && value === this.selectedMinute) opt.classList.add('aea-selected');

        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectOption(type, value);
        });

        return opt;
    }

    attachEvents() {
        this.input.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePopover();
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && this.isOpen) {
                this.closePopover();
            }
        });

        // Keyboard Navigation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.togglePopover();
            } else if (e.key === 'Escape' && this.isOpen) {
                this.closePopover();
            }
        });
    }

    togglePopover() {
        if (this.isOpen) {
            this.closePopover();
        } else {
            this.openPopover();
        }
    }

    openPopover() {
        this.isOpen = true;
        this.popover.classList.add('aea-open');
        this.input.setAttribute('aria-expanded', 'true');
        
        // Scroll to selected values
        this.scrollToSelected();
    }

    closePopover() {
        this.isOpen = false;
        this.popover.classList.remove('aea-open');
        this.input.setAttribute('aria-expanded', 'false');
    }

    selectOption(type, value) {
        const col = this.popover.querySelectorAll(`.aea-timepicker-option[data-type="${type}"]`);
        col.forEach(opt => opt.classList.remove('aea-selected'));
        
        const selectedOpt = this.popover.querySelector(`.aea-timepicker-option[data-type="${type}"][data-value="${value}"]`);
        if (selectedOpt) selectedOpt.classList.add('aea-selected');

        if (type === 'hour') this.selectedHour = value;
        if (type === 'minute') this.selectedMinute = value;

        this.updateInput();

        // Close if both are selected (optional UX choice)
        if (this.selectedHour !== null && this.selectedMinute !== null) {
            // Slight delay for visual feedback
            setTimeout(() => this.closePopover(), 150);
        }
    }

    updateInput() {
        const h = this.selectedHour !== null ? this.selectedHour.toString().padStart(2, '0') : '--';
        const m = this.selectedMinute !== null ? this.selectedMinute.toString().padStart(2, '0') : '--';
        
        if (this.selectedHour !== null && this.selectedMinute !== null) {
            this.input.value = `${h}:${m}`;
            if (this.options.onSelect) {
                this.options.onSelect(`${h}:${m}`);
            }
            
            this.container.dispatchEvent(new CustomEvent('aea-time-change', {
                detail: { hour: this.selectedHour, minute: this.selectedMinute, formatted: `${h}:${m}` }
            }));
        }
    }

    scrollToSelected() {
        const selected = this.popover.querySelectorAll('.aea-selected');
        selected.forEach(opt => {
            const col = opt.parentElement;
            col.scrollTop = opt.offsetTop - col.offsetTop - (col.clientHeight / 2) + (opt.clientHeight / 2);
        });
    }
}

// Initialize demo
document.addEventListener('DOMContentLoaded', () => {
    const demo1 = document.getElementById('timepicker-demo-1');
    const demo2 = document.getElementById('timepicker-demo-2');
    
    if (demo1) new Timepicker(demo1);
    if (demo2) new Timepicker(demo2);
});
