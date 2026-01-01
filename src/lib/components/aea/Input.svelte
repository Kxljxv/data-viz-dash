<script>
    import { IconSearch, IconEye, IconEyeOff, IconX } from "@tabler/icons-svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [value=""] - The current value of the input (bindable).
     * @property {string} [type="text"] - The HTML input type (text, search, password, email, etc.).
     * @property {string} [label] - The label text displayed above the input.
     * @property {string} [placeholder=""] - The placeholder text.
     * @property {string} [id] - Unique identifier for the input and label association.
     * @property {string} [error] - Error message to display. If set, the input enters error state.
     * @property {string} [success] - Success message to display.
     * @property {string} [helperText] - Additional context or instructions.
     * @property {boolean} [disabled=false] - Whether the input is interactive.
     * @property {boolean} [required=false] - Whether the input is required.
     * @property {boolean} [showClear=false] - (Search only) Whether to show the clear button.
     * @property {'default' | 'outlined'} [variant='default'] - The visual style of the input.
     * @property {string} [class=""] - Additional custom CSS classes for the container.
     * @property {import('svelte/elements').FormEventHandler<HTMLInputElement>} [oninput] - Callback for the input event.
     * @property {import('svelte/elements').FocusEventHandler<HTMLInputElement>} [onfocus] - Callback for the focus event.
     * @property {import('svelte/elements').FocusEventHandler<HTMLInputElement>} [onblur] - Callback for the blur event.
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        type = "text",
        label,
        placeholder = "",
        id = `input-${Math.random().toString(36).substring(2, 9)}`,
        error,
        success,
        helperText,
        disabled = false,
        required = false,
        showClear = false,
        variant = 'default',
        class: className = "",
        oninput,
        onfocus,
        onblur,
        ...rest
    } = $props();

    let showPassword = $state(false);
    let isFocused = $state(false);

    const actualType = $derived(type === 'password' && showPassword ? 'text' : type);
    const hasLeadingIcon = $derived(type === 'search');
    const hasTrailingIcon = $derived(type === 'password' || (type === 'search' && showClear));

    function handleClear() {
        value = "";
        const input = document.getElementById(id);
        if (input) input.focus();
    }

    function togglePassword() {
        showPassword = !showPassword;
    }

    function handleFocus(e) {
        isFocused = true;
        onfocus?.(e);
    }

    function handleBlur(e) {
        isFocused = false;
        onblur?.(e);
    }
</script>

<div class="input-group {className} {disabled ? 'opacity-50 pointer-events-none' : ''}">
    {#if label}
        <label for={id} class="input-label">
            {label}
            {#if required}<span class="text-accent-brand ml-0.5">*</span>{/if}
        </label>
    {/if}

    <div class="input-wrapper">
        {#if type === 'search'}
            <span class="input-icon-leading">
                <IconSearch size={18} />
            </span>
        {/if}

        <input
            {id}
            type={actualType}
            bind:value
            {placeholder}
            {disabled}
            {required}
            class="input-field"
            class:input-field-with-icon-leading={hasLeadingIcon}
            class:input-field-with-icon-trailing={hasTrailingIcon}
            class:input-field-error={!!error}
            class:input-field-success={!!success}
            onfocus={handleFocus}
            onblur={handleBlur}
            {oninput}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : (helperText ? `${id}-helper` : undefined)}
            {...rest}
        />

        {#if type === 'password'}
            <button 
                type="button"
                class="input-icon-trailing" 
                onclick={togglePassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabindex="0"
            >
                {#if showPassword}
                    <IconEyeOff size={18} />
                {:else}
                    <IconEye size={18} />
                {/if}
            </button>
        {:else if type === 'search' && showClear && value.length > 0}
            <button 
                type="button"
                class="input-icon-trailing" 
                onclick={handleClear}
                aria-label="Clear search"
            >
                <IconX size={18} />
            </button>
        {/if}
    </div>

    {#if error}
        <span id="{id}-error" class="input-helper-text input-helper-error">{error}</span>
    {:else if success}
        <span id="{id}-success" class="input-helper-text input-helper-success">{success}</span>
    {:else if helperText}
        <span id="{id}-helper" class="input-helper-text">{helperText}</span>
    {/if}
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        transition: opacity 0.2s ease;
    }

    .input-label {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: hsl(var(--text-300));
        margin-left: 0.25rem;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .input-field {
        width: 100%;
        height: 3rem;
        padding: 0.625rem 1rem;
        background-color: hsla(var(--bg-100) / 0.5);
        border: 1px solid hsla(var(--border-300) / 0.1);
        border-radius: 1rem;
        color: hsl(var(--text-100));
        font-family: inherit;
        font-size: 0.875rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        appearance: none;
        -webkit-appearance: none;
    }

    .input-field::-webkit-search-decoration,
    .input-field::-webkit-search-cancel-button,
    .input-field::-webkit-search-results-button,
    .input-field::-webkit-search-results-decoration {
        display: none;
    }

    .input-field::placeholder {
        color: hsl(var(--text-400));
        opacity: 0.6;
    }

    .input-field:hover:not(:disabled) {
        background-color: hsla(var(--bg-100) / 0.8);
        border-color: hsla(var(--border-300) / 0.2);
    }

    .input-field:focus {
        outline: none;
        background-color: hsla(var(--bg-000) / 0.9);
        border-color: hsla(var(--accent-brand) / 0.5);
        box-shadow: 0 0 0 4px hsla(var(--accent-brand) / 0.1);
        transform: translateY(-1px);
    }

    .input-icon-leading {
        position: absolute;
        left: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: hsl(var(--text-400));
        pointer-events: none;
        transition: color 0.3s ease;
        z-index: 1;
    }

    .input-icon-trailing {
        position: absolute;
        right: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.75rem;
        height: 1.75rem;
        padding: 0.375rem;
        border-radius: 0.5rem;
        color: hsl(var(--text-400));
        transition: all 0.2s ease;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 1;
    }

    .input-icon-trailing:hover {
        background-color: hsla(var(--always-white) / 0.05);
        color: hsl(var(--text-200));
    }

    .input-field-with-icon-leading {
        padding-left: 2.75rem !important;
    }

    .input-field-with-icon-trailing {
        padding-right: 2.75rem !important;
    }

    .input-wrapper:focus-within .input-icon-leading {
        color: hsl(var(--accent-brand));
    }

    .input-field-error {
        border-color: hsla(var(--accent-danger) / 0.5) !important;
    }

    .input-field-error:focus {
        box-shadow: 0 0 0 4px hsla(var(--accent-danger) / 0.1) !important;
    }

    .input-field-success {
        border-color: hsla(var(--accent-success) / 0.5) !important;
    }

    .input-field-success:focus {
        box-shadow: 0 0 0 4px hsla(var(--accent-success) / 0.1) !important;
    }

    .input-helper-text {
        font-family: 'ModernDense', sans-serif;
        font-size: 0.75rem;
        color: hsl(var(--text-400));
        margin-left: 0.25rem;
        margin-top: 0.125rem;
    }

    .input-helper-error {
        color: hsl(var(--accent-danger));
        font-weight: 500;
    }

    .input-helper-success {
        color: hsl(var(--accent-success));
        font-weight: 500;
    }
</style>
