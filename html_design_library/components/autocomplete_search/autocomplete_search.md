# Autocomplete / Search

A high-performance search component designed for quick node discovery and filtering. It combines standard text input with a floating results panel, supporting grouping, icons, and keyboard navigation.

## 1. Design Specifications

### Aesthetic: Cyberpunk-Lite
- **Surface:** Glassmorphic panel with `24px` blur and semi-transparent background.
- **Accents:** Neon brand colors for highlighting matching text and active selection.
- **Transitions:** Subtle entrance animations (fade + slide) and smooth height transitions.

### Accessibility (WCAG AA)
- **Roles:** `role="combobox"`, `role="listbox"`, `role="option"`.
- **Keyboard:** full arrow key navigation, `Enter` to select, `Esc` to clear/close.
- **Focus:** Distinct visual focus state for the input and highlighted options.

## 2. Technical Implementation

### CSS Classes
- `.aea-autocomplete`: Root container.
- `.aea-autocomplete-input`: The search input field.
- `.aea-autocomplete-results`: The floating results container.
- `.aea-autocomplete-group`: Header for categorized results.
- `.aea-autocomplete-item`: Individual result items.
- `.aea-autocomplete-highlight`: Span for matching text.

### JavaScript API (`AEAAutocomplete`)
The component is managed by a singleton controller that handles:
- **Debouncing:** Prevents excessive filtering logic on every keystroke.
- **State Management:** Tracks active item, loading state, and visibility.
- **Dynamic Positioning:** Ensures results stay within the viewport.
- **Custom Events:** Dispatches `aea-autocomplete-select` when an item is chosen.

## 3. Usage Example

```html
<div class="aea-autocomplete" id="main-search">
    <div class="aea-autocomplete-wrapper">
        <svg class="aea-autocomplete-icon">...</svg>
        <input type="text" class="aea-autocomplete-input" placeholder="Search nodes...">
        <button class="aea-autocomplete-clear" aria-label="Clear search">×</button>
    </div>
    <div class="aea-autocomplete-results" role="listbox">
        <!-- Dynamically populated -->
    </div>
</div>
```
