<script lang="ts">
	interface Props {
		src?: string;
		alt?: string;
		name?: string;
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		shape?: 'circle' | 'square' | 'rounded';
		status?: 'online' | 'offline' | 'busy' | 'away';
		class?: string;
	}

	let {
		src,
		alt = '',
		name = '',
		size = 'md',
		shape = 'circle',
		status,
		class: className = ''
	}: Props = $props();

	let imgError = $state(false);

	const initials = $derived.by(() => {
		if (!name) return '';
		return name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	});

	function handleImageError() {
		imgError = true;
	}
</script>

<div
	class="aea-avatar {className} size-{size} shape-{shape}"
	role="img"
	aria-label={name || alt || 'Avatar'}
>
	{#if src && !imgError}
		<img {src} {alt} class="aea-avatar-img" onerror={handleImageError} />
	{:else}
		<div class="aea-avatar-fallback">
			{initials || '?'}
		</div>
	{/if}

	{#if status}
		<span class="aea-avatar-status status-{status}" aria-label="Status: {status}"></span>
	{/if}
</div>

<style>
	.aea-avatar {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		font-family: 'ModernDense', sans-serif;
		user-select: none;
		background-color: hsla(var(--bg-300) / 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid hsla(var(--border-300) / 0.15);
		color: hsl(var(--text-100));
		overflow: hidden;
	}

	/* Sizes */
	.size-xs { width: 1.5rem; height: 1.5rem; font-size: 0.625rem; }
	.size-sm { width: 2rem; height: 2rem; font-size: 0.75rem; }
	.size-md { width: 3rem; height: 3rem; font-size: 1rem; }
	.size-lg { width: 4rem; height: 4rem; font-size: 1.25rem; }
	.size-xl { width: 6rem; height: 6rem; font-size: 2rem; }

	/* Shapes */
	.shape-circle { border-radius: 50%; }
	.shape-square { border-radius: 0.5rem; }
	.shape-rounded { border-radius: 1rem; }

	.aea-avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.aea-avatar-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	/* Status Badge */
	.aea-avatar-status {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 25%;
		height: 25%;
		min-width: 8px;
		min-height: 8px;
		border-radius: 50%;
		border: 2px solid hsl(var(--bg-100));
		z-index: 1;
	}

	.status-online { background-color: hsl(var(--accent-success, 142, 71%, 45%)); box-shadow: 0 0 8px hsla(var(--accent-success, 142, 71%, 45%) / 0.6); }
	.status-offline { background-color: hsl(var(--text-500)); }
	.status-busy { background-color: hsl(var(--accent-danger, 0, 84%, 60%)); box-shadow: 0 0 8px hsla(var(--accent-danger, 0, 84%, 60%) / 0.6); }
	.status-away { background-color: hsl(45, 93%, 47%); box-shadow: 0 0 8px hsla(45, 93%, 47%, 0.6); }

	/* Adjust status position for square/rounded shapes */
	.shape-square .aea-avatar-status, .shape-rounded .aea-avatar-status {
		bottom: -5%;
		right: -5%;
	}
</style>
