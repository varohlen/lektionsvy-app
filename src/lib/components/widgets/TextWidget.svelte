<script lang="ts">
	import IntrinsicTextWidgetBase from './IntrinsicTextWidgetBase.svelte';
	import {
		TEXT_WIDGET_BACKGROUND_VARIANTS,
		TEXT_WIDGET_COLOR_VARIANTS,
		type TextWidgetBackgroundVariant,
		type TextWidgetColorVariant,
		type TextWidgetFontVariant
	} from '$lib/theme';

	type Props = {
		x: number;
		y: number;
		w: number;
		h: number;
		scaleHeight: number;
		z: number;
		selected: boolean;
		isDark: boolean;
		value: string;
		font: TextWidgetFontVariant;
		background: TextWidgetBackgroundVariant;
		color: TextWidgetColorVariant;
		fontLabels: Record<TextWidgetFontVariant, string>;
		backgroundLabels: Record<TextWidgetBackgroundVariant, string>;
		colorLabels: Record<TextWidgetColorVariant, string>;
		onSelect: () => void;
		onMoveStart: (event: PointerEvent) => void;
		onResizeStart: (event: PointerEvent) => void;
		onBringForward: () => void;
		onSendBackward: () => void;
		onDelete?: () => void;
		onMeasure: (size: { width: number; height: number }) => void;
		onToggleFont: () => void;
		onBackgroundSelect: (background: TextWidgetBackgroundVariant) => void;
		onColorSelect: (color: TextWidgetColorVariant) => void;
		onValueChange: (value: string) => void;
	};

	let {
		x,
		y,
		w,
		h,
		scaleHeight,
		z,
		selected,
		isDark,
		value,
		font,
		background,
		color,
		fontLabels,
		backgroundLabels,
		colorLabels,
		onSelect,
		onMoveStart,
		onResizeStart,
		onBringForward,
		onSendBackward,
		onDelete,
		onMeasure,
		onToggleFont,
		onBackgroundSelect,
		onColorSelect,
		onValueChange
	}: Props = $props();

	type OpenPicker = 'background' | 'color' | null;
	type PaletteColor = {
		name: string;
		value: string;
	};

	let openPicker = $state<OpenPicker>(null);
	let backgroundPickerElement = $state<HTMLDivElement | null>(null);
	let colorPickerElement = $state<HTMLDivElement | null>(null);
	const resolvedColorCache = new Map<string, string>();

	const textFontFamily = $derived(
		font === 'display' ? 'var(--font-display)' : 'var(--font-body)'
	);
	const lineHeight = $derived(font === 'display' ? '1.02' : '0.92');
	const letterSpacing = $derived(font === 'display' ? '-0.01em' : '-0.035em');
	const fontWeight = $derived(font === 'display' ? 400 : 700);
	const currentFontLabel = $derived(fontLabels[font]);
	const currentBackgroundLabel = $derived(backgroundLabels[background]);
	const currentColorLabel = $derived(colorLabels[color]);

	function getBackgroundValue(variant: TextWidgetBackgroundVariant) {
		switch (variant) {
			case 'surface':
				return isDark
					? 'color-mix(in srgb, var(--surface) 78%, white 22%)'
					: 'color-mix(in srgb, var(--surface) 92%, white 8%)';
			case 'primary':
				return isDark
					? 'color-mix(in srgb, var(--brand-primary-500) 72%, var(--surface))'
					: 'var(--brand-primary-600)';
			case 'warm':
				return isDark
					? 'color-mix(in srgb, var(--brand-warm-500) 74%, var(--surface))'
					: 'var(--brand-warm-600)';
			case 'success':
				return isDark
					? 'color-mix(in srgb, var(--brand-success-500) 76%, var(--surface))'
					: 'var(--brand-success-600)';
			case 'danger':
				return isDark
					? 'color-mix(in srgb, var(--brand-danger-500) 74%, var(--surface))'
					: 'var(--brand-danger-600)';
			case 'none':
			default:
				return 'transparent';
		}
	}

	function getColorValue(variant: TextWidgetColorVariant) {
		if (variant === 'default') {
			return 'var(--text)';
		}

		switch (variant) {
			case 'inverse':
				return isDark ? '#f8faff' : 'white';
			case 'primary':
				return isDark ? 'var(--brand-primary-300)' : 'var(--brand-primary-700)';
			case 'warm':
				return isDark ? 'var(--brand-warm-300)' : 'var(--brand-warm-700)';
			case 'success':
				return isDark ? 'var(--brand-success-300)' : 'var(--brand-success-700)';
			case 'danger':
				return isDark ? 'var(--brand-danger-300)' : 'var(--brand-danger-700)';
			default:
				return 'var(--text)';
		}
	}

	function resolveCssColor(expression: string, property: 'color' | 'backgroundColor') {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return expression;
		}

		const cacheKey = `${isDark ? 'dark' : 'light'}:${property}:${expression}`;
		const cached = resolvedColorCache.get(cacheKey);
		if (cached !== undefined) {
			return cached;
		}

		const colorScope =
			document.querySelector('.screen-shell[data-theme]') ??
			document.querySelector('.screen-shell') ??
			document.body;
		const probe = document.createElement('div');
		probe.style.position = 'absolute';
		probe.style.pointerEvents = 'none';
		probe.style.opacity = '0';
		probe.style[property] = expression;
		colorScope.appendChild(probe);

		const computed = getComputedStyle(probe)[property];
		probe.remove();

		const resolved = computed || expression;
		resolvedColorCache.set(cacheKey, resolved);
		return resolved;
	}

	const textBackground = $derived(getBackgroundValue(background));
	const textColor = $derived(getColorValue(color));
	const textBorderRadius = $derived(background === 'none' ? '0px' : '0.28em');
	const backgroundPaletteColors = $derived<PaletteColor[]>(
		TEXT_WIDGET_BACKGROUND_VARIANTS.filter((variant) => variant !== 'none').map((variant) => ({
			name: backgroundLabels[variant],
			value: resolveCssColor(getBackgroundValue(variant), 'backgroundColor')
		}))
	);
	const colorPaletteColors = $derived<PaletteColor[]>(
		TEXT_WIDGET_COLOR_VARIANTS.map((variant) => ({
			name: colorLabels[variant],
			value:
				variant === 'default'
					? resolveCssColor('var(--text)', 'color')
					: resolveCssColor(getColorValue(variant), 'color')
	}))
	);
	const selectedBackgroundSwatch = $derived(
		background === 'none'
			? null
			: resolveCssColor(getBackgroundValue(background), 'backgroundColor')
	);
	const selectedColorSwatch = $derived(
		color === 'default'
			? resolveCssColor('var(--text)', 'color')
			: resolveCssColor(getColorValue(color), 'color')
	);

	function togglePicker(kind: Exclude<OpenPicker, null>) {
		openPicker = openPicker === kind ? null : kind;
	}

	function handlePickerButtonPointerDown(event: PointerEvent, kind: Exclude<OpenPicker, null>) {
		event.stopPropagation();
		togglePicker(kind);
	}

	function closePickers() {
		openPicker = null;
	}

	function handleDocumentPointerDown(event: PointerEvent) {
		const target = event.target;

		if (!(target instanceof Node)) {
			return;
		}

		if (backgroundPickerElement?.contains(target) || colorPickerElement?.contains(target)) {
			return;
		}

		closePickers();
	}

	function handleBackgroundPaletteSelect(selection: { color: string | null }) {
		if (selection.color === null) {
			onBackgroundSelect('none');
			closePickers();
			return;
		}

		const nextBackground = TEXT_WIDGET_BACKGROUND_VARIANTS.find(
			(variant) =>
				variant !== 'none' &&
				resolveCssColor(getBackgroundValue(variant), 'backgroundColor') === selection.color
		);

		if (nextBackground) {
			onBackgroundSelect(nextBackground);
		}

		closePickers();
	}

	function handleColorPaletteSelect(selection: { color: string | null }) {
		const selectedSwatch = selection.color;

		if (!selectedSwatch) {
			return;
		}

		const nextColor = TEXT_WIDGET_COLOR_VARIANTS.find((variant) => {
			const swatch =
				variant === 'default'
					? resolveCssColor('var(--text)', 'color')
					: resolveCssColor(getColorValue(variant), 'color');
			return swatch === selectedSwatch;
		});

		if (nextColor) {
			onColorSelect(nextColor);
		}

		closePickers();
	}

	function handleBlur(nextValue: string, element: HTMLDivElement) {
		if (!nextValue) {
			element.textContent = 'Skriv rubrik';
			onValueChange('Skriv rubrik');
			return;
		}

		onValueChange(nextValue);
	}
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />

<IntrinsicTextWidgetBase
	title="Rubrik"
	{x}
	{y}
	{w}
	{h}
	{scaleHeight}
	{z}
	{selected}
	value={value}
	fontFamily={textFontFamily}
	fontWeight={fontWeight}
	background={textBackground}
	color={textColor}
	borderRadius={textBorderRadius}
	{lineHeight}
	{letterSpacing}
	editable={true}
	multiline={true}
	ariaLabel="Redigera rubrik"
	className={font === 'display' ? 'display-font' : ''}
	onMeasure={onMeasure}
	onInput={onValueChange}
	{onSelect}
	{onMoveStart}
	{onResizeStart}
	{onBringForward}
	{onSendBackward}
	{onDelete}
	onBlur={handleBlur}
>
	{#snippet toolbarActions(toolbarPlacement)}
		<div
			bind:this={backgroundPickerElement}
			class="picker-control"
			data-toolbar-vertical={toolbarPlacement.vertical}
		>
			<button
				class:has-background={background !== 'none'}
				class:picker-open={openPicker === 'background'}
				class="toolbar-button style-preview-button style-toolbar-button"
				style={`--preview-fill:${textBackground};--preview-ink:${textColor};`}
				type="button"
				aria-expanded={openPicker === 'background'}
				aria-label={`Välj bakgrund för textwidgeten. Nuvarande stil är ${currentBackgroundLabel}.`}
				title={`Bakgrund: ${currentBackgroundLabel}`}
				onpointerdown={(event) => handlePickerButtonPointerDown(event, 'background')}
			>
				<span aria-hidden="true" class="style-toolbar-button__label">
					<span class="style-preview-chip"></span>
					<span class="style-toolbar-button__text">Bakgr.</span>
				</span>
			</button>

			{#if openPicker === 'background'}
				<div
					class="picker-popover"
					class:picker-popover--below-toolbar={toolbarPlacement.vertical === 'bottom'}
					class:picker-popover--above-toolbar={toolbarPlacement.vertical === 'top'}
					role="dialog"
					tabindex="-1"
					aria-label="Välj bakgrundsfärg för rubriken"
					onpointerdown={(event) => event.stopPropagation()}
				>
					<p class="picker-label">Bakgrund</p>
					<div class="palette-grid">
						<button
							class="palette-swatch palette-swatch--transparent"
							class:selected={background === 'none'}
							type="button"
							aria-label="Ingen bakgrund"
							title="Ingen"
							onclick={() => handleBackgroundPaletteSelect({ color: null })}
						>
							<span class="palette-swatch__inner palette-swatch__inner--transparent"></span>
						</button>
						{#each backgroundPaletteColors as swatch}
							<button
								class="palette-swatch"
								class:selected={swatch.value === selectedBackgroundSwatch}
								style={`--swatch-color:${swatch.value};`}
								type="button"
								aria-label={swatch.name}
								title={swatch.name}
								onclick={() => handleBackgroundPaletteSelect({ color: swatch.value })}
							>
								<span class="palette-swatch__inner"></span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div
			bind:this={colorPickerElement}
			class="picker-control"
			data-toolbar-vertical={toolbarPlacement.vertical}
		>
			<button
				class:picker-open={openPicker === 'color'}
				class="toolbar-button text-color-button style-toolbar-button"
				style={`--preview-ink:${textColor};`}
				type="button"
				aria-expanded={openPicker === 'color'}
				aria-label={`Välj textfärg för textwidgeten. Nuvarande stil är ${currentColorLabel}.`}
				title={`Textfärg: ${currentColorLabel}`}
				onpointerdown={(event) => handlePickerButtonPointerDown(event, 'color')}
			>
				<span aria-hidden="true" class="style-toolbar-button__label">
					<span class="text-color-icon">A</span>
					<span class="style-toolbar-button__text">Färg</span>
				</span>
			</button>

			{#if openPicker === 'color'}
				<div
					class="picker-popover picker-popover--right"
					class:picker-popover--below-toolbar={toolbarPlacement.vertical === 'bottom'}
					class:picker-popover--above-toolbar={toolbarPlacement.vertical === 'top'}
					role="dialog"
					tabindex="-1"
					aria-label="Välj textfärg för rubriken"
					onpointerdown={(event) => event.stopPropagation()}
				>
					<p class="picker-label">Textfärg</p>
					<div class="palette-grid">
						{#each colorPaletteColors as swatch}
							<button
								class="palette-swatch"
								class:selected={swatch.value === selectedColorSwatch}
								style={`--swatch-color:${swatch.value};`}
								type="button"
								aria-label={swatch.name}
								title={swatch.name}
								onclick={() => handleColorPaletteSelect({ color: swatch.value })}
							>
								<span class="palette-swatch__inner"></span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<button
			class:alt-font={font === 'display'}
			class="toolbar-button text-style-button style-toolbar-button"
			type="button"
			aria-label={`Byt typsnitt för textwidgeten. Nuvarande stil är ${currentFontLabel}.`}
			title={currentFontLabel}
			onclick={onToggleFont}
		>
			<span aria-hidden="true" class="style-toolbar-button__label">
				<span class="font-icon">Tt</span>
				<span class="style-toolbar-button__text">Font</span>
			</span>
		</button>
	{/snippet}
</IntrinsicTextWidgetBase>

<style>
	.picker-control {
		position: relative;
		display: inline-flex;
	}

	.picker-popover {
		position: absolute;
		right: 0;
		z-index: 10;
		min-width: 9rem;
		padding: 0.65rem 0.7rem 0.75rem;
		border: 1px solid color-mix(in srgb, var(--text) 10%, var(--border));
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--surface) 92%, var(--surface-soft));
		box-shadow:
			0 10px 30px color-mix(in srgb, black 22%, transparent),
			var(--shadow);
		backdrop-filter: blur(10px);
	}

	.picker-popover--below-toolbar {
		top: calc(100% + 0.55rem);
	}

	.picker-popover--above-toolbar {
		bottom: calc(100% + 0.55rem);
	}

	.picker-popover--right {
		right: 0;
	}

	.picker-label {
		margin: 0 0 0.5rem;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(1.15rem, 1fr));
		align-items: center;
		gap: 0.42rem;
	}

	.palette-swatch {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.15rem;
		height: 1.15rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--surface) 96%, white 4%);
		cursor: pointer;
		box-shadow: inset 0 0 0 1px color-mix(in srgb, white 16%, transparent);
	}

	.palette-swatch:hover {
		border-color: color-mix(in srgb, var(--text) 24%, transparent);
	}

	.palette-swatch:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--brand-primary-500) 55%, transparent);
		outline-offset: 2px;
	}

	.palette-swatch.selected {
		outline: 2px solid var(--brand-primary-600);
		outline-offset: 2px;
	}

	.palette-swatch--transparent {
		margin-top: 1px;
	}

	.palette-swatch__inner {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 999px;
		background: var(--swatch-color);
		border: 1px solid color-mix(in srgb, var(--text) 18%, transparent);
	}

	.palette-swatch__inner--transparent {
		background-image:
			linear-gradient(
				135deg,
				transparent calc(50% - 0.5px),
				color-mix(in srgb, var(--text) 28%, transparent) calc(50% - 0.5px),
				color-mix(in srgb, var(--text) 28%, transparent) calc(50% + 0.5px),
				transparent calc(50% + 0.5px)
			);
	}

	.style-preview-button {
		position: relative;
	}

	.style-toolbar-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: auto;
		min-width: 2.45rem;
		height: 1.8rem;
		padding: 0 0.45rem;
		border: 1px solid var(--border);
		border-radius: 0.45rem;
		background: var(--surface-soft);
		color: var(--text);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, white 8%, transparent);
		transition:
			background 120ms ease,
			border-color 120ms ease,
			color 120ms ease,
			box-shadow 120ms ease;
	}

	.style-toolbar-button:hover {
		background: color-mix(in srgb, var(--text) 8%, var(--surface-soft));
	}

	.style-toolbar-button:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--brand-primary-500) 55%, transparent);
		outline-offset: 1px;
	}

	.style-toolbar-button__label {
		display: inline-flex;
		align-items: center;
		gap: 0.28rem;
	}

	.style-toolbar-button__text {
		font-size: 0.63rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: inherit;
	}

	.style-preview-chip {
		width: 0.95rem;
		height: 0.95rem;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		border-radius: 0.24rem;
		background: var(--preview-fill);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, white 14%, transparent);
	}

	.style-preview-button:not(.has-background) .style-preview-chip {
		background-image:
			linear-gradient(
				135deg,
				transparent calc(50% - 0.5px),
				color-mix(in srgb, var(--text) 28%, transparent) calc(50% - 0.5px),
				color-mix(in srgb, var(--text) 28%, transparent) calc(50% + 0.5px),
				transparent calc(50% + 0.5px)
			);
	}

	.text-color-button .style-toolbar-button__text {
		color: var(--text);
	}

	.text-color-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		border-radius: 0.24rem;
		background: color-mix(in srgb, var(--surface) 88%, var(--text) 12%);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 16%, transparent);
		color: var(--preview-ink);
		position: relative;
		font-size: 0.92rem;
		font-weight: 900;
		line-height: 1;
	}

	.text-color-icon::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.12rem;
		height: 0.14rem;
		border-radius: 999px;
		background: currentColor;
	}

	.font-icon {
		font-family: var(--font-display);
		font-size: 0.86rem;
		line-height: 1;
	}

	.toolbar-button.picker-open {
		background: color-mix(in srgb, var(--brand-primary-500) 14%, var(--surface-soft));
		border-color: color-mix(in srgb, var(--brand-primary-500) 28%, var(--border));
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, white 10%, transparent),
			0 0 0 1px color-mix(in srgb, var(--brand-primary-500) 30%, transparent);
	}

	.text-style-button.alt-font {
		font-family: inherit;
	}
</style>
