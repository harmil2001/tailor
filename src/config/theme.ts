import type { Theme } from './types'

// Default colours (the Dhaaga "soft slate" palette).
//
// These MUST match the `--color-*` tokens in src/app/globals.css: Tailwind needs the
// CSS copy to generate classes such as `bg-brand`, and the PDF invoice and QR labels
// need literal colours from here. `npm run shop:check` fails if the two copies drift.
export const DEFAULT_THEME: Theme = {
  canvas: '#f6f6f4',
  'surface-muted': '#efeeea',
  'surface-sunken': '#e4e3de',
  line: '#dddcd6',
  ink: '#2f3850',
  'ink-soft': '#666b77',
  'ink-muted': '#7b7f89',
  brand: '#3f4a63',
  'brand-deep': '#343e55',
  'brand-wash': '#f1f3f7',
  'brand-tint': '#e6e9f0',
  'brand-tint-strong': '#d3d9e6',
  accent: '#8c7242',
  'accent-ink': '#6e5a30',
  'accent-soft': '#c9ae7c',
  'accent-line': '#e2d6bd',
  'accent-wash': '#f8f4ea',
  'accent-tint': '#f1e9d8',
  'accent-tint-strong': '#e6d8b8',
  danger: '#a8443d',
  'danger-ink': '#8a3a34',
  'danger-soft': '#e0a39d',
  'danger-wash': '#faf0ee',
  'danger-tint': '#f4e1de',
  'danger-tint-strong': '#e9c8c3',
  success: '#3f6b54',
  'success-wash': '#f0f6f2',
  'success-tint': '#e1ede5',
  'success-tint-strong': '#c9ddd0',
  'info-ink': '#3a4a78',
  'info-tint': '#dfe5f0',
  'info-tint-strong': '#cbd4e6',
  'neutral-tint': '#e9e8e4',
  'plum-ink': '#5e4a72',
  'plum-tint': '#ece6f0',
  'plum-tint-strong': '#dcd2e4',
  'rose-ink': '#7e4459',
  'rose-tint': '#f2e4e9',
  'rose-tint-strong': '#e6cfd8',
}

/** Default palette with a shop's overrides applied on top. */
export function resolveTheme(overrides: Partial<Theme> = {}): Theme {
  return { ...DEFAULT_THEME, ...overrides }
}

/** Only the colours a shop actually changes, as CSS variables for the <html> element. */
export function themeOverrideStyle(overrides: Partial<Theme> = {}): Record<string, string> {
  const style: Record<string, string> = {}
  for (const [key, value] of Object.entries(overrides)) {
    if (value && value.toLowerCase() !== DEFAULT_THEME[key as keyof Theme]) {
      style[`--color-${key}`] = value
    }
  }
  return style
}
