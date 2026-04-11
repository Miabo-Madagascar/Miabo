/**
 * Exports TS des design tokens — miroir de tokens.css.
 * Ne jamais hardcoder ces valeurs ailleurs dans le code.
 */

export const colors = {
  primary: {
    50:  "var(--color-primary-50)",
    100: "var(--color-primary-100)",
    200: "var(--color-primary-200)",
    300: "var(--color-primary-300)",
    400: "var(--color-primary-400)",
    500: "var(--color-primary-500)",
    600: "var(--color-primary-600)",
    700: "var(--color-primary-700)",
    800: "var(--color-primary-800)",
    900: "var(--color-primary-900)",
  },
  secondary: {
    50:  "var(--color-secondary-50)",
    100: "var(--color-secondary-100)",
    200: "var(--color-secondary-200)",
    300: "var(--color-secondary-300)",
    400: "var(--color-secondary-400)",
    500: "var(--color-secondary-500)",
    600: "var(--color-secondary-600)",
    700: "var(--color-secondary-700)",
    800: "var(--color-secondary-800)",
    900: "var(--color-secondary-900)",
  },
  neutral: {
    0:   "var(--color-neutral-0)",
    50:  "var(--color-neutral-50)",
    100: "var(--color-neutral-100)",
    200: "var(--color-neutral-200)",
    300: "var(--color-neutral-300)",
    400: "var(--color-neutral-400)",
    500: "var(--color-neutral-500)",
    600: "var(--color-neutral-600)",
    700: "var(--color-neutral-700)",
    800: "var(--color-neutral-800)",
    900: "var(--color-neutral-900)",
  },
  state: {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error:   "var(--color-error)",
    info:    "var(--color-info)",
  },
} as const

export const typography = {
  fontFamily: {
    sans:    "var(--font-sans)",
    display: "var(--font-display)",
    mono:    "var(--font-mono)",
  },
  fontSize: {
    xs:   "var(--text-xs)",
    sm:   "var(--text-sm)",
    base: "var(--text-base)",
    lg:   "var(--text-lg)",
    xl:   "var(--text-xl)",
    "2xl": "var(--text-2xl)",
    "3xl": "var(--text-3xl)",
    "4xl": "var(--text-4xl)",
  },
  fontWeight: {
    normal:   "var(--font-normal)",
    medium:   "var(--font-medium)",
    semibold: "var(--font-semibold)",
    bold:     "var(--font-bold)",
  },
} as const

export const spacing = {
  1:  "var(--space-1)",
  2:  "var(--space-2)",
  3:  "var(--space-3)",
  4:  "var(--space-4)",
  5:  "var(--space-5)",
  6:  "var(--space-6)",
  8:  "var(--space-8)",
  10: "var(--space-10)",
  12: "var(--space-12)",
  16: "var(--space-16)",
  20: "var(--space-20)",
} as const

export const radius = {
  sm:   "var(--radius-sm)",
  md:   "var(--radius-md)",
  lg:   "var(--radius-lg)",
  xl:   "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  full: "var(--radius-full)",
} as const

export const shadows = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
} as const

export const transitions = {
  fast: "var(--transition-fast)",
  base: "var(--transition-base)",
  slow: "var(--transition-slow)",
} as const

export type ColorScale   = typeof colors.primary
export type SpacingScale = typeof spacing
