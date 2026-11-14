/**
 * Utility functions for color manipulation and RGB <-> HSV <-> HEX conversions
 */

const FALLBACK_COLOR = '#00AEEF';

export interface RGBColor {
    r: number; // 0 - 255
    g: number; // 0 - 255
    b: number; // 0 - 255
    a?: number; // 0 - 1
}

export interface HSVColor {
    h: number; // 0 - 360
    s: number; // 0 - 1
    v: number; // 0 - 1
    a?: number; // 0 - 1
}

/**
 * Converts RGB object to HSV object.
 * r, g, b in [0, 255]
 * Returns { h: [0, 360], s: [0, 1], v: [0, 1] }
 */
export const rgbToHsv = (rgb: RGBColor): HSVColor => {
    const r = Math.max(0, Math.min(255, rgb.r)) / 255;
    const g = Math.max(0, Math.min(255, rgb.g)) / 255;
    const b = Math.max(0, Math.min(255, rgb.b)) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        } else if (max === g) {
            h = ((b - r) / delta + 2) * 60;
        } else {
            h = ((r - g) / delta + 4) * 60;
        }
    }

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return {
        h: Math.round(h * 10) / 10,
        s: Math.round(s * 1000) / 1000,
        v: Math.round(v * 1000) / 1000,
        ...(rgb.a !== undefined ? { a: rgb.a } : {})
    };
};

/**
 * Converts HSV object to RGB object.
 * h in [0, 360], s in [0, 1], v in [0, 1]
 * Returns { r: [0, 255], g: [0, 255], b: [0, 255] }
 */
export const hsvToRgb = (hsv: HSVColor): RGBColor => {
    const h = ((hsv.h % 360) + 360) % 360;
    const s = Math.max(0, Math.min(1, hsv.s));
    const v = Math.max(0, Math.min(1, hsv.v));

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let rPrime = 0;
    let gPrime = 0;
    let bPrime = 0;

    const sector = Math.floor(h / 60) % 6;
    switch (sector) {
        case 0:
            rPrime = c;
            gPrime = x;
            bPrime = 0;
            break;
        case 1:
            rPrime = x;
            gPrime = c;
            bPrime = 0;
            break;
        case 2:
            rPrime = 0;
            gPrime = c;
            bPrime = x;
            break;
        case 3:
            rPrime = 0;
            gPrime = x;
            bPrime = c;
            break;
        case 4:
            rPrime = x;
            gPrime = 0;
            bPrime = c;
            break;
        case 5:
            rPrime = c;
            gPrime = 0;
            bPrime = x;
            break;
    }

    return {
        r: Math.round((rPrime + m) * 255),
        g: Math.round((gPrime + m) * 255),
        b: Math.round((bPrime + m) * 255),
        ...(hsv.a !== undefined ? { a: hsv.a } : {})
    };
};

/**
 * Converts Hex string to RGB object.
 */
export const hexToRgb = (hex: string): RGBColor => {
    if (!hex || typeof hex !== 'string') {
        return { r: 0, g: 174, b: 239, a: 1 };
    }

    const cleanHex = hex.replace('#', '').trim();
    let r = 0, g = 0, b = 0, a = 1;

    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    } else if (cleanHex.length === 8) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
        a = Math.round((parseInt(cleanHex.substring(6, 8), 16) / 255) * 100) / 100;
    }

    return {
        r: isNaN(r) ? 0 : r,
        g: isNaN(g) ? 0 : g,
        b: isNaN(b) ? 0 : b,
        a
    };
};

/**
 * Converts RGB object to Hex string.
 */
export const rgbToHex = (rgb: RGBColor): string => {
    const toHex = (n: number) => {
        const clamped = Math.max(0, Math.min(255, Math.round(n)));
        const h = clamped.toString(16);
        return h.length === 1 ? '0' + h : h;
    };

    const baseHex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();

    if (rgb.a !== undefined && rgb.a < 0.999) {
        const alphaHex = toHex(rgb.a * 255).toUpperCase();
        return `${baseHex}${alphaHex}`;
    }

    return baseHex;
};

/**
 * Converts Hex string directly to HSV object.
 */
export const hexToHsv = (hex: string): HSVColor => {
    return rgbToHsv(hexToRgb(hex));
};

/**
 * Converts HSV object directly to Hex string.
 */
export const hsvToHex = (hsv: HSVColor): string => {
    return rgbToHex(hsvToRgb(hsv));
};

/**
 * Parses any color format (hex, rgb string, rgba string, or object)
 * into a complete set of { hex, rgb, hsv }.
 */
export const parseColorToAllFormats = (colorInput: string | RGBColor | HSVColor) => {
    let rgb: RGBColor;

    if (typeof colorInput === 'string') {
        if (colorInput.startsWith('#')) {
            rgb = hexToRgb(colorInput);
        } else if (colorInput.startsWith('rgb')) {
            const parts = colorInput.match(/[\d.]+/g);
            if (parts && parts.length >= 3) {
                rgb = {
                    r: parseInt(parts[0], 10),
                    g: parseInt(parts[1], 10),
                    b: parseInt(parts[2], 10),
                    a: parts[3] ? parseFloat(parts[3]) : 1,
                };
            } else {
                rgb = { r: 0, g: 174, b: 239, a: 1 };
            }
        } else {
            rgb = hexToRgb(colorInput);
        }
    } else if ('h' in colorInput && 's' in colorInput && 'v' in colorInput) {
        rgb = hsvToRgb(colorInput);
    } else if ('r' in colorInput && 'g' in colorInput && 'b' in colorInput) {
        rgb = colorInput;
    } else {
        rgb = { r: 0, g: 174, b: 239, a: 1 };
    }

    const hex = rgbToHex(rgb);
    const hsv = rgbToHsv(rgb);

    return { hex, rgb, hsv };
};

/**
 * Returns formatted RGB display string e.g. "RGB(0, 174, 239)"
 */
export const formatRgb = (rgb: RGBColor): string => {
    return `RGB(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
};

/**
 * Returns formatted HSV display string e.g. "HSV(196°, 100%, 94%)"
 */
export const formatHsv = (hsv: HSVColor): string => {
    return `HSV(${Math.round(hsv.h)}°, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%)`;
};

export const hexToRgba = (hex: string, opacity: number = 1): string => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getLighterShade = (rgba: string, factor: number = 0.5): string => {
    if (!rgba || typeof rgba !== 'string') return FALLBACK_COLOR;

    try {
        const { r, g, b, a } = parseColorToAllFormats(rgba).rgb;
        const newR = Math.round(r + (255 - r) * factor);
        const newG = Math.round(g + (255 - g) * factor);
        const newB = Math.round(b + (255 - b) * factor);

        return `rgba(${newR}, ${newG}, ${newB}, ${a ?? 1})`;
    } catch {
        return rgba || FALLBACK_COLOR;
    }
};

export const getOpacityVariant = (rgba: string, opacity: number): string => {
    if (!rgba || typeof rgba !== 'string') return `rgba(0, 174, 239, ${opacity})`;

    try {
        const { r, g, b } = parseColorToAllFormats(rgba).rgb;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch {
        return `rgba(0, 174, 239, ${opacity})`;
    }
};
