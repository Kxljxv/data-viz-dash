import { createRawSnippet } from "svelte";
import { createTable } from "@tanstack/table-core";

/**
 * A Svelte 5 compatible wrapper for TanStack Table
 */
export function createSvelteTable(options) {
    const table = createTable(options);
    return table;
}

/**
 * Helper to render a Svelte component within TanStack Table
 */
export function renderComponent(component, props) {
    return {
        component,
        props
    };
}

/**
 * Helper to render a Svelte snippet within TanStack Table
 */
export function renderSnippet(snippet, props) {
    return {
        snippet,
        props
    };
}

export { default as FlexRender } from "./flex-render.svelte";
export { default as DataTable } from "./data-table.svelte";
