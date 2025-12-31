/**
 * AEA Charts Component Logic (D3.js Integrated)
 * Deeply customized D3 visualizations with Cyberpunk-Lite aesthetic.
 */

export class NetworkChart {
    constructor(selector, data, options = {}) {
        this.selector = selector;
        this.data = data;
        this.options = {
            width: options.width || 800,
            height: options.height || 500,
            nodeRadius: options.nodeRadius || 8,
            ...options
        };
        this.init();
    }

    init() {
        this.container = d3.select(this.selector);
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'aea-chart-tooltip');

        this.svg = this.container.append('svg')
            .attr('class', 'aea-chart-svg')
            .attr('viewBox', [0, 0, this.options.width, this.options.height]);

        this.g = this.svg.append('g');

        // Zoom/Pan
        this.svg.call(d3.zoom()
            .extent([[0, 0], [this.options.width, this.options.height]])
            .scaleExtent([0.5, 4])
            .on('zoom', (event) => this.g.attr('transform', event.transform)));

        this.simulation = d3.forceSimulation(this.data.nodes)
            .force('link', d3.forceLink(this.data.links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
            .force('collision', d3.forceCollide().radius(this.options.nodeRadius * 2));

        this.render();
    }

    render() {
        // Links
        this.link = this.g.append('g')
            .selectAll('line')
            .data(this.data.links)
            .join('line')
            .attr('class', 'aea-chart-link');

        // Nodes
        this.node = this.g.append('g')
            .selectAll('circle')
            .data(this.data.nodes)
            .join('circle')
            .attr('class', d => `aea-chart-node aea-glow-${d.type || 'brand'}`)
            .attr('r', this.options.nodeRadius)
            .attr('fill', d => `hsl(var(--accent-${d.type === 'info' ? 'info' : 'brand'}))`)
            .call(this.drag(this.simulation))
            .on('mouseover', (event, d) => {
                this.tooltip.style('opacity', 1)
                    .html(`<strong>${d.id}</strong><br/>Type: ${d.type || 'Standard'}`)
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => this.tooltip.style('opacity', 0));

        this.simulation.on('tick', () => {
            this.link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            this.node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });
    }

    drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
}

export class WaveformChart {
    constructor(selector, data, options = {}) {
        this.selector = selector;
        this.data = data;
        this.options = {
            width: options.width || 800,
            height: options.height || 300,
            color: options.color || 'hsl(var(--accent-brand))',
            ...options
        };
        this.init();
    }

    init() {
        this.container = d3.select(this.selector);
        this.svg = this.container.append('svg')
            .attr('viewBox', [0, 0, this.options.width, this.options.height]);

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        this.innerWidth = this.options.width - margin.left - margin.right;
        this.innerHeight = this.options.height - margin.top - margin.bottom;

        this.g = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        this.x = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.date))
            .range([0, this.innerWidth]);

        this.y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.value)])
            .range([this.innerHeight, 0]);

        this.render();
    }

    render() {
        // Grid lines
        this.g.append('g')
            .attr('class', 'aea-chart-grid')
            .call(d3.axisLeft(this.y).tickSize(-this.innerWidth).tickFormat(''));

        // Axes
        this.g.append('g')
            .attr('class', 'aea-chart-axis')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(d3.axisBottom(this.x).ticks(5));

        this.g.append('g')
            .attr('class', 'aea-chart-axis')
            .call(d3.axisLeft(this.y).ticks(5));

        // Area
        const area = d3.area()
            .x(d => this.x(d.date))
            .y0(this.innerHeight)
            .y1(d => this.y(d.value))
            .curve(d3.curveMonotoneX);

        this.g.append('path')
            .datum(this.data)
            .attr('class', 'aea-chart-area')
            .attr('fill', this.options.color)
            .attr('d', area);

        // Line
        const line = d3.line()
            .x(d => this.x(d.date))
            .y(d => this.y(d.value))
            .curve(d3.curveMonotoneX);

        const path = this.g.append('path')
            .datum(this.data)
            .attr('class', 'aea-chart-line')
            .attr('stroke', this.options.color)
            .attr('d', line);

        // Animation
        const length = path.node().getTotalLength();
        path.attr('stroke-dasharray', `${length} ${length}`)
            .attr('stroke-dashoffset', length)
            .transition()
            .duration(2000)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);
    }
}
