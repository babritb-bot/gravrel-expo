// GravRel Metro Theme — genuine Windows 10 Mobile design language.
// Flat, sharp-cornered tiles. Bold accent colors per service.
// Dark canvas. Confident, oversized typography. No shadows, no
// rounded corners — Metro's whole identity was flatness and color.

export const METRO = {
  background: '#060E1A',   // deep near-black canvas
  surface: '#0A1628',      // slightly lifted surface (rare use)
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#4B5563',

  // Real Metro-style accent palette — each service gets its own
  // saturated, distinct tile color, same way Windows Phone assigned
  // Mail=blue, Photos=purple, Store=orange, etc.
  accents: {
    green: '#1D9E75',    // GravRel primary — VMs
    blue: '#0078D7',     // Databases (genuine Windows Phone blue)
    purple: '#8B5CF6',   // Kubernetes
    amber: '#F0A30A',    // Storage (genuine Windows Phone amber/gold)
    teal: '#00ABA9',     // Best Answer (genuine Windows Phone teal)
    magenta: '#D80073',  // Billing (genuine Windows Phone magenta)
    gray: '#647687',     // Settings (genuine Windows Phone steel/gray)
  },

  spacing: { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 40 },

  // Metro used NO rounded corners — sharp edges are core to the identity
  radius: 0,

  fontSizes: {
    tileLabel: 15,
    tileNumber: 34,
    heading: 42,
    subheading: 20,
    body: 15,
    caption: 12,
  },

  fontWeights: {
    light: '300' as const,
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type TileSize = 'small' | 'medium' | 'wide' | 'large';

// Real Metro tile dimensions, proportional to a 2-column base grid
export const TILE_DIMENSIONS: Record<TileSize, { width: number; height: number }> = {
  small:  { width: 78,  height: 78 },
  medium: { width: 162, height: 162 },
  wide:   { width: 342, height: 162 },
  large:  { width: 342, height: 342 },
};
