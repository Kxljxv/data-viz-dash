<script lang="ts">
    import type { Annotation } from '$lib/types/tour';
    
    let { annotation } = $props();

    const { 
        type, width, height, color, fill, 
        strokeWidth, edges, points, cornerRadius
    } = $derived(annotation);

    const w = $derived(width || 100);
    const h = $derived(height || 100);
    const sw = $derived(strokeWidth || 2);
    const smoothing = $derived(annotation.smoothing ?? 0);

    function smoothPoints(pts: {x: number, y: number}[], strength: number) {
        if (!pts || pts.length < 3 || strength <= 0) return pts;
        
        // Laplacian smoothing (moving average)
        // We increase the number of iterations for stronger smoothing
        // and keep the weight stable at 0.5 for maximum convergence without oscillation
        let result = [...pts];
        const iterations = Math.ceil(strength * 15); 
        const weight = 0.5;

        for (let iter = 0; iter < iterations; iter++) {
            const nextResult = [result[0]];
            for (let i = 1; i < result.length - 1; i++) {
                const prev = result[i - 1];
                const curr = result[i];
                const next = result[i + 1];
                
                nextResult.push({
                    x: curr.x * (1 - weight) + ((prev.x + next.x) / 2) * weight,
                    y: curr.y * (1 - weight) + ((prev.y + next.y) / 2) * weight
                });
            }
            nextResult.push(result[result.length - 1]);
            result = nextResult;
        }
        return result;
    }

    const displayedPoints = $derived(
        type === 'draw' && points 
            ? smoothPoints(points, smoothing) 
            : points
    );
</script>

<g class="annotation-shape" transform="translate({annotation.x}, {annotation.y})">
    {#if type === 'rect'}
        {#if edges === 'round'}
            {@const maxR = Math.min(w, h) / 2}
            {@const r = Math.min(cornerRadius ?? (Math.min(w, h) * 0.1), maxR)}
            <rect 
                x="0" 
                y="0" 
                width={w} 
                height={h} 
                rx={r} 
                ry={r}
                stroke={color || '#000000'}
                stroke-width={sw}
                fill={fill !== 'none' ? fill : 'transparent'}
            />
        {:else}
            <rect 
                x="0" 
                y="0" 
                width={w} 
                height={h} 
                stroke={color || '#000000'}
                stroke-width={sw}
                fill={fill !== 'none' ? fill : 'transparent'}
            />
        {/if}
    {:else if type === 'circle'}
        <ellipse 
            cx={w/2} 
            cy={h/2} 
            rx={w/2} 
            ry={h/2}
            stroke={color || '#000000'}
            stroke-width={sw}
            fill={fill !== 'none' ? fill : 'transparent'}
        />
    {:else if type === 'arrow'}
        {@const x2 = w}
        {@const y2 = h}
        {@const angle = Math.atan2(y2, x2)}
        {@const headLen = sw * 5 + 10}
        {@const p1x = x2 - headLen * Math.cos(angle - Math.PI / 6)}
        {@const p1y = y2 - headLen * Math.sin(angle - Math.PI / 6)}
        {@const p2x = x2 - headLen * Math.cos(angle + Math.PI / 6)}
        {@const p2y = y2 - headLen * Math.sin(angle + Math.PI / 6)}
        
        <line 
            x1="0" 
            y1="0" 
            x2={x2} 
            y2={y2} 
            stroke={color || '#000000'}
            stroke-width={sw}
        />
        <polygon 
            points="{x2},{y2} {p1x},{p1y} {p2x},{p2y}"
            fill={color || '#000000'}
        />
    {:else if type === 'draw' && displayedPoints && displayedPoints.length > 0}
        <path 
            d={`M ${displayedPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
            fill="none"
            stroke={color || '#000000'}
            stroke-width={sw}
        />
    {/if}
</g>
