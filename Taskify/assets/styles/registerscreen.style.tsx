import { SPACING, RADIUS } from '../../src/constants/theme';
import { StyleSheet, Platform } from 'react-native';

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: colors.card,
    },
    backBtn: {
        padding: SPACING.xs,
        marginRight: SPACING.sm,
    },
    appBarTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl * 2,
    },
    section: {
        backgroundColor: colors.card,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: SPACING.xs,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    footer: {
        marginTop: SPACING.md,
    },
    submitBtn: {
        backgroundColor: colors.primary,
    },
});