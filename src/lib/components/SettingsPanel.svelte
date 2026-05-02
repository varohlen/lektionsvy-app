<script lang="ts">
    type Theme = "light" | "dark";
    type LibraryItem = {
        id: string;
        name: string;
        kind: "screen" | "template";
        updatedAt: string;
    };

    type Props = {
        open: boolean;
        theme: Theme;
        showGrid: boolean;
        snapToGrid: boolean;
        libraryItems: LibraryItem[];
        onExportBoard: () => void;
        onImportBoard: (file: File) => void;
        onSaveScreen: () => void;
        onSaveTemplate: () => void;
        onLoadLibraryItem: (id: string) => void;
        onDeleteLibraryItem: (id: string) => void;
        onResetBoard: () => void;
        onToggleTheme: () => void;
        onToggleShowGrid: () => void;
        onToggleSnapToGrid: () => void;
    };

    let {
        open,
        theme,
        showGrid,
        snapToGrid,
        libraryItems,
        onExportBoard,
        onImportBoard,
        onSaveScreen,
        onSaveTemplate,
        onLoadLibraryItem,
        onDeleteLibraryItem,
        onResetBoard,
        onToggleTheme,
        onToggleShowGrid,
        onToggleSnapToGrid,
    }: Props = $props();

    let importInput = $state<HTMLInputElement | null>(null);
    const savedScreens = $derived(
        libraryItems.filter((item) => item.kind === "screen"),
    );
    const savedTemplates = $derived(
        libraryItems.filter((item) => item.kind === "template"),
    );

    function handleImportChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        onImportBoard(file);
        input.value = "";
    }
</script>

{#if open}
    <div class="panel settings-panel">
        <p class="panel-title">Inställningar</p>

        <button class="theme-row" type="button" onclick={onToggleTheme}>
            <div class="theme-copy">
                <span>Tema</span>
                <strong>{theme === "light" ? "Ljust" : "Mörkt"}</strong>
            </div>

            <div
                class:active={theme === "dark"}
                class="toggle-badge theme-toggle"
                aria-hidden="true"
            >
                <span class="toggle-icon toggle-icon-left">
                    <svg viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                        />
                        <path
                            d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-width="1.8"
                        />
                    </svg>
                </span>
                <span class="toggle-icon toggle-icon-right">
                    <svg viewBox="0 0 24 24">
                        <path
                            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                        />
                    </svg>
                </span>
                <span class="toggle-thumb"></span>
            </div>
        </button>

        <div class="settings-group">
            <button class="theme-row" type="button" onclick={onToggleShowGrid}>
                <div class="theme-copy">
                    <span>Precision</span>
                    <strong>Visa rutnät</strong>
                </div>

                <div
                    class:active={showGrid}
                    class="toggle-badge"
                    aria-hidden="true"
                >
                    <span class="toggle-thumb"></span>
                </div>
            </button>

            <button
                class="theme-row"
                type="button"
                onclick={onToggleSnapToGrid}
            >
                <div class="theme-copy">
                    <span>Precision</span>
                    <strong>Snap till rutnät</strong>
                </div>

                <div
                    class:active={snapToGrid}
                    class="toggle-badge"
                    aria-hidden="true"
                >
                    <span class="toggle-thumb"></span>
                </div>
            </button>

            <div class="action-grid">
                <button class="theme-row action-row" type="button" onclick={onExportBoard}>
                    <div class="theme-copy">
                        <span>Board</span>
                        <strong>Exportera tavla</strong>
                    </div>
                </button>

                <button
                    class="theme-row action-row"
                    type="button"
                    onclick={() => importInput?.click()}
                >
                    <div class="theme-copy">
                        <span>Board</span>
                        <strong>Importera tavla</strong>
                    </div>
                </button>
            </div>

            <div class="action-grid">
                <button class="theme-row action-row" type="button" onclick={onSaveScreen}>
                    <div class="theme-copy">
                        <span>Lokalt</span>
                        <strong>Spara tavla</strong>
                    </div>
                </button>

                <button class="theme-row action-row" type="button" onclick={onSaveTemplate}>
                    <div class="theme-copy">
                        <span>Lokalt</span>
                        <strong>Spara som mall</strong>
                    </div>
                </button>
            </div>

            <button class="theme-row reset-row" type="button" onclick={onResetBoard}>
                <div class="theme-copy">
                    <span>Tavla</span>
                    <strong>Återställ tavla</strong>
                </div>
            </button>
        </div>

        <div class="library-section">
            <p class="panel-title">Sparat i webbläsaren</p>

            {#if libraryItems.length === 0}
                <p class="library-empty">
                    Inga sparade tavlor än. Allt lagras lokalt i den här webbläsaren.
                </p>
            {:else}
                {#if savedScreens.length > 0}
                    <div class="library-group">
                        <p class="library-group-title">Tavlor</p>
                        <div class="library-list">
                            {#each savedScreens as item}
                                <div class="library-item">
                                    <button
                                        class="library-load"
                                        type="button"
                                        onclick={() => onLoadLibraryItem(item.id)}
                                    >
                                        <span class="library-name">{item.name}</span>
                                        <span class="library-date">
                                            {new Date(item.updatedAt).toLocaleDateString("sv-SE")}
                                        </span>
                                    </button>
                                    <button
                                        class="library-delete"
                                        type="button"
                                        aria-label={`Ta bort ${item.name}`}
                                        onclick={() => onDeleteLibraryItem(item.id)}
                                    >
                                        Ta bort
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if savedTemplates.length > 0}
                    <div class="library-group">
                        <p class="library-group-title">Mallar</p>
                        <div class="library-list">
                            {#each savedTemplates as item}
                                <div class="library-item">
                                    <button
                                        class="library-load"
                                        type="button"
                                        onclick={() => onLoadLibraryItem(item.id)}
                                    >
                                        <span class="library-name">{item.name}</span>
                                        <span class="library-date">
                                            {new Date(item.updatedAt).toLocaleDateString("sv-SE")}
                                        </span>
                                    </button>
                                    <button
                                        class="library-delete"
                                        type="button"
                                        aria-label={`Ta bort ${item.name}`}
                                        onclick={() => onDeleteLibraryItem(item.id)}
                                    >
                                        Ta bort
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}
        </div>

        <input
            bind:this={importInput}
            class="hidden-file-input"
            type="file"
            accept="application/json,.json"
            onchange={handleImportChange}
        />
    </div>
{/if}

<style>
    .panel {
        position: fixed;
        bottom: 4.2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 19;
        width: min(28rem, calc(100vw - 2rem));
        max-height: calc(100vh - 6rem);
        overflow-y: auto;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 0.85rem;
        background: var(--surface);
        box-shadow: var(--shadow);
    }

    .panel-title {
        margin: 0 0 0.75rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .theme-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.7rem 0.85rem;
        border: 1px solid var(--border);
        border-radius: 0.6rem;
        background: var(--surface-soft);
        color: var(--text);
        font: inherit;
        cursor: pointer;
        transition: background 120ms ease;
    }

    .theme-row:hover {
        background: color-mix(
            in srgb,
            var(--brand-primary-500) 8%,
            var(--surface-soft)
        );
    }

    .settings-group {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.6rem;
    }

    .action-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.6rem;
    }

    .theme-copy {
        display: grid;
        gap: 0.2rem;
        text-align: left;
    }

    .theme-copy span {
        font-size: 0.88rem;
        color: var(--muted);
    }

    .toggle-badge {
        --toggle-width: 2.8rem;
        --toggle-height: 1.7rem;
        --toggle-padding: 0.15rem;
        --toggle-thumb-size: 1.2rem;

        position: relative;
        display: inline-flex;
        align-items: center;
        width: var(--toggle-width);
        height: var(--toggle-height);
        padding: var(--toggle-padding);
        border-radius: 0.5rem;
        background: color-mix(in srgb, var(--text) 10%, transparent);
        transition: background 140ms ease;
    }

    .toggle-thumb {
        display: block;
        width: var(--toggle-thumb-size);
        height: var(--toggle-thumb-size);
        border-radius: 0.35rem;
        background: var(--surface);
        box-shadow: 0 1px 4px color-mix(in srgb, var(--text) 14%, transparent);
        transform: translateX(0);
        transition: transform 140ms ease;
    }

    .toggle-badge.active {
        background: color-mix(
            in srgb,
            var(--brand-primary-500) 34%,
            var(--surface-soft)
        );
    }

    .toggle-badge.active .toggle-thumb {
        transform: translateX(
            calc(
                var(--toggle-width) - (var(--toggle-padding) * 2) -
                    var(--toggle-thumb-size) + 0.16rem
            )
        );
    }

    .theme-toggle {
        background: color-mix(in srgb, var(--text) 10%, transparent);
    }

    .theme-toggle.active {
        background: color-mix(
            in srgb,
            var(--brand-primary-500) 34%,
            var(--surface-soft)
        );
    }

    .toggle-icon {
        position: absolute;
        top: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 0.85rem;
        height: 0.85rem;
        color: color-mix(in srgb, var(--text) 62%, transparent);
        transform: translateY(-50%);
        pointer-events: none;
        z-index: 0;
    }

    .toggle-icon-left {
        left: 0.42rem;
    }

    .toggle-icon-right {
        right: 0.42rem;
    }

    .action-row {
        justify-content: flex-start;
    }

    .hidden-file-input {
        display: none;
    }

    .library-section {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.9rem;
    }

    .library-empty {
        margin: 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.45;
    }

    .library-group {
        display: grid;
        gap: 0.4rem;
    }

    .library-group-title {
        margin: 0;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--muted);
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    .library-list {
        display: grid;
        gap: 0.45rem;
    }

    .library-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.5rem;
        align-items: stretch;
    }

    .library-load,
    .library-delete {
        border: 1px solid var(--border);
        border-radius: 0.6rem;
        background: var(--surface-soft);
        color: var(--text);
        font: inherit;
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease;
    }

    .library-load:hover,
    .library-delete:hover {
        background: color-mix(
            in srgb,
            var(--brand-primary-500) 8%,
            var(--surface-soft)
        );
        border-color: color-mix(in srgb, var(--brand-primary-500) 22%, var(--border));
    }

    .library-load {
        display: grid;
        gap: 0.15rem;
        padding: 0.7rem 0.85rem;
        text-align: left;
    }

    .library-name {
        font-size: 0.92rem;
        font-weight: 700;
    }

    .library-date {
        font-size: 0.78rem;
        color: var(--muted);
    }

    .library-delete {
        padding: 0.7rem 0.75rem;
        white-space: nowrap;
    }

    .toggle-icon svg {
        width: 100%;
        height: 100%;
    }

    .theme-toggle.active .toggle-icon-right,
    .theme-toggle:not(.active) .toggle-icon-left {
        color: color-mix(in srgb, var(--text) 88%, transparent);
    }

    .theme-toggle .toggle-thumb {
        position: relative;
        z-index: 1;
        background: color-mix(in srgb, var(--surface) 82%, white 18%);
    }

    :global(.screen-shell[data-theme="dark"]) .theme-toggle .toggle-thumb {
        background: color-mix(in srgb, var(--surface-soft) 88%, white 12%);
    }

    .reset-row {
        justify-content: flex-start;
    }
</style>
