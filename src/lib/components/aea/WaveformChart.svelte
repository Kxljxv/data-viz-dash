<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    /**
     * @typedef {Object} Props
     * @property {Array} data - Array of { date: Date, value: number }
     * @property {number} [width=800]
     * @property {number} [height=300]
     * @property {string} [color='hsl(var(--accent-brand))']
     * @property {string} [class=""]
     */

    /** @type {Props} */
    let {
        data,
        width = 800,
        height = 300,
        color = 'hsl(var(--accent-brand))',
        class: className = ""
    } = $props();

    let container = $state(null);

    onMount(() => {
        if (!container) return;

        const svg = d3.select(container)
            .append('svg')
            .attr('class', 'aea-chart-svg')
            .attr('viewBox', [0, 0, width, height]);

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) * 1.2]) // Give some headroom
            .range([innerHeight, 0]);

        // Grid lines
        g.append('g')
            .attr('class', 'aea-chart-grid')
            .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(''));

        // Axes
        g.append('g')
            .attr('class', 'aea-chart-axis')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5));

        g.append('g')
            .attr('class', 'aea-chart-axis')
            .call(d3.axisLeft(y).ticks(5));

        // Area
        const area = d3.area()
            .x(d => x(d.date))
            .y0(innerHeight)
            .y1(d => y(d.value))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(data)
            .attr('class', 'aea-chart-area')
            .attr('fill', color)
            .attr('d', area);

        // Line
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        const path = g.append('path')
            .datum(data)
            .attr('class', 'aea-chart-line')
            .attr('stroke', color)
            .attr('d', line);

        // Animation
        const length = path.node().getTotalLength();
        path.attr('stroke-dasharray', `${length} ${length}`)
            .attr('stroke-dashoffset', length)
            .transition()
            .duration(2000)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);
    });
</script>

<div bind:this={container} class="aea-chart-container {className}"></div>
