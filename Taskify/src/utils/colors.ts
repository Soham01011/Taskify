/**
 * Utility functions for color manipulation
 */

const FALLBACK_COLOR = '#00AEEF';

export const hexToRgba = (hex: string, opacity: number = 1): string => {
    if (!hex || typeof hex !== 'string') return `rgba(0, 174, 239, ${opacity})`;

    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getLighterShade = (rgba: string, factor: number = 0.5): string => {
    if (!rgba || typeof rgba !== 'string') return FALLBACK_COLOR;

    let r, g, b, a = 1;

    try {
        if (rgba.startsWith('#')) {
            r = parseInt(rgba.substring(1, 3), 16);
            g = parseInt(rgba.substring(3, 5), 16);
            b = parseInt(rgba.substring(5, 7), 16);
        } else if (rgba.startsWith('rgba')) {
            const parts = rgba.match(/[\d.]+/g);
            if (parts && parts.length >= 3) {
                r = parseInt(parts[0]);
                g = parseInt(parts[1]);
                b = parseInt(parts[2]);
                a = parseFloat(parts[3] || '1');
            } else {
                return rgba;
            }
        } else if (rgba.startsWith('rgb')) {
            const parts = rgba.match(/[\d.]+/g);
            if (parts && parts.length >= 3) {
                r = parseInt(parts[0]);
                g = parseInt(parts[1]);
                b = parseInt(parts[2]);
            } else {
                return rgba;
            }
        } else {
            return rgba;
        }

        const newR = Math.round(r + (255 - r) * factor);
        const newG = Math.round(g + (255 - g) * factor);
        const newB = Math.round(b + (255 - b) * factor);

        return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
    } catch (e) {
        return rgba || FALLBACK_COLOR;
    }
};

export const getOpacityVariant = (rgba: string, opacity: number): string => {
    if (!rgba || typeof rgba !== 'string') return `rgba(0, 174, 239, ${opacity})`;

    let r, g, b;

    try {
        if (rgba.startsWith('#')) {
            r = parseInt(rgba.substring(1, 3), 16);
            g = parseInt(rgba.substring(3, 5), 16);
            b = parseInt(rgba.substring(5, 7), 16);
        } else {
            const parts = rgba.match(/[\d.]+/g);
            if (parts && parts.length >= 3) {
                r = parseInt(parts[0]);
                g = parseInt(parts[1]);
                b = parseInt(parts[2]);
            } else {
                return rgba;
            }
        }

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } catch (e) {
        return rgba || FALLBACK_COLOR;
    }
};
