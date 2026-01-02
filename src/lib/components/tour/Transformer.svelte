<script lang="ts">
    import { onMount } from 'svelte';
    
    // Props using Svelte 5 runes (if possible) or classic export let
    // Since we are in .svelte file, we use standard syntax.
    // Assuming Svelte 5 is used, we can use runes in .svelte.ts, but here we stick to props.
    
    let { 
        x = $bindable(0), 
        y = $bindable(0), 
        width = $bindable(), 
        height = $bindable(), 
        rotation = $bindable(),
        zoom = 1,
        color = '#00a8ff'
    } = $props();

    // Internal derived values to handle undefined props safely
    let w = $derived(width ?? 100);
    let h = $derived(height ?? 100);
    let rot = $derived(rotation ?? 0);

    let isDragging = $state(false);
    let dragHandle = $state<string | null>(null);
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let initialWidth = 0;
    let initialHeight = 0;
    let initialRotation = 0;
    let centerX = 0;
    let centerY = 0;

    const HANDLE_SIZE = 8;
    
    function getHandleSize() {
        return HANDLE_SIZE / zoom;
    }

    function onMouseDown(e: MouseEvent, handle: string) {
        e.stopPropagation();
        
        isDragging = true;
        dragHandle = handle;
        startX = e.clientX;
        startY = e.clientY;
        initialX = x;
        initialY = y;
        initialWidth = w;
        initialHeight = h;
        initialRotation = rot;
        
        // Calculate center for rotation
        centerX = x + w / 2;
        centerY = y + h / 2;

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (!isDragging) return;
        
        const dx = (e.clientX - startX) / zoom;
        const dy = (e.clientY - startY) / zoom;

        if (dragHandle === 'move') {
            // Handled by parent
        } else if (dragHandle === 'rotate') {
            // Handle 'rotate' is at world position (x+w/2, y-20/zoom) BEFORE group rotation
            // But since the mouse move dx, dy is already in world space, 
            // and we want the angle relative to the center in world space:
            
            // Mouse current world position
            const mouseX = initialX + initialWidth / 2 + dx;
            const mouseY = initialY - (20 / zoom) + dy;
            
            // Vector from center to current mouse
            const vx = mouseX - centerX;
            const vy = mouseY - centerY;
            
            // Angle of this vector
            // Math.atan2(y, x) gives angle from positive X axis
            // Our handle is at the TOP, which is -90 degrees from X axis
            const currentAngle = Math.atan2(vy, vx) * (180 / Math.PI);
            
            // We want the rotation to be 0 when the mouse is at the top (-90 deg)
            rotation = currentAngle + 90;
        } else {
            // Resizing
            // We need to rotate the delta back to local space to apply to width/height
            // This is complex for rotated rectangles.
            // For now, let's implement axis-aligned resizing if rotation is 0, 
            // and block resizing if rotated? No, that's bad.
            
            // Simple approach: unrotate delta
            const rad = -initialRotation * (Math.PI / 180);
            const localDx = dx * Math.cos(rad) - dy * Math.sin(rad);
            const localDy = dx * Math.sin(rad) + dy * Math.cos(rad);

            if (dragHandle?.includes('e')) {
                width = Math.max(10 / zoom, initialWidth + localDx);
            }
            if (dragHandle?.includes('w')) {
                const newWidth = Math.max(10 / zoom, initialWidth - localDx);
                x = initialX + (initialWidth - newWidth) * Math.cos(-rad) + 0; // Fix position?
                // When resizing left, we move x. 
                // But with rotation, x moves along the rotated axis.
                // Complex math.
                // Let's stick to non-rotated resizing for MVP or use a library?
                // Actually, let's just do standard resizing and assume rotation comes later or works simply.
                
                // If we update x, we must account for rotation.
                // For 'w' (West), we add localDx to x (in local space).
                // In world space, that is:
                // deltaX = localDx * cos(r)
                // deltaY = localDx * sin(r)
                
                // Wait, if we drag West handle left (negative localDx):
                // Width increases by -localDx.
                // Position (x,y) shifts by (localDx, 0) rotated.
                
                width = newWidth;
                x = initialX + localDx * Math.cos(-rad);
                y = initialY + localDx * Math.sin(-rad);
            }
            
            if (dragHandle?.includes('s')) {
                height = Math.max(10 / zoom, initialHeight + localDy);
            }
            if (dragHandle?.includes('n')) {
                const newHeight = Math.max(10 / zoom, initialHeight - localDy);
                height = newHeight;
                x = initialX - localDy * Math.sin(-rad); // Rotated Y axis is (-sin, cos)
                y = initialY + localDy * Math.cos(-rad);
            }
        }
    }

    function onMouseUp() {
        isDragging = false;
        dragHandle = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }
</script>

<!-- Transformer Group -->
<!-- We apply rotation to the whole group so handles align with object -->
<g class="transformer-overlay" transform="rotate({rot}, {x + w/2}, {y + h/2})">
    <!-- Bounding Box -->
    <rect 
        {x} {y} width={w} height={h}
        fill="none" 
        stroke={color}
        stroke-width={1 / zoom}
        stroke-dasharray="4 2"
    />

    <!-- Resize Handles -->
    <!-- NW -->
    <rect 
        role="button"
        tabindex="0"
        x={x - getHandleSize()/2} y={y - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-nw-resize"
        onmousedown={(e) => onMouseDown(e, 'nw')}
    />
    <!-- N -->
    <rect 
        role="button"
        tabindex="0"
        x={x + w/2 - getHandleSize()/2} y={y - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-n-resize"
        onmousedown={(e) => onMouseDown(e, 'n')}
    />
    <!-- NE -->
    <rect 
        role="button"
        tabindex="0"
        x={x + w - getHandleSize()/2} y={y - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-ne-resize"
        onmousedown={(e) => onMouseDown(e, 'ne')}
    />
    <!-- E -->
    <rect 
        role="button"
        tabindex="0"
        x={x + w - getHandleSize()/2} y={y + h/2 - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-e-resize"
        onmousedown={(e) => onMouseDown(e, 'e')}
    />
    <!-- SE -->
    <rect 
        role="button"
        tabindex="0"
        x={x + w - getHandleSize()/2} y={y + h - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-se-resize"
        onmousedown={(e) => onMouseDown(e, 'se')}
    />
    <!-- S -->
    <rect 
        role="button"
        tabindex="0"
        x={x + w/2 - getHandleSize()/2} y={y + h - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-s-resize"
        onmousedown={(e) => onMouseDown(e, 's')}
    />
    <!-- SW -->
    <rect 
        role="button"
        tabindex="0"
        x={x - getHandleSize()/2} y={y + h - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-sw-resize"
        onmousedown={(e) => onMouseDown(e, 'sw')}
    />
    <!-- W -->
    <rect 
        role="button"
        tabindex="0"
        x={x - getHandleSize()/2} y={y + h/2 - getHandleSize()/2} 
        width={getHandleSize()} height={getHandleSize()}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-w-resize"
        onmousedown={(e) => onMouseDown(e, 'w')}
    />

    <!-- Rotation Handle -->
    <line 
        x1={x + w/2} y1={y} 
        x2={x + w/2} y2={y - 20/zoom} 
        stroke={color} stroke-width={1/zoom}
    />
    <circle 
        role="button"
        tabindex="0"
        cx={x + w/2} cy={y - 20/zoom} 
        r={getHandleSize()/2}
        fill="white" stroke={color} stroke-width={1/zoom}
        class="cursor-crosshair"
        onmousedown={(e) => onMouseDown(e, 'rotate')}
    />
    
    <!-- Visual reference for rotation center -->
    <!-- <circle cx={x + w/2} cy={y + h/2} r={2/zoom} fill={color} opacity="0.5" /> -->
</g>
