/**
 * AEA Design Library Documentation Site Script
 */

const AEADocs = (() => {
    // Component Data Structure
    const libraryData = [
        {
            category: "Structure & Layout",
            components: [
                { name: "Breadcrumb", status: "done", path: "components/breadcrumb/breadcrumb.html", desc: "Navigation hierarchy path." },
                { name: "Card", status: "done", path: "components/cards/cards.html", desc: "Container for grouped info (text, image, link)." },
                { name: "Drawer (Sheet)", status: "done", path: "components/drawer/drawer.html", desc: "Sliding panel (e.g., for mobile nav or settings)." },
                { name: "Footer", status: "done", path: "components/footer/footer.html", desc: "Site-wide bottom section." },
                { name: "Jumbotron (Hero)", status: "done", path: "components/jumbotron/jumbotron.html", desc: "Prominent showcase area." },
                { name: "List Group", status: "done", path: "components/list-groups/list-groups.html", desc: "Vertical list of content/actions." },
                { name: "Scroll Area", status: "done", path: "components/scroll_area/scroll_area.html", desc: "Custom scrollable container." },
                { name: "Sidebar", status: "done", path: "components/sidebar/sidebar.html", desc: "Vertical navigation/tools column." },
                { name: "Tables", status: "done", path: "components/tables/tables.html", desc: "Data grid." },
                { name: "Timelines", status: "done", path: "components/timelines/timelines.html", desc: "Chronological event display." }
            ]
        },
        {
            category: "Navigation & Interaction",
            components: [
                { name: "Bottom Navigation", status: "done", path: "components/bottom_navigation/bottom_navigation.html", desc: "Mobile bottom bar." },
                { name: "Buttons", status: "done", path: "components/buttons/buttons.html", desc: "Primary clickable action elements." },
                { name: "Button Group", status: "done", path: "components/button_group/button_group.html", desc: "Related buttons grouped together." },
                { name: "Dropdowns", status: "done", path: "components/dropdowns/dropdowns.html", desc: "Toggleable menu lists and context menus." },
                { name: "Navbar", status: "done", path: "components/navbar/navbar.html", desc: "Primary header navigation." },
                { name: "Nav Tabs", status: "done", path: "components/tabs/tabs.html", desc: "Context switchers." },
                { name: "Pagination", status: "done", path: "components/pagination/pagination.html", desc: "Splitting content into pages." },
                { name: "Speed Dial", status: "done", path: "components/speed_dial/speed_dial.html", desc: "Floating button expanding to actions." }
            ]
        },
        {
            category: "Data Input & Selection",
            components: [
                { name: "Autocomplete/Search", status: "done", path: "components/autocomplete_search/autocomplete_search.html", desc: "Input with suggestions." },
                { name: "Clipboard", status: "done", path: "components/clipboard/clipboard.html", desc: "Copy to clipboard action." },
                { name: "Color Picker", status: "done", path: "components/color_picker/color_picker.html", desc: "Color selection tool." },
                { name: "Datepicker", status: "done", path: "components/datepicker/datepicker.html", desc: "Calendar interface." },
                { name: "File Upload Status", status: "done", path: "components/file_upload_status/file_upload_status.html", desc: "Progress indication for uploads." },
                { name: "Input Field", status: "done", path: "components/inputs/inputs.html", desc: "Standard text and search inputs." },
                { name: "KBD", status: "done", path: "components/kbd/kbd.html", desc: "Keyboard key visualization." },
                { name: "Select Inputs", status: "done", path: "components/selects/selects.html", desc: "Dropdown selection." },
                { name: "Timepicker", status: "done", path: "components/timepicker/timepicker.html", desc: "Time selection widget." },
                { name: "Range", status: "done", path: "components/range/range.html", desc: "Cyberpunk-Lite styled sliders." },
                { name: "Toggle", status: "done", path: "components/toggle/toggle.html", desc: "Switch-style controls." },
                { name: "Checkbox", status: "done", path: "components/checkbox/checkbox.html", desc: "Standard checkbox inputs." },
                { name: "Checkbox Fields", status: "done", path: "components/checkbox-fields/checkbox-fields.html", desc: "Button-style multi-select fields." },
                { name: "Radio", status: "done", path: "components/radio/radio.html", desc: "Radio button selections." }
            ]
        },
        {
            category: "Feedback & Status",
            components: [
                { name: "Accordion", status: "done", path: "components/accordions/accordions.html", desc: "Collapsible content sections." },
                { name: "Alerts", status: "done", path: "components/alerts/alerts.html", desc: "Status messages (Success, Warning, Error)." },
                { name: "Badges", status: "done", path: "components/badges/badges.html", desc: "Small status/count indicators." },
                { name: "Banner", status: "done", path: "components/banner/banner.html", desc: "Full-width messages." },
                { name: "Indicators", status: "done", path: "components/indicators/indicators.html", desc: "Subtle status cues (dots, pulses)." },
                { name: "Modals", status: "done", path: "components/modals/modals.html", desc: "Overlay windows." },
                { name: "Popovers", status: "done", path: "components/popovers/popovers.html", desc: "Contextual info on click/hover." },
                { name: "Progress Bars", status: "done", path: "components/progress_bars/progress_bars.html", desc: "Visualizing task completion." },
                { name: "Separator", status: "done", path: "components/separator/separator.html", desc: "Dividers." },
                { name: "Spinner", status: "done", path: "components/spinner/spinner.html", desc: "Loading state animation." },
                { name: "Toasts", status: "done", path: "components/toasts/toasts.html", desc: "Temporary notifications." },
                { name: "Tooltips", status: "done", path: "components/tooltips/tooltips.html", desc: "Contextual info on hover/focus." }
            ]
        },
        {
            category: "Display & Presentation",
            components: [
                { name: "Avatar", status: "done", path: "components/avatar/avatar.html", desc: "User thumbnail." },
                { name: "Carousel", status: "done", path: "components/carousel/carousel.html", desc: "Rotating content." },
                { name: "Icon Shapes", status: "done", path: "components/icon_shapes/icon_shapes.html", desc: "Icon container styles." },
                { name: "Skeleton", status: "done", path: "components/skeleton/skeleton.html", desc: "Loading placeholder." },
                { name: "Stepper", status: "done", path: "components/stepper/stepper.html", desc: "Multi-step process visualization." },
                { name: "PDF Viewer", status: "done", path: "components/pdf-viewer/pdf-viewer.html", desc: "Technical document viewer." }
            ]
        },
        {
            category: "Other Elements",
            components: [
                { name: "Typography", status: "done", path: "elements/typography/typography.html", desc: "Headings, Paragraphs, Lists, Links." },
                { name: "Media", status: "done", path: "components/media/media.html", desc: "Styled image and video containers." },
                { name: "Charts", status: "done", path: "components/charts/charts.html", desc: "D3.js integrated data visualizations." }
            ]
        }
    ];

    const elements = {
        sidebarNav: document.getElementById('sidebar-nav'),
        componentSections: document.getElementById('component-sections'),
        searchBar: document.getElementById('comp-search'),
        sidebarToggle: document.getElementById('sidebar-toggle'),
        mainSidebar: document.getElementById('main-sidebar'),
        counts: {
            done: document.getElementById('count-done'),
            progress: document.getElementById('count-progress'),
            pending: document.getElementById('count-pending')
        }
    };

    /**
     * Initialize the documentation site
     */
    const init = () => {
        renderSidebar();
        renderComponentGrid();
        updateStatusCounts();
        setupEventListeners();
    };

    /**
     * Render the sidebar navigation
     */
    const renderSidebar = () => {
        let html = '';
        libraryData.forEach(group => {
            const groupId = group.category.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div>
                    <h3 class="text-[10px] uppercase tracking-[0.2em] font-black text-[hsl(var(--text-500))] mb-4 px-2">
                        ${group.category}
                    </h3>
                    <ul class="space-y-1">
                        ${group.components.map(comp => `
                            <li>
                                <a href="#${comp.name.toLowerCase().replace(/\s+/g, '-')}" 
                                   class="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[hsl(var(--text-300))] hover:bg-[hsla(var(--bg-200)/0.4)] hover:text-[hsl(var(--text-100))] transition-all group">
                                    <span>${comp.name}</span>
                                    <span class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">→</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });
        elements.sidebarNav.innerHTML = html;
    };

    /**
     * Render the component grid
     */
    const renderComponentGrid = (filter = '') => {
        let html = '';
        const searchTerms = filter.toLowerCase();

        libraryData.forEach(group => {
            const filteredComponents = group.components.filter(comp => 
                comp.name.toLowerCase().includes(searchTerms) || 
                comp.desc.toLowerCase().includes(searchTerms)
            );

            if (filteredComponents.length === 0) return;

            html += `
                <section id="section-${group.category.toLowerCase().replace(/\s+/g, '-')}" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div class="flex items-center gap-4 mb-8">
                        <h3 class="text-2xl font-serif">${group.category}</h3>
                        <div class="flex-1 h-px bg-gradient-to-r from-[hsla(var(--border-300)/0.2)] to-transparent"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        ${filteredComponents.map(comp => `
                            <div id="${comp.name.toLowerCase().replace(/\s+/g, '-')}" 
                                 onclick="window.location.href='${comp.path}'"
                                 class="comp-card p-6 rounded-2xl bg-[hsla(var(--bg-100)/0.3)] border border-[hsla(var(--border-300)/0.1)] hover:bg-[hsla(var(--bg-100)/0.5)] backdrop-blur-sm group">
                                <div class="flex justify-between items-start mb-4">
                                    <div class="w-10 h-10 rounded-xl bg-[hsla(var(--bg-200)/0.5)] border border-[hsla(var(--border-300)/0.15)] flex items-center justify-center text-lg group-hover:border-[hsla(var(--accent-brand)/0.3)] transition-colors">
                                        ${getIcon(comp.name)}
                                    </div>
                                    <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getStatusClass(comp.status)}">
                                        ${comp.status}
                                    </span>
                                </div>
                                <h4 class="text-lg font-serif mb-2 group-hover:text-[hsl(var(--accent-brand))] transition-colors">${comp.name}</h4>
                                <p class="text-xs text-[hsl(var(--text-400))] leading-relaxed line-clamp-2">${comp.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        });

        if (html === '') {
            html = `
                <div class="text-center py-24 opacity-50">
                    <div class="text-4xl mb-4">🔍</div>
                    <p class="font-serif text-xl">No components found matching "${filter}"</p>
                </div>
            `;
        }

        elements.componentSections.innerHTML = html;
    };

    /**
     * Get CSS classes for status badges
     */
    const getStatusClass = (status) => {
        switch(status) {
            case 'done': return 'bg-green-500/10 text-green-500 border border-green-500/20';
            case 'progress': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            default: return 'bg-red-500/10 text-red-500 border border-red-500/20';
        }
    };

    /**
     * Get placeholder icon for components
     */
    const getIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('button')) return '🔘';
        if (lower.includes('nav') || lower.includes('menu')) return '🗺️';
        if (lower.includes('input') || lower.includes('search')) return '⌨️';
        if (lower.includes('card')) return '🗂️';
        if (lower.includes('alert') || lower.includes('toast')) return '🔔';
        if (lower.includes('chart')) return '📊';
        if (lower.includes('modal') || lower.includes('drawer')) return '🖼️';
        if (lower.includes('progress') || lower.includes('spinner')) return '⏳';
        if (lower.includes('file') || lower.includes('pdf')) return '📄';
        if (lower.includes('picker')) return '🎨';
        if (lower.includes('table')) return '📋';
        if (lower.includes('media')) return '🎬';
        return '📦';
    };

    /**
     * Update status summary counts
     */
    const updateStatusCounts = () => {
        let done = 0, progress = 0, pending = 0;
        libraryData.forEach(group => {
            group.components.forEach(comp => {
                if (comp.status === 'done') done++;
                else if (comp.status === 'progress') progress++;
                else pending++;
            });
        });

        elements.counts.done.textContent = done;
        elements.counts.progress.textContent = progress;
        elements.counts.pending.textContent = pending;
    };

    /**
     * Set up interactive event listeners
     */
    const setupEventListeners = () => {
        // Search Functionality
        elements.searchBar.addEventListener('input', (e) => {
            renderComponentGrid(e.target.value);
        });

        // Keyboard Shortcut (Cmd/Ctrl + K)
        window.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                elements.searchBar.focus();
            }
        });

        // Mobile Sidebar Toggle
        elements.sidebarToggle.addEventListener('click', () => {
            elements.mainSidebar.classList.toggle('active');
            elements.sidebarToggle.textContent = elements.mainSidebar.classList.contains('active') ? '✕' : '☰';
        });

        // Smooth Scroll for Sidebar Links
        elements.sidebarNav.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hash) {
                e.preventDefault();
                const target = document.querySelector(link.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight the card temporarily
                    target.classList.add('ring-2', 'ring-[hsl(var(--accent-brand))]');
                    setTimeout(() => target.classList.remove('ring-2', 'ring-[hsl(var(--accent-brand))]'), 2000);
                    
                    // Close sidebar on mobile
                    if (window.innerWidth < 1024) {
                        elements.mainSidebar.classList.remove('active');
                        elements.sidebarToggle.textContent = '☰';
                    }
                }
            }
        });
    };

    return { init };
})();

// Start the application
document.addEventListener('DOMContentLoaded', AEADocs.init);
