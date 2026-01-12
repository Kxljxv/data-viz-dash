<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import '../assets/styles/style.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		(function() {
			try {
				var mode = localStorage.getItem('aea-theme-mode');
				var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
				if (!mode && supportDarkMode) mode = 'dark';
				if (!mode) mode = 'dark'; // Default to dark
				document.documentElement.setAttribute('data-mode', mode);
				if (mode === 'dark') document.documentElement.classList.add('dark');
			} catch (e) {}
		})();
	</script>
</svelte:head>

{@render children()}
