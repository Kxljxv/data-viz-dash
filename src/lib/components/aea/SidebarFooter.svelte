<script lang="ts">
	import { getContext } from 'svelte';

	interface Props {
		name: string;
		role?: string;
		avatar?: import('svelte').Snippet;
		class?: string;
		onLogout?: () => void;
	}

	let { name, role, avatar, class: className = '', onLogout }: Props = $props();

	const sidebar = getContext<{ isMini: { value: boolean } }>('sidebar-context');
</script>

<div class="aea-sidebar-footer {className}" class:is-mini={sidebar?.isMini.value}>
	<div class="footer-container">
		<div class="avatar-wrapper">
			{#if avatar}
				{@render avatar()}
			{:else}
				<div class="default-avatar">
					<svg class="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
						/>
					</svg>
				</div>
			{/if}
		</div>

		<div class="user-info">
			<p class="user-name">{name}</p>
			{#if role}
				<p class="user-role">{role}</p>
			{/if}
		</div>

		{#if !sidebar?.isMini.value}
			<button class="logout-btn" onclick={onLogout} aria-label="Logout">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/>
				</svg>
			</button>
		{/if}
	</div>
</div>

<style>
	.aea-sidebar-footer {
		padding: 1.5rem;
		border-top: 1px solid hsla(var(--border-300) / 0.05);
	}

	.footer-container {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.avatar-wrapper {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		background: hsla(var(--text-400) / 0.1);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border: 1px solid hsla(var(--border-300) / 0.1);
	}

	.default-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.user-info {
		flex: 1;
		min-width: 0;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.user-name {
		font-size: 0.875rem;
		font-weight: 700;
		color: hsl(var(--text-100));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 0;
	}

	.user-role {
		font-size: 0.75rem;
		color: hsla(var(--text-400) / 0.6);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin: 0;
	}

	.logout-btn {
		padding: 0.5rem;
		background: transparent;
		border: none;
		border-radius: 0.5rem;
		color: hsla(var(--text-400) / 0.6);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.logout-btn:hover {
		background: hsla(var(--text-400) / 0.05);
		color: hsl(var(--text-100));
	}

	/* Mini Mode Styles */
	.aea-sidebar-footer.is-mini {
		padding: 1rem;
		display: flex;
		justify-content: center;
	}

	.aea-sidebar-footer.is-mini .user-info {
		opacity: 0;
		transform: translateX(-10px);
		pointer-events: none;
		position: absolute;
	}
</style>
