<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    interface Props {
        url: string;
        title?: string;
    }

    let { url, title = 'PDF Document' }: Props = $props();

    let pdfjsLib: any = null;
    let pdfDoc: any = $state(null);
    let pageNum = $state(1);
    let numPages = $state(0);
    let scale = $state(1.0);
    let container: HTMLDivElement;
    let loading = $state(true);
    let error = $state<string | null>(null);
    let pageElements: HTMLDivElement[] = $state([]);
    let observer: IntersectionObserver | null = null;
    let renderTask: any = null;

    async function initPdfJs() {
        if (pdfjsLib) return;
        
        try {
            // @ts-ignore - pdfjs-dist can be tricky with types in dynamic imports
            pdfjsLib = await import('pdfjs-dist');
            
            // Set up worker using Vite's ?url import
            // @ts-ignore
            const pdfWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
        } catch (e) {
            console.error('Failed to initialize PDF.js:', e);
            throw e;
        }
    }

    async function loadPdf() {
        if (!browser) return;
        
        loading = true;
        error = null;
        try {
            await initPdfJs();
            pdfDoc = await pdfjsLib.getDocument(url).promise;
            numPages = pdfDoc.numPages;
        } catch (e) {
            console.error('Error loading PDF:', e);
            error = 'Dokument konnte nicht geladen werden.';
        } finally {
            loading = false;
        }
    }

    function setupObserver() {
        if (!browser || !container) return;

        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pageIdx = parseInt(entry.target.getAttribute('data-page-index') || '0');
                    if (pageIdx > 0) {
                        renderPage(pageIdx);
                        pageNum = pageIdx;
                    }
                }
            });
        }, {
            root: container,
            threshold: 0.1
        });

        pageElements.forEach((el, idx) => {
            if (el && idx > 0) observer?.observe(el);
        });
    }

    async function renderPage(num: number) {
        if (!pdfDoc) return;
        
        const pageEl = pageElements[num];
        if (!pageEl) return;

        const canvas = pageEl.querySelector('canvas');
        if (!canvas) return;

        // Don't re-render if already rendered at current scale
        if (canvas.getAttribute('data-rendered-scale') === String(scale)) return;

        try {
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: scale * window.devicePixelRatio });
            
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;
            canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            if (renderTask) {
                renderTask.cancel();
            }
            renderTask = page.render(renderContext);
            await renderTask.promise;
            renderTask = null;
            canvas.setAttribute('data-rendered-scale', String(scale));
        } catch (e) {
            console.error('Error rendering page:', e);
        }
    }

    function scrollToPage(num: number) {
        const pageEl = pageElements[num];
        if (pageEl && container) {
            pageEl.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function changePage(delta: number) {
        const newPage = Math.min(Math.max(pageNum + delta, 1), numPages);
        if (newPage !== pageNum) {
            scrollToPage(newPage);
        }
    }

    function changeZoom(delta: number) {
        scale = Math.min(Math.max(scale + delta, 0.5), 3.0);
        // Re-render all visible pages
        setupObserver(); 
    }

    $effect(() => {
        if (numPages > 0) {
            setupObserver();
        }
    });

    $effect(() => {
        if (url) {
            loadPdf();
        }
    });

    onMount(() => {
        // Initial load happens via $effect
    });

    onDestroy(() => {
        if (renderTask) {
            renderTask.cancel();
        }
    });
</script>

<div class="flex flex-col h-full card-glass overflow-hidden shadow-2xl">
    <!-- Toolbar -->
    <div class="flex items-center justify-between p-3 bg-[hsla(var(--bg-300)/0.5)] backdrop-blur-md border-b border-[hsla(var(--border-300)/0.1)]">
        <div class="flex items-center space-x-2">
            <button 
                class="p-1.5 rounded-lg hover:bg-[hsla(var(--always-white)/0.05)] active:bg-[hsla(var(--always-white)/0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                onclick={() => changePage(-1)}
                disabled={pageNum <= 1 || loading}
                title="Vorherige Seite"
            >
                <svg class="w-4 h-4 text-[hsl(var(--text-200))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <span class="text-[10px] font-mono text-[hsl(var(--text-300))] min-w-[60px] text-center">
                {loading ? '...' : `${pageNum} / ${numPages}`}
            </span>
            <button 
                class="p-1.5 rounded-lg hover:bg-[hsla(var(--always-white)/0.05)] active:bg-[hsla(var(--always-white)/0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                onclick={() => changePage(1)}
                disabled={pageNum >= numPages || loading}
                title="Nächste Seite"
            >
                <svg class="w-4 h-4 text-[hsl(var(--text-200))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        <div class="flex items-center space-x-1">
            <button 
                class="p-1.5 rounded-lg hover:bg-[hsla(var(--always-white)/0.05)] active:bg-[hsla(var(--always-white)/0.1)] disabled:opacity-30 transition-all duration-200"
                onclick={() => changeZoom(-0.2)}
                disabled={loading}
                title="Verkleinern"
            >
                <svg class="w-4 h-4 text-[hsl(var(--text-200))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
            </button>
            <span class="text-[10px] font-mono text-[hsl(var(--text-300))] w-10 text-center">
                {Math.round(scale * 100)}%
            </span>
            <button 
                class="p-1.5 rounded-lg hover:bg-[hsla(var(--always-white)/0.05)] active:bg-[hsla(var(--always-white)/0.1)] disabled:opacity-30 transition-all duration-200"
                onclick={() => changeZoom(0.2)}
                disabled={loading}
                title="Vergrößern"
            >
                <svg class="w-4 h-4 text-[hsl(var(--text-200))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    </div>

    <!-- Viewer Area -->
    <div 
        bind:this={container}
        class="flex-1 overflow-auto bg-[hsl(var(--bg-000))] flex flex-col items-center space-y-12 p-12 custom-scrollbar relative scroll-smooth"
    >
        {#if loading}
            <div class="absolute inset-0 flex items-center justify-center bg-[hsla(var(--bg-100)/0.8)] backdrop-blur-sm z-10">
                <div class="flex flex-col items-center space-y-4">
                    <div class="w-10 h-10 border-3 border-[hsl(var(--accent-brand))] border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-[11px] font-black uppercase tracking-[0.2em] text-[hsl(var(--text-300))]">Dokument wird vorbereitet</span>
                </div>
            </div>
        {/if}

        {#if error}
            <div class="absolute inset-0 flex items-center justify-center p-8 text-center">
                <div class="max-w-xs space-y-6">
                    <div class="text-4xl">📄</div>
                    <p class="text-sm text-[hsl(var(--text-200))] font-medium leading-relaxed">{error}</p>
                    <button 
                        class="px-6 py-2.5 bg-[hsla(var(--always-white)/0.05)] hover:bg-[hsla(var(--always-white)/0.1)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border border-[hsla(var(--border-300)/0.1)]"
                        onclick={loadPdf}
                    >
                        Erneut versuchen
                    </button>
                </div>
            </div>
        {/if}

        {#each Array(numPages) as _, i}
            <div 
                bind:this={pageElements[i + 1]}
                data-page-index={i + 1}
                class="pdf-page-wrapper"
                style:min-height="{842 * scale}px"
                style:width="{595 * scale}px"
            >
                <canvas class="rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]"></canvas>
                <div class="page-number-hint">{i + 1}</div>
            </div>
        {/each}
    </div>
</div>

<style>
    .pdf-page-wrapper {
        position: relative;
        background-color: white;
        transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1);
        flex-shrink: 0;
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    .pdf-page-wrapper:hover {
        transform: translateY(-4px) scale(1.005);
    }

    .page-number-hint {
        position: absolute;
        top: -28px;
        left: 0;
        font-family: 'ModernDense', sans-serif;
        font-size: 11px;
        font-weight: 700;
        color: hsl(var(--text-400));
        letter-spacing: 0.1em;
        opacity: 0.6;
    }

    canvas {
        display: block;
        background-color: white;
    }
</style>
