<script lang="ts">
	import { onMount } from 'svelte';

	export interface UploadFile {
		id: string;
		name: string;
		size: number;
		progress: number;
		status: 'idle' | 'uploading' | 'success' | 'error';
		errorMessage?: string;
		type?: string;
	}

	interface Props {
		files: UploadFile[];
		allowMultiple?: boolean;
		accept?: string;
		label?: string;
		dropzoneLabel?: string;
		class?: string;
		onselect?: (files: FileList) => void;
		oncancel?: (id: string) => void;
		onretry?: (id: string) => void;
		onremove?: (id: string) => void;
	}

	let {
		files = $bindable([]),
		allowMultiple = true,
		accept = '*',
		label = 'File Upload',
		dropzoneLabel = 'Drag & drop files here or click to browse',
		class: className = '',
		onselect,
		oncancel,
		onretry,
		onremove
	}: Props = $props();

	let fileInput: HTMLInputElement;
	let isDragging = $state(false);

	function formatSize(bytes: number) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			onselect?.(e.dataTransfer.files);
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			onselect?.(target.files);
		}
	}
</script>

<div class="aea-upload-root {className}">
	{#if label}
		<span class="aea-upload-label">{label}</span>
	{/if}

	<div
		class="aea-drop-zone"
		class:is-dragging={isDragging}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={() => fileInput.click()}
		onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
		role="button"
		tabindex="0"
		aria-label={dropzoneLabel}
	>
		<input
			type="file"
			bind:this={fileInput}
			multiple={allowMultiple}
			{accept}
			onchange={handleFileSelect}
			class="aea-file-input"
		/>
		<div class="aea-drop-zone-content">
			<svg class="aea-drop-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
			</svg>
			<p class="aea-drop-text">{dropzoneLabel}</p>
		</div>
	</div>

	{#if files.length > 0}
		<div class="aea-file-list" aria-live="polite">
			{#each files as file (file.id)}
				<div class="aea-file-item state-{file.status}">
					<div class="aea-file-header">
						<div class="aea-file-info">
							<span class="aea-file-name">{file.name}</span>
							<span class="aea-file-meta">
								{formatSize(file.size)} • 
								{#if file.status === 'uploading'}{file.progress}%{:else}{file.status}{/if}
							</span>
						</div>
						<div class="aea-file-actions">
							{#if file.status === 'uploading'}
								<button class="aea-file-btn" onclick={() => oncancel?.(file.id)} title="Cancel">✕</button>
							{:else if file.status === 'error'}
								<button class="aea-file-btn" onclick={() => onretry?.(file.id)} title="Retry">↻</button>
								<button class="aea-file-btn" onclick={() => onremove?.(file.id)} title="Remove">✕</button>
							{:else}
								<button class="aea-file-btn" onclick={() => onremove?.(file.id)} title="Remove">✕</button>
							{/if}
						</div>
					</div>

					<div class="aea-progress-container">
						<div 
							class="aea-progress-bar" 
							style="width: {file.status === 'success' ? '100%' : file.progress + '%'}"
						></div>
					</div>

					{#if file.status === 'error' && file.errorMessage}
						<div class="aea-file-error">{file.errorMessage}</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.aea-upload-root {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: 'ModernDense', sans-serif;
		width: 100%;
	}

	.aea-upload-label {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: hsl(var(--text-400));
	}

	.aea-drop-zone {
		position: relative;
		border: 1px dashed hsla(var(--border-300) / 0.3);
		border-radius: 1rem;
		padding: 2.5rem 1.5rem;
		background-color: hsla(var(--bg-300) / 0.2);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.aea-drop-zone:hover, .aea-drop-zone.is-dragging {
		border-color: hsla(var(--accent-brand) / 0.5);
		background-color: hsla(var(--bg-300) / 0.4);
		box-shadow: inset 0 0 20px hsla(var(--accent-brand) / 0.05);
	}

	.aea-drop-zone.is-dragging {
		transform: scale(1.01);
	}

	.aea-file-input {
		display: none;
	}

	.aea-drop-icon {
		width: 2.5rem;
		height: 2.5rem;
		color: hsla(var(--text-500) / 0.5);
		margin-bottom: 1rem;
		transition: all 0.3s ease;
	}

	.aea-drop-zone:hover .aea-drop-icon, .aea-drop-zone.is-dragging .aea-drop-icon {
		color: hsl(var(--accent-brand));
		filter: drop-shadow(0 0 8px hsla(var(--accent-brand) / 0.4));
	}

	.aea-drop-text {
		font-size: 0.9375rem;
		color: hsl(var(--text-300));
		max-width: 200px;
		line-height: 1.4;
	}

	/* File List */
	.aea-file-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.aea-file-item {
		background-color: hsla(var(--bg-200) / 0.4);
		backdrop-filter: blur(12px);
		border: 1px solid hsla(var(--border-300) / 0.1);
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		transition: all 0.3s ease;
	}

	.aea-file-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.aea-file-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.aea-file-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--text-100));
		word-break: break-all;
	}

	.aea-file-meta {
		font-size: 0.75rem;
		color: hsl(var(--text-400));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.aea-file-actions {
		display: flex;
		gap: 0.5rem;
	}

	.aea-file-btn {
		background: none;
		border: none;
		color: hsl(var(--text-500));
		cursor: pointer;
		font-size: 1rem;
		padding: 0.25rem;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.aea-file-btn:hover {
		color: hsl(var(--text-100));
		background-color: hsla(var(--text-100) / 0.1);
	}

	/* Progress Bar */
	.aea-progress-container {
		height: 4px;
		background-color: hsla(var(--text-500) / 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.aea-progress-bar {
		height: 100%;
		background-color: hsl(var(--accent-brand));
		box-shadow: 0 0 8px hsla(var(--accent-brand) / 0.4);
		transition: width 0.3s ease;
	}

	/* Status States */
	.state-success .aea-progress-bar {
		background-color: hsl(var(--accent-success, 142, 71%, 45%));
		box-shadow: 0 0 8px hsla(var(--accent-success, 142, 71%, 45%) / 0.4);
	}

	.state-success .aea-file-meta {
		color: hsl(var(--accent-success, 142, 71%, 45%));
	}

	.state-error .aea-progress-bar {
		background-color: hsl(var(--accent-danger, 0, 84%, 60%));
		box-shadow: none;
	}

	.state-error .aea-file-meta {
		color: hsl(var(--accent-danger, 0, 84%, 60%));
	}

	.aea-file-error {
		font-size: 0.75rem;
		color: hsl(var(--accent-danger, 0, 84%, 60%));
		margin-top: -0.25rem;
	}
</style>
