
const fs = require('fs');
const path = require('path');

const cursorDir = 'src/assets/cursors';
const outputCss = 'src/lib/cursors.css';
const color = '#97948F'; // Approximate --text-400 (hsl(48, 5%, 59%))

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            if (file.endsWith('.svg')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = getFiles(cursorDir);
let css = ':root {\n';

const shadowFilter = `
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="1" dy="1" stdDeviation="1.2" flood-opacity="0.5"/>
  </filter>
`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Inject filter and color
    content = content.replace('>', `>${shadowFilter}`);
    content = content.replace(/stroke="currentColor"/g, `stroke="${color}"`);
    content = content.replace(/fill="currentColor"/g, `fill="${color}"`);
    
    // Wrap content in a group with the filter
    // Find the first <path or <circle or <rect after the filter
    const firstElementIndex = content.indexOf('<path'); // simplified
    if (firstElementIndex !== -1) {
        const svgStart = content.substring(0, content.indexOf('>', content.indexOf('<svg')) + 1);
        const filterStr = shadowFilter;
        const rest = content.substring(svgStart.length).replace(filterStr, '');
        content = `${svgStart}${filterStr}<g filter="url(#shadow)">${rest}</g></svg>`;
    }

    // Clean up
    content = content.replace(/\s+/g, ' ').trim();
    const encoded = encodeURIComponent(content)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
    
    const relativePath = path.relative(cursorDir, file).replace(/\\/g, '/').replace('.svg', '');
    const varName = `--cursor-${relativePath.replace(/\//g, '-')}`;
    
    css += `  ${varName}: url("data:image/svg+xml;utf8,${encoded}") 0 0, auto;\n`;
});

css += '}\n\n';

// Global styles
css += `
html, body {
  cursor: var(--cursor-default-default_state), auto !important;
}

html:active, body:active {
  cursor: var(--cursor-default-while_clicking_state), auto !important;
}

a, button, [role="button"], input[type="submit"], input[type="button"], select, .cursor-pointer {
  cursor: var(--cursor-pointer-default_state), pointer !important;
}

a:active, button:active, [role="button"]:active, .cursor-pointer:active {
  cursor: var(--cursor-pointer-while_clicking_state), pointer !important;
}

input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="tel"], input[type="url"], input[type="search"], textarea, .cursor-text {
  cursor: var(--cursor-text), text !important;
}

.cursor-help { cursor: var(--cursor-help), help !important; }
.cursor-wait { cursor: var(--cursor-wait), wait !important; }
.cursor-progress { cursor: var(--cursor-progress), progress !important; }
.cursor-crosshair { cursor: var(--cursor-crosshair), crosshair !important; }
.cursor-move { cursor: var(--cursor-move), move !important; }
.cursor-alias { cursor: var(--cursor-alias), alias !important; }
.cursor-copy { cursor: var(--cursor-copy), copy !important; }
.cursor-cell { cursor: var(--cursor-cell), cell !important; }
.cursor-zoom-in { cursor: var(--cursor-zoom-in), zoom-in !important; }
.cursor-zoom-out { cursor: var(--cursor-zoom-out), zoom-out !important; }

/* Resizing */
.cursor-n-resize { cursor: var(--cursor-n-resize), n-resize !important; }
.cursor-s-resize { cursor: var(--cursor-s-resize), s-resize !important; }
.cursor-e-resize { cursor: var(--cursor-e-resize), e-resize !important; }
.cursor-w-resize { cursor: var(--cursor-w-resize), w-resize !important; }
.cursor-ne-resize { cursor: var(--cursor-ne-resize), ne-resize !important; }
.cursor-nw-resize { cursor: var(--cursor-nw-resize), nw-resize !important; }
.cursor-se-resize { cursor: var(--cursor-se-resize), se-resize !important; }
.cursor-sw-resize { cursor: var(--cursor-sw-resize), sw-resize !important; }
.cursor-ew-resize { cursor: var(--cursor-ew-resize), ew-resize !important; }
.cursor-ns-resize { cursor: var(--cursor-ns-resize), ns-resize !important; }
.cursor-nesw-resize { cursor: var(--cursor-nesw-resize), nesw-resize !important; }
.cursor-nwse-resize { cursor: var(--cursor-nwse-resize), nwse-resize !important; }
.cursor-col-resize { cursor: var(--cursor-col-resize), col-resize !important; }
.cursor-row-resize { cursor: var(--cursor-row-resize), row-resize !important; }
`;

fs.writeFileSync(outputCss, css);
console.log('Generated src/lib/cursors.css');
