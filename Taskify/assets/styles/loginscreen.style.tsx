import { COLORS, SPACING } from '@/src/constants/theme';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#e1f5fe',
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
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
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '500',
    },
    loginBtn: {
        marginTop: SPACING.sm,
    },
    errorText: {
        color: COLORS.danger,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    registerText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});