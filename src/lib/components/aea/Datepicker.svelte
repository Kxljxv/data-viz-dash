<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		value?: Date | string | null;
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		id?: string;
		error?: string;
		helperText?: string;
		class?: string;
		onchange?: (date: Date | null) => void;
	}

	let {
		value = $bindable(null),
		label,
		placeholder = 'Select date...',
		disabled = false,
		id = `datepicker-${Math.random().toString(36).substring(2, 9)}`,
		error,
		helperText,
		class: className = '',
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let containerEl: HTMLDivElement;

	// Normalize value to Date object
	const selectedDate = $derived.by(() => {
		if (!value) return null;
		const d = new Date(value);
		return isNaN(d.getTime()) ? null : d;
	});

	let viewDate = $state(new Date());

	$effect(() => {
		if (selectedDate) {
			viewDate = new Date(selectedDate);
		}
	});

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];
	const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

	const calendarGrid = $derived.by(() => {
		const year = viewDate.getFullYear();
		const month = viewDate.getMonth();

		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);

		// Adjust for Monday start (0=Sun, 1=Mon... 6=Sat)
		// Svelte 5 Datepicker uses Monday as start of week
		let startOffset = firstDayOfMonth.getDay() - 1;
		if (startOffset === -1) startOffset = 6; // Sunday becomes 6

		const days = [];

		// Previous month days
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = startOffset - 1; i >= 0; i--) {
			days.push({
				day: prevMonthLastDay - i,
				month: month - 1,
				year,
				isCurrentMonth: false
			});
		}

		// Current month days
		for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
			days.push({
				day: i,
				month,
				year,
				isCurrentMonth: true
			});
		}

		// Next month days
		const remainingSlots = 42 - days.length; // 6 rows of 7 days
		for (let i = 1; i <= remainingSlots; i++) {
			days.push({
				day: i,
				month: month + 1,
				year,
				isCurrentMonth: false
			});
		}

		return days;
	});

	function toggle() {
		if (disabled) return;
		isOpen = !isOpen;
		if (isOpen && selectedDate) {
			viewDate = new Date(selectedDate);
		}
	}

	function prevMonth() {
		viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
	}

	function selectDate(d: { day: number; month: number; year: number }) {
		const newDate = new Date(d.year, d.month, d.day);
		value = newDate;
		isOpen = false;
		onchange?.(newDate);
	}

	function isSelected(d: { day: number; month: number; year: number }) {
		if (!selectedDate) return false;
		return (
			selectedDate.getDate() === d.day &&
			selectedDate.getMonth() === d.month &&
			selectedDate.getFullYear() === d.year
		);
	}

	function isToday(d: { day: number; month: number; year: number }) {
		const today = new Date();
		return (
			today.getDate() === d.day &&
			today.getMonth() === d.month &&
			today.getFullYear() === d.year
		);
	}

	function formatDisplayDate(date: Date | null) {
		if (!date) return '';
		return date.toLocaleDateString('de-DE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	onMount(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerEl && !containerEl.contains(e.target as Node)) {
				isOpen = false;
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div
	bind:this={containerEl}
	class="aea-datepicker {className} {disabled ? 'is-disabled' : ''} {isOpen ? 'is-open' : ''}"
	class:has-error={!!error}
>
	{#if label}
		<label for={id} class="aea-datepicker-label">
			{label}
		</label>
	{/if}

	<div class="aea-datepicker-wrapper">
		<button
			{id}
			type="button"
			class="aea-datepicker-trigger"
			{disabled}
			onclick={toggle}
			aria-haspopup="dialog"
			aria-expanded={isOpen}
		>
			<span class="aea-datepicker-value" class:is-placeholder={!selectedDate}>
				{selectedDate ? formatDisplayDate(selectedDate) : placeholder}
			</span>
			<span class="aea-datepicker-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</span>
		</button>

		<div class="aea-datepicker-popover" role="dialog" aria-modal="true">
			<div class="aea-datepicker-header">
				<button type="button" class="aea-datepicker-nav-btn" onclick={prevMonth} aria-label="Previous month">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="aea-datepicker-current-month">
					{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
				</div>
				<button type="button" class="aea-datepicker-nav-btn" onclick={nextMonth} aria-label="Next month">
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>

			<div class="aea-datepicker-grid">
				{#each dayNames as day}
					<div class="aea-datepicker-day-header">{day}</div>
				{/each}

				{#each calendarGrid as d}
					<button
						type="button"
						class="aea-datepicker-day"
						class:is-other-month={!d.isCurrentMonth}
						class:is-selected={isSelected(d)}
						class:is-today={isToday(d)}
						onclick={() => selectDate(d)}
						aria-label="{d.day} {monthNames[d.month]} {d.year}"
					>
						{d.day}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if error}
		<span class="aea-datepicker-helper-text is-error">{error}</span>
	{:else if helperText}
		<span class="aea-datepicker-helper-text">{helperText}</span>
	{/if}
</div>

<style>
	.aea-datepicker {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		font-family: 'ModernDense', sans-serif;
	}

	.aea-datepicker-label {
		font-size: 0.8125rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: hsl(var(--text-400));
		margin-left: 0.25rem;
	}

	.aea-datepicker-wrapper {
		position: relative;
	}

	.aea-datepicker-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 1rem;
		background-color: hsla(var(--bg-200) / 0.3);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 0.75rem;
		color: hsl(var(--text-100));
		font-family: inherit;
		font-size: 0.9375rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
	}

	.aea-datepicker-trigger:hover:not(:disabled) {
		border-color: hsla(var(--border-300) / 0.3);
		background-color: hsla(var(--bg-200) / 0.4);
	}

	.aea-datepicker-trigger:focus:not(:disabled) {
		border-color: hsl(var(--accent-brand));
		background-color: hsla(var(--bg-100) / 0.5);
		box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1);
	}

	.aea-datepicker-value.is-placeholder {
		color: hsl(var(--text-500));
		opacity: 0.6;
	}

	.aea-datepicker-icon {
		color: hsl(var(--text-400));
		margin-left: 0.5rem;
	}

	.aea-datepicker-popover {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		background-color: hsla(var(--bg-100) / 0.9);
		backdrop-filter: blur(32px);
		-webkit-backdrop-filter: blur(32px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		border-radius: 1.25rem;
		padding: 1.25rem;
		z-index: 100;
		opacity: 0;
		visibility: hidden;
		transform: translateY(10px) scale(0.98);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 
			0 10px 30px -5px rgba(0, 0, 0, 0.5),
			0 0 20px -5px hsla(var(--accent-brand) / 0.1);
		width: 300px;
	}

	.aea-datepicker.is-open .aea-datepicker-popover {
		opacity: 1;
		visibility: visible;
		transform: translateY(0) scale(1);
	}

	.aea-datepicker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.aea-datepicker-nav-btn {
		background: transparent;
		border: none;
		color: hsl(var(--text-400));
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.aea-datepicker-nav-btn:hover {
		background-color: hsla(var(--bg-300) / 0.5);
		color: hsl(var(--text-100));
	}

	.aea-datepicker-current-month {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.875rem;
		color: hsl(var(--text-100));
	}

	.aea-datepicker-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.25rem;
	}

	.aea-datepicker-day-header {
		font-size: 0.7rem;
		font-weight: 700;
		color: hsla(var(--text-400) / 0.6);
		text-align: center;
		padding: 0.5rem 0;
	}

	.aea-datepicker-day {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.8125rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		background: transparent;
		border: none;
		color: hsl(var(--text-100));
		outline: none;
	}

	.aea-datepicker-day:hover:not(.is-selected) {
		background-color: hsla(var(--bg-300) / 0.5);
	}

	.aea-datepicker-day.is-other-month {
		color: hsla(var(--text-400) / 0.4);
	}

	.aea-datepicker-day.is-selected {
		background-color: hsl(var(--accent-brand));
		color: #fff;
		font-weight: 700;
		box-shadow: 0 0 10px hsla(var(--accent-brand) / 0.5);
	}

	.aea-datepicker-day.is-today:not(.is-selected) {
		color: hsl(var(--accent-brand));
		font-weight: 700;
		position: relative;
	}

	.aea-datepicker-day.is-today:not(.is-selected)::after {
		content: '';
		position: absolute;
		bottom: 4px;
		width: 4px;
		height: 4px;
		background-color: hsl(var(--accent-brand));
		border-radius: 50%;
	}

	.aea-datepicker-helper-text {
		font-size: 0.75rem;
		color: hsl(var(--text-400));
		margin-left: 0.25rem;
	}

	.aea-datepicker-helper-text.is-error {
		color: hsl(var(--accent-danger, 0, 84%, 60%));
	}

	.aea-datepicker.has-error .aea-datepicker-trigger {
		border-color: hsla(var(--accent-danger, 0, 84%, 60%), 0.4);
	}

	.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
