import { SPACING } from '@/src/constants/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 2,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: colors.border,
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: colors.primary,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: SPACING.md,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: SPACING.sm,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.lg,
    },
    forgotText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    loginBtn: {
        marginTop: SPACING.sm,
    },
    errorText: {
        color: colors.danger,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    registerText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});