import { basedOnPreferredColorScheme } from "@pmndrs/uikit";
import { Color } from "three";

function hsl(h: number, s: number, l: number) {
    return new Color().setHSL(h / 360, s / 100, l / 100, 'srgb')
  }

// OKLCH to RGB conversion
// Based on the OKLCH color space: https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
function oklch(lin: number, cin: number, h: number) {
    const l = lin / 100;
    const c = cin / 100;
  // Convert OKLCH to Oklab
  const hRadians = h * (Math.PI / 180);
  const a = c * Math.cos(hRadians);
  const b_lab = c * Math.sin(hRadians);
  
  // Convert Oklab to linear RGB
  // Using the Oklab transformation matrix
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b_lab;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b_lab;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b_lab;
  
  // Apply non-linear transformation
  const l_cubed = l_ * l_ * l_;
  const m_cubed = m_ * m_ * m_;
  const s_cubed = s_ * s_ * s_;
  
  // Convert to linear RGB
  const r = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed;
  const g = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed;
  const b_rgb = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed;
  
  // Create and return a Three.js Color
  // Three.js will handle clamping and gamma correction
  return new Color(r, g, b_rgb);
}

const LIGHT_HUE = {
    mono: 108,
    attention: 108,
    destructive: 15,
    secondary: 250,
    selection: 284
}

const DARK_HUE = {
    mono: 0,
    attention: 105,
    destructive: 15,
    secondary: 250,
    selection: 285
}

const theme = {
    light: {
        focus: oklch(66, 50, 284),
        required: hsl(0, 100, 70),
        surface: oklch(100, 0, LIGHT_HUE.mono),
        paper: oklch(98, 0, LIGHT_HUE.mono),
        hover: oklch(98, 0, LIGHT_HUE.mono),
        press: oklch(96, 0, LIGHT_HUE.mono),
        border: oklch(88, 0, LIGHT_HUE.mono),
        faded: oklch(66, 0, LIGHT_HUE.mono),
        ink: oklch(40, 0, LIGHT_HUE.mono),
        destructiveSurface: oklch(100, 5, LIGHT_HUE.destructive),
        destructivePaper: oklch(100, 12, LIGHT_HUE.destructive),
        destructiveHover: oklch(98, 15, LIGHT_HUE.destructive),
        destructivePress: oklch(96, 18, LIGHT_HUE.destructive),
        destructiveBorder: oklch(88, 8, LIGHT_HUE.destructive),
        destructiveFaded: oklch(66, 5, LIGHT_HUE.destructive),
        destructiveInk: oklch(40, 5, LIGHT_HUE.destructive),
        attentionSurface: oklch(100, 5, LIGHT_HUE.attention),
        attentionPaper: oklch(100, 12, LIGHT_HUE.attention),
        attentionHover: oklch(98, 15, LIGHT_HUE.attention),
        attentionPress: oklch(96, 18, LIGHT_HUE.attention),
        attentionBorder: oklch(88, 8, LIGHT_HUE.attention),
        attentionFaded: oklch(66, 5, LIGHT_HUE.attention),
        attentionInk: oklch(40, 5, LIGHT_HUE.attention),
        secondarySurface: oklch(100, 5, LIGHT_HUE.secondary),
        secondaryPaper: oklch(100, 12, LIGHT_HUE.secondary),
        secondaryHover: oklch(98, 15, LIGHT_HUE.secondary),
        secondaryPress: oklch(96, 18, LIGHT_HUE.secondary),
        secondaryBorder: oklch(88, 8, LIGHT_HUE.secondary),
        secondaryFaded: oklch(66, 5, LIGHT_HUE.secondary),
        secondaryInk: oklch(40, 5, LIGHT_HUE.secondary),
        selectionSurface: oklch(100, 5, LIGHT_HUE.selection),
        selectionPaper: oklch(100, 12, LIGHT_HUE.selection),
        selectionHover: oklch(98, 15, LIGHT_HUE.selection),
        selectionPress: oklch(96, 18, LIGHT_HUE.selection),
        selectionBorder: oklch(88, 8, LIGHT_HUE.selection),
        selectionFaded: oklch(66, 5, LIGHT_HUE.selection),
        selectionInk: oklch(40, 5, LIGHT_HUE.selection),
    },
    dark: {
        focus: hsl(56, 100, 70),
        required: hsl(0, 100, 70),
        surface: oklch(25, 0, DARK_HUE.mono),
        paper: oklch(32, 0, DARK_HUE.mono),
        hover: oklch(36, 0, DARK_HUE.mono),
        press: oklch(42, 0, DARK_HUE.mono),
        border: oklch(45, 0, DARK_HUE.mono),
        faded: oklch(72, 0, DARK_HUE.mono),
        ink: oklch(95, 0, DARK_HUE.mono),
        destructiveSurface: oklch(25, 5, DARK_HUE.destructive),
        destructivePaper: oklch(32, 10, DARK_HUE.destructive),
        destructiveHover: oklch(36, 15, DARK_HUE.destructive),
        destructivePress: oklch(42, 20, DARK_HUE.destructive),
        destructiveBorder: oklch(45, 25, DARK_HUE.destructive),
        destructiveFaded: oklch(72, 35, DARK_HUE.destructive),
        destructiveInk: oklch(95, 35, DARK_HUE.destructive),
        attentionSurface: oklch(25, 5, DARK_HUE.attention),
        attentionPaper: oklch(32, 10, DARK_HUE.attention),
        attentionHover: oklch(36, 15, DARK_HUE.attention),
        attentionPress: oklch(42, 20, DARK_HUE.attention),
        attentionBorder: oklch(45, 25, DARK_HUE.attention),
        attentionFaded: oklch(72, 35, DARK_HUE.attention),
        attentionInk: oklch(95, 35, DARK_HUE.attention),
        secondarySurface: oklch(25, 5, DARK_HUE.secondary),
        secondaryPaper: oklch(32, 10, DARK_HUE.secondary),
        secondaryHover: oklch(36, 15, DARK_HUE.secondary),
        secondaryPress: oklch(42, 20, DARK_HUE.secondary),
        secondaryBorder: oklch(45, 25, DARK_HUE.secondary),
        secondaryFaded: oklch(72, 35, DARK_HUE.secondary),
        secondaryInk: oklch(95, 35, DARK_HUE.secondary),
        selectionSurface: oklch(25, 5, DARK_HUE.selection),
        selectionPaper: oklch(32, 10, DARK_HUE.selection),
        selectionHover: oklch(36, 15, DARK_HUE.selection),
        selectionPress: oklch(42, 20, DARK_HUE.selection),
        selectionBorder: oklch(45, 25, DARK_HUE.selection),
        selectionFaded: oklch(72, 35, DARK_HUE.selection),
        selectionInk: oklch(95, 35, DARK_HUE.selection),
    }
}

export const colors = basedOnPreferredColorScheme(theme);