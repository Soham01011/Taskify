export const PALETTE = {
    light: {
        primary: '#00AEEF',
        secondary: '#2ECC71',
        danger: '#E74C3C',
        background: '#F8F9FA',
        card: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#7F8C8D',
        border: '#E0E0E0',
        inputBg: '#FFFFFF',
        placeholder: '#95A5A6',
        overlay: 'rgba(0,0,0,0.5)',
        white: '#FFFFFF',
    },
    dark: {
        primary: '#00AEEF',
        secondary: '#2ECC71',
        danger: '#E74C3C',
        background: '#121212',
        card: '#1E1E1E',
        text: '#F8F9FA',
        textSecondary: '#A0A0A0',
        border: '#333333',
        inputBg: '#2C2C2C',
        placeholder: '#666666',
        overlay: 'rgba(0,0,0,0.7)',
        white: '#FFFFFF',
    }
};

// Legacy support for existing styles (defaults to light)
export const COLORS = PALETTE.light;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
};
