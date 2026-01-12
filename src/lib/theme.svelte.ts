import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark';

class ThemeState {
	mode = $state<ThemeMode>('dark');

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('aea-theme-mode') as ThemeMode;
			if (saved) {
				this.mode = saved;
			} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
				this.mode = 'light';
			}
			this.apply();
		}
	}

	toggle() {
		this.mode = this.mode === 'dark' ? 'light' : 'dark';
		this.apply();
		if (browser) {
			localStorage.setItem('aea-theme-mode', this.mode);
		}
	}

	setMode(mode: ThemeMode) {
		this.mode = mode;
		this.apply();
		if (browser) {
			localStorage.setItem('aea-theme-mode', this.mode);
		}
	}

	private apply() {
		if (browser) {
			document.documentElement.setAttribute('data-mode', this.mode);
			// Also support standard dark mode class if needed for some libraries
			if (this.mode === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			// Notify components that need to update (like the graph)
			window.dispatchEvent(new CustomEvent('aea-theme-change', { detail: { mode: this.mode } }));
		}
	}
}

export const theme = new ThemeState();
