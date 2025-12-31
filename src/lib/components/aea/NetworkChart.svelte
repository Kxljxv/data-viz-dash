<script>
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';

    /**
     * @typedef {Object} Props
     * @property {Object} data - { nodes: [], links: [] }
     * @property {number} [width=800]
     * @property {number} [height=500]
     * @property {number} [nodeRadius=8]
     * @property {string} [class=""]
     */

    /** @type {Props} */
    let {
        data,
        width = 800,
        height = 500,
        nodeRadius = 8,
        class: className = ""
    } = $props();

    let container = $state(null);
    let tooltip = $state({ show: false, x: 0, y: 0, content: '' });
    let simulation;

    onMount(() => {
        if (!container) return;

        const svg = d3.select(container)
            .append('svg')
            .attr('class', 'aea-chart-svg')
            .attr('viewBox', [0, 0, width, height]);

        const g = svg.append('g');

        // Zoom/Pan
        svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.5, 4])
            .on('zoom', (event) => g.attr('transform', event.transform)));

        simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(nodeRadius * 2));

        // Links
        const link = g.append('g')
            .selectAll('line')
            .data(data.links)
            .join('line')
            .attr('class', 'aea-chart-link');

        // Nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(data.nodes)
            .join('circle')
            .attr('class', d => `aea-chart-node aea-glow-${d.type || 'brand'}`)
            .attr('r', nodeRadius)
            .attr('fill', d => `hsl(var(--accent-${d.type === 'info' ? 'secondary-100' : 'brand'}))`)
            .call(drag(simulation))
            .on('mouseover', (event, d) => {
                tooltip = {
                    show: true,
                    x: event.pageX + 15,
                    y: event.pageY - 28,
                    content: `<strong>${d.id}</strong><br/>Type: ${d.type || 'Standard'}`
                };
            })
            .on('mousemove', (event) => {
                tooltip.x = event.pageX + 15;
                tooltip.y = event.pageY - 28;
            })
            .on('mouseout', () => {
                tooltip.show = false;
            });

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        function drag(sim) {
            function dragstarted(event) {
                if (!event.active) sim.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event) {
                if (!event.active) sim.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
    });

    onDestroy(() => {
        if (simulation) simulation.stop();
    });
</script>

<div bind:this={container} class="aea-chart-container {className}">
    {#if tooltip.show}
        <div 
            class="aea-chart-tooltip" 
            style="left: {tooltip.x}px; top: {tooltip.y}px; opacity: 1; transform: translate(0, 0);"
        >
            {@html tooltip.content}
        </div>
    {/if}
</div>
