import { Dimensions } from 'react-native';

// GravRel Metro Theme — genuine Windows 10 Mobile design language.
// Flat, sharp-cornered tiles. Bold accent colors per service.
// Dark canvas. Confident, oversized typography.
//
// Tile sizes are calculated from the REAL device screen width, not
// hardcoded pixels — this is what makes the grid actually fit on
// every phone, narrow or wide, instead of overflowing off-screen.

export const METRO = {
  background: '#060E1A',
  surface: '#0A1628',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#4B5563',

  accents: {
    green: '#1D9E75',
    blue: '#0078D7',
    purple: '#8B5CF6',
    amber: '#F0A30A',
    teal: '#00ABA9',
    magenta: '#D80073',
    gray: '#647687',
  },

  spacing: { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 40 },
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

// Real, responsive tile grid math. A "column unit" is half the
// available content width (screen width minus side padding and the
// gap between columns). Every tile size is built from that one real
// number, so the whole grid always fits — 360dp phone or 430dp phone.
function calculateTileDimensions() {
  const screenWidth = Dimensions.get('window').width;
  const sidePadding = METRO.spacing.lg; // matches HomeScreen's scroll padding
  const gap = METRO.spacing.sm;

  const contentWidth = screenWidth - sidePadding * 2;
  const colUnit = (contentWidth - gap) / 2;

  return {
    small:  { width: (colUnit - gap) / 2, height: (colUnit - gap) / 2 },
    medium: { width: colUnit, height: colUnit },
    wide:   { width: contentWidth, height: colUnit },
    large:  { width: colUnit, height: colUnit * 2 + gap },
  };
}

export const TILE_DIMENSIONS: Record<TileSize, { width: number; height: number }> = calculateTileDimensions();
