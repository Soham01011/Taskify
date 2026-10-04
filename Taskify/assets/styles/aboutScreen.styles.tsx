import { RADIUS, SHADOWS, SPACING } from '@/src/constants/theme';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    version: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.sm,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    githubBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    githubBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '500',
    },
});