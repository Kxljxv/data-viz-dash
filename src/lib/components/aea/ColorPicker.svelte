<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		value?: string; // Hex format "#RRGGBB"
		label?: string;
		disabled?: boolean;
		id?: string;
		class?: string;
		onchange?: (color: { hex: string; rgb: { r: number; g: number; b: number }; hsv: { h: number; s: number; v: number } }) => void;
	}

	let {
		value = $bindable('#ff0000'),
		label,
		disabled = false,
		id = `colorpicker-${Math.random().toString(36).substring(2, 9)}`,
		class: className = '',
		onchange
	}: Props = $props();

	// State (HSV)
	let h = $state(0);
	let s = $state(100);
	let v = $state(100);

	let isDraggingSaturation = $state(false);
	let isDraggingHue = $state(false);

	let saturationAreaEl: HTMLDivElement;
	let hueSliderEl: HTMLDivElement;

	// --- Color Math ---

	function hsvToRgb(h: number, s: number, v: number) {
		s /= 100;
		v /= 100;
		let c = v * s;
		let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		let m = v - c;
		let r = 0,
			g = 0,
			b = 0;

		if (h >= 0 && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (h >= 60 && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (h >= 120 && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (h >= 180 && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (h >= 240 && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (h >= 300 && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		return {
			r: Math.round((r + m) * 255),
			g: Math.round((g + m) * 255),
			b: Math.round((b + m) * 255)
		};
	}

	function rgbToHsv(r: number, g: number, b: number) {
		r /= 255;
		g /= 255;
		b /= 255;
		let max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		let hVal,
			sVal,
			vVal = max;
		let d = max - min;
		sVal = max === 0 ? 0 : d / max;

		if (max === min) {
			hVal = 0;
		} else {
			switch (max) {
				case r:
					hVal = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					hVal = (b - r) / d + 2;
					break;
				case b:
					hVal = (r - g) / d + 4;
					break;
			}
			hVal /= 6;
		}
		return { h: hVal * 360, s: sVal * 100, v: vVal * 100 };
	}

	function rgbToHex(r: number, g: number, b: number) {
		return (
			'#' +
			[r, g, b]
				.map((x) => {
					const hex = x.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				})
				.join('')
		);
	}

	function hexToRgb(hex: string) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				}
			: null;
	}

	// --- Derived Values ---

	const rgb = $derived(hsvToRgb(h, s, v));
	const hex = $derived(rgbToHex(rgb.r, rgb.g, rgb.b));
	const pureHueRgb = $derived(hsvToRgb(h, 100, 100));
	const pureHueHex = $derived(rgbToHex(pureHueRgb.r, pureHueRgb.g, pureHueRgb.b));

	// Update bound value when internal state changes
	$effect(() => {
		if (value !== hex) {
			value = hex;
			onchange?.({ hex, rgb, hsv: { h, s, v } });
		}
	});

	// Update internal state when bound value changes externally
	$effect(() => {
		const externalRgb = hexToRgb(value);
		if (externalRgb) {
			const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
			if (value.toLowerCase() !== currentHex.toLowerCase()) {
				const externalHsv = rgbToHsv(externalRgb.r, externalRgb.g, externalRgb.b);
				h = externalHsv.h;
				s = externalHsv.s;
				v = externalHsv.v;
			}
		}
	});

	// --- Interaction Handlers ---

	function handleSaturationMove(e: MouseEvent | TouchEvent) {
		if (!saturationAreaEl) return;
		const rect = saturationAreaEl.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		let x = clientX - rect.left;
		let y = clientY - rect.top;

		x = Math.max(0, Math.min(x, rect.width));
		y = Math.max(0, Math.min(y, rect.height));

		s = (x / rect.width) * 100;
		v = 100 - (y / rect.height) * 100;
	}

	function handleHueMove(e: MouseEvent | TouchEvent) {
		if (!hueSliderEl) return;
		const rect = hueSliderEl.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

		let x = clientX - rect.left;
		x = Math.max(0, Math.min(x, rect.width));
		h = (x / rect.width) * 360;
	}

	function startDraggingSaturation(e: MouseEvent | TouchEvent) {
		if (disabled) return;
		isDraggingSaturation = true;
		handleSaturationMove(e);
	}

	function startDraggingHue(e: MouseEvent | TouchEvent) {
		if (disabled) return;
		isDraggingHue = true;
		handleHueMove(e);
	}

	function stopDragging() {
		isDraggingSaturation = false;
		isDraggingHue = false;
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDraggingSaturation) handleSaturationMove(e);
		if (isDraggingHue) handleHueMove(e);
	}

	function handleTouchMove(e: TouchEvent) {
		if (isDraggingSaturation) handleSaturationMove(e);
		if (isDraggingHue) handleHueMove(e);
	}

	function handleRGBInput(key: 'r' | 'g' | 'b', val: string) {
		const num = Math.max(0, Math.min(255, parseInt(val) || 0));
		const newRgb = { ...rgb, [key]: num };
		const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
		h = hsv.h;
		s = hsv.s;
		v = hsv.v;
	}

	function handleHexInput(val: string) {
		const newRgb = hexToRgb(val);
		if (newRgb) {
			const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
			h = hsv.h;
			s = hsv.s;
			v = hsv.v;
		}
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', stopDragging);
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('touchend', stopDragging);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', stopDragging);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', stopDragging);
		};
	});
</script>

<div class="aea-color-picker {className} {disabled ? 'is-disabled' : ''}" style="--current-color: {hex}">
	{#if label}
		<span class="aea-color-picker-label">{label}</span>
	{/if}

	<div class="aea-color-picker-container">
		<!-- Saturation/Value Area -->
		<div
			bind:this={saturationAreaEl}
			class="aea-color-picker-saturation"
			style="background-color: {pureHueHex}"
			onmousedown={startDraggingSaturation}
			ontouchstart={startDraggingSaturation}
			role="slider"
			aria-label="Select saturation and value"
			tabindex="0"
		>
			<div class="aea-color-picker-white-grad"></div>
			<div class="aea-color-picker-black-grad"></div>
			<div class="aea-color-picker-reticle" style="left: {s}%; top: {100 - v}%"></div>
		</div>

		<div class="aea-color-picker-controls">
			<!-- Hue Slider -->
			<div
				bind:this={hueSliderEl}
				class="aea-color-picker-hue"
				onmousedown={startDraggingHue}
				ontouchstart={startDraggingHue}
				role="slider"
				aria-label="Select hue"
				tabindex="0"
			>
				<div class="aea-color-picker-hue-handle" style="left: {(h / 360) * 100}%"></div>
			</div>

			<!-- Swatch and Inputs -->
			<div class="aea-color-picker-footer">
				<div class="aea-color-picker-swatch" style="background-color: {hex}"></div>

				<div class="aea-color-picker-inputs">
					<div class="aea-color-picker-input-group hex">
						<label for="{id}-hex">HEX</label>
						<input
							id="{id}-hex"
							type="text"
							value={hex}
							onchange={(e) => handleHexInput(e.currentTarget.value)}
						/>
					</div>
					<div class="aea-color-picker-rgb-group">
						<div class="aea-color-picker-input-group">
							<label for="{id}-r">R</label>
							<input
								id="{id}-r"
								type="number"
								min="0"
								max="255"
								value={rgb.r}
								oninput={(e) => handleRGBInput('r', e.currentTarget.value)}
							/>
						</div>
						<div class="aea-color-picker-input-group">
							<label for="{id}-g">G</label>
							<input
								id="{id}-g"
								type="number"
								min="0"
								max="255"
								value={rgb.g}
								oninput={(e) => handleRGBInput('g', e.currentTarget.value)}
							/>
						</div>
						<div class="aea-color-picker-input-group">
							<label for="{id}-b">B</label>
							<input
								id="{id}-b"
								type="number"
								min="0"
								max="255"
								value={rgb.b}
								oninput={(e) => handleRGBInput('b', e.currentTarget.value)}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.aea-color-picker {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 240px;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-color-picker-label {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: hsl(var(--text-500));
	}

	.aea-color-picker-container {
		background-color: hsla(var(--bg-200) / 0.4);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 1rem;
		padding: 0.75rem;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
	}

	.aea-color-picker-saturation {
		position: relative;
		width: 100%;
		height: 150px;
		border-radius: 0.5rem;
		overflow: hidden;
		cursor: crosshair;
		margin-bottom: 0.75rem;
	}

	.aea-color-picker-white-grad {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, #fff, transparent);
	}

	.aea-color-picker-black-grad {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, #000, transparent);
	}

	.aea-color-picker-reticle {
		position: absolute;
		width: 12px;
		height: 12px;
		border: 2px solid #fff;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		pointer-events: none;
	}

	.aea-color-picker-controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.aea-color-picker-hue {
		position: relative;
		width: 100%;
		height: 12px;
		border-radius: 10px;
		background: linear-gradient(
			to right,
			#ff0000 0%,
			#ffff00 17%,
			#00ff00 33%,
			#00ffff 50%,
			#0000ff 67%,
			#ff00ff 83%,
			#ff0000 100%
		);
		cursor: pointer;
	}

	.aea-color-picker-hue-handle {
		position: absolute;
		top: 50%;
		width: 14px;
		height: 14px;
		background-color: #fff;
		border: 2px solid hsla(var(--bg-100) / 0.8);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}

	.aea-color-picker-footer {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.aea-color-picker-swatch {
		width: 40px;
		height: 40px;
		border-radius: 0.5rem;
		border: 1px solid hsla(var(--border-300) / 0.2);
		flex-shrink: 0;
		box-shadow: 0 0 15px -5px var(--current-color);
	}

	.aea-color-picker-inputs {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.aea-color-picker-input-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: hsla(var(--bg-300) / 0.5);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 0.375rem;
		padding: 0.125rem 0.375rem;
	}

	.aea-color-picker-input-group label {
		font-size: 0.6rem;
		font-weight: 700;
		color: hsl(var(--text-500));
		width: 20px;
	}

	.aea-color-picker-input-group input {
		background: transparent;
		border: none;
		color: hsl(var(--text-100));
		font-family: inherit;
		font-size: 0.75rem;
		width: 100%;
		outline: none;
		padding: 0.125rem 0;
	}

	.aea-color-picker-rgb-group {
		display: flex;
		gap: 0.25rem;
	}

	.aea-color-picker-rgb-group .aea-color-picker-input-group {
		flex: 1;
	}

	.aea-color-picker-rgb-group label {
		width: 8px;
	}

	/* Hide spin buttons for number inputs */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
