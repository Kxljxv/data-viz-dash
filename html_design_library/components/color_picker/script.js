/**
 * AEA Color Picker Component
 * 
 * A technical, high-precision color picker with HSV model support,
 * hex/rgb inputs, and Cyberpunk-Lite aesthetic.
 */

export class ColorPicker {
    constructor(element) {
        if (!element) return;
        this.picker = element;
        
        // UI Elements
        this.saturationArea = this.picker.querySelector('.aea-color-picker-saturation');
        this.reticle = this.picker.querySelector('.aea-color-picker-reticle');
        this.hueSlider = this.picker.querySelector('.aea-color-picker-hue');
        this.hueHandle = this.picker.querySelector('.aea-color-picker-hue-handle');
        this.swatch = this.picker.querySelector('.aea-color-picker-swatch');
        
        this.hexInput = this.picker.querySelector('.aea-color-picker-input-hex');
        this.rInput = this.picker.querySelector('[data-rgb="r"]');
        this.gInput = this.picker.querySelector('[data-rgb="g"]');
        this.bInput = this.picker.querySelector('[data-rgb="b"]');
        
        // State (HSV)
        this.h = 0;   // 0-360
        this.s = 100; // 0-100
        this.v = 100; // 0-100
        
        this.isDraggingSaturation = false;
        this.isDraggingHue = false;

        this.init();
    }

    init() {
        // Initial color from data attribute or default
        const initialColor = this.picker.dataset.color || '#ff0000';
        this.setColorFromHex(initialColor);

        // Saturation Events
        this.saturationArea.addEventListener('mousedown', (e) => this.startDraggingSaturation(e));
        this.hueSlider.addEventListener('mousedown', (e) => this.startDraggingHue(e));
        
        // Global Mouse Events
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        // Input Events
        this.hexInput.addEventListener('change', () => this.handleHexInput());
        [this.rInput, this.gInput, this.bInput].forEach(input => {
            input.addEventListener('change', () => this.handleRGBInput());
        });

        // Accessibility: Keyboard
        this.picker.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        this.updateUI();
    }

    // --- Color Math ---

    hsvToRgb(h, s, v) {
        s /= 100;
        v /= 100;
        let c = v * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = v - c;
        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
        else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;
        let d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    }

    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // --- State Setters ---

    setColorFromHex(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) {
            const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
            this.h = hsv.h;
            this.s = hsv.s;
            this.v = hsv.v;
            this.hexInput.classList.remove('aea-error');
            this.updateUI();
        } else {
            this.hexInput.classList.add('aea-error');
        }
    }

    // --- Event Handlers ---

    startDraggingSaturation(e) {
        this.isDraggingSaturation = true;
        this.handleSaturationMove(e);
    }

    startDraggingHue(e) {
        this.isDraggingHue = true;
        this.handleHueMove(e);
    }

    stopDragging() {
        this.isDraggingSaturation = false;
        this.isDraggingHue = false;
    }

    handleMouseMove(e) {
        if (this.isDraggingSaturation) this.handleSaturationMove(e);
        if (this.isDraggingHue) this.handleHueMove(e);
    }

    handleSaturationMove(e) {
        const rect = this.saturationArea.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        this.s = (x / rect.width) * 100;
        this.v = 100 - (y / rect.height) * 100;
        this.updateUI();
        this.dispatchChange();
    }

    handleHueMove(e) {
        const rect = this.hueSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        this.h = (x / rect.width) * 360;
        this.updateUI();
        this.dispatchChange();
    }

    handleHexInput() {
        this.setColorFromHex(this.hexInput.value);
        this.dispatchChange();
    }

    handleRGBInput() {
        const r = parseInt(this.rInput.value) || 0;
        const g = parseInt(this.gInput.value) || 0;
        const b = parseInt(this.bInput.value) || 0;
        const hsv = this.rgbToHsv(r, g, b);
        this.h = hsv.h;
        this.s = hsv.s;
        this.v = hsv.v;
        this.updateUI();
        this.dispatchChange();
    }

    handleKeyboard(e) {
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowRight') this.h = (this.h + step) % 360;
        if (e.key === 'ArrowLeft') this.h = (this.h - step + 360) % 360;
        // Could add saturation/value keys if focused on saturation area
        this.updateUI();
        this.dispatchChange();
    }

    // --- UI Updates ---

    updateUI() {
        const rgb = this.hsvToRgb(this.h, this.s, this.v);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        const pureHueRgb = this.hsvToRgb(this.h, 100, 100);
        const pureHueHex = this.rgbToHex(pureHueRgb.r, pureHueRgb.g, pureHueRgb.b);

        // Saturation area background
        this.saturationArea.style.backgroundColor = pureHueHex;

        // Reticle position
        this.reticle.style.left = `${this.s}%`;
        this.reticle.style.top = `${100 - this.v}%`;

        // Hue handle position
        this.hueHandle.style.left = `${(this.h / 360) * 100}%`;

        // Swatch
        this.swatch.style.backgroundColor = hex;

        // Inputs
        this.hexInput.value = hex;
        this.rInput.value = rgb.r;
        this.gInput.value = rgb.g;
        this.bInput.value = rgb.b;
        
        // Custom Event
        this.picker.style.setProperty('--current-color', hex);
    }

    dispatchChange() {
        const rgb = this.hsvToRgb(this.h, this.s, this.v);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        this.picker.dispatchEvent(new CustomEvent('aea-color-change', {
            detail: { hex, rgb, hsv: { h: this.h, s: this.s, v: this.v } }
        }));
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const pickers = document.querySelectorAll('.aea-color-picker');
    pickers.forEach(el => new ColorPicker(el));
});
