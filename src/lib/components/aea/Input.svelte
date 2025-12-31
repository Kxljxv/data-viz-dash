<script>
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
            <svg xmlns="http://www.w3.org/2000/svg" class="input-icon-leading" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                {/if}
            </button>
        {:else if type === 'search' && showClear && value.length > 0}
            <button 
                type="button"
                class="input-icon-trailing" 
                onclick={handleClear}
                aria-label="Clear search"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
        height: 2.75rem;
        padding: 0.625rem 1rem;
        background-color: hsla(var(--bg-100) / 0.5);
        border: 1px solid hsla(var(--border-300) / 0.1);
        border-radius: 0.75rem;
        color: hsl(var(--text-100));
        font-family: inherit;
        font-size: 0.875rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
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
        width: 1.125rem;
        height: 1.125rem;
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

    .input-icon-trailing svg {
        width: 1.125rem;
        height: 1.125rem;
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
