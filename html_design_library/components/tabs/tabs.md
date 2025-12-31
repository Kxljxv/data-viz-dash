# Tabs

Tabs are navigation elements that allow users to switch between different views or functional sections within the same context. In the AEA interface, they are primarily used in the Control Panel to switch between Search, View settings, and Information.

## 1. Design Specifications

### Visual Style
-   **Structure:** A horizontal or vertical list of triggers that toggle corresponding content panels.
-   **Active Indicator:** A high-contrast bottom border (`hsl(var(--text-100))`) or a subtle glassmorphism background.
-   **Typography:** `ModernDense`, tracking-wider, uppercase or title case depending on context.
-   **Transitions:** Smooth opacity and border-color transitions (`duration-200`).
-   **Spacing:** Consistent padding (`h-[3rem]` in current prototype) to ensure a comfortable touch/click target.

### Variants
-   **Underline (Standard):** Clean minimalist style with a bottom border indicator.
-   **Pill/Capsule:** Individual buttons with rounded corners and background fills for active states.
-   **Vertical:** Stacked tabs for sidebar navigation.
-   **Iconic:** Tabs that include leading icons for faster visual recognition.

### Animation
-   **Indicator Slide:** (Optional but recommended) The active line slides horizontally to the new position instead of fading in/out.
-   **Content Fade:** Tab panels should fade in when activated to avoid jarring visual jumps.

## 2. Usage Guidelines

-   **Hierarchy:** Tabs should represent siblings of equal importance.
-   **Quantity:** Limit horizontal tabs to 3-5 items to avoid crowding on mobile. Use vertical tabs for larger sets.
-   **Labels:** Keep labels short and descriptive (1-2 words).
-   **Accessibility:**
    -   Use `role="tablist"`, `role="tab"`, and `role="tabpanel"`.
    -   Manage `aria-selected` and `tabindex`.
    -   Support keyboard navigation (Arrow keys).

## 3. Implementation

### HTML Structure
```html
<nav class="tabs-container" role="tablist">
  <button class="tab-trigger active" 
          role="tab" 
          aria-selected="true" 
          aria-controls="panel-1"
          id="tab-1">
    Search
  </button>
  <button class="tab-trigger" 
          role="tab" 
          aria-selected="false" 
          aria-controls="panel-2"
          id="tab-2">
    View
  </button>
</nav>

<div class="tab-panel active" id="panel-1" role="tabpanel" aria-labelledby="tab-1">
  <!-- Content -->
</div>
<div class="tab-panel" id="panel-2" role="tabpanel" aria-labelledby="tab-2">
  <!-- Content -->
</div>
```

### CSS Classes
-   `.tabs-container`: Flex container for tab triggers.
-   `.tab-trigger`: Base styling for tab buttons.
-   `.tab-trigger.active`: Styles for the currently selected tab.
-   `.tab-panel`: Container for tab content (hidden by default).
-   `.tab-panel.active`: Visible state for the active panel.

## 4. Svelte Implementation (AEA-System)

The Svelte implementation uses a compound component pattern with `Tabs`, `TabList`, `Tab`, `TabPanels`, and `TabPanel`. It utilizes Svelte 5 runes for state management and context for communication between components.

### Usage

```svelte
<script>
  import { Tabs, TabList, Tab, TabPanels, TabPanel } from '$lib/components/aea';
</script>

<Tabs defaultValue="search">
  <TabList>
    <Tab value="search">Search</Tab>
    <Tab value="view">View</Tab>
    <Tab value="info">Info</Tab>
  </TabList>

  <TabPanels>
    <TabPanel value="search">
      <!-- Search Content -->
    </TabPanel>
    <TabPanel value="view">
      <!-- View Content -->
    </TabPanel>
    <TabPanel value="info">
      <!-- Info Content -->
    </TabPanel>
  </TabPanels>
</Tabs>
```

### Properties

#### Tabs
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultValue` | `string` | `undefined` | The value of the tab to select by default. |
| `value` | `string` | `undefined` | The value of the currently selected tab (for controlled usage). |
| `onValueChange` | `function` | `undefined` | Callback called when the selected tab changes. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the tabs. |
| `variant` | `'underline' \| 'pill'` | `'underline'` | The visual style of the tabs. |

#### Tab
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | (Required) | The unique value associated with this tab. |
| `disabled` | `boolean` | `false` | Whether the tab is disabled. |

#### TabPanel
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | (Required) | The value of the tab this panel belongs to. |
