# Typography

The AEA typography system uses a carefully selected font stack to convey a modern, technical, yet readable aesthetic.

## 1. Font Stack

-   **Headings (Serif):** `Serif` - Adds authority and structure.
-   **UI & Body (Sans):** `ModernDense` - Technical, space-efficient, "dashboard" feel.
-   **Fallback:** System fonts (`-apple-system`, `BlinkMacSystemFont`, etc.).
-   **Dyslexic Support:** `Dyslexic` font available for accessibility mode.

## 2. Scale & Hierarchy

| Element | Size | Font | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `text-4xl` | Serif | Normal | Major landing page titles. |
| **H1** | `text-3xl` | Serif | Normal | Page titles. |
| **H2** | `text-2xl` | Serif | Normal | Section headers. |
| **H3** | `text-xl` | ModernDense | Wide | Card headers, subsection titles. |
| **Body** | `text-base` | ModernDense | Normal | Standard reading text. |
| **Label** | `text-xs` | ModernDense | Widest | UI labels, meta data. |

## 3. Usage Guidelines

-   **Colors:** Use `text-[hsl(var(--text-000))]` for primary content and `text-[hsl(var(--text-200))]` for secondary.
-   **Line Height:** Maintain relaxed line height (`leading-relaxed`) for body text to improve readability in dense interfaces.
-   **Uppercasing:** Use uppercase with `tracking-widest` for labels and small headers to create visual separation.
