import { COLORS, SPACING, RADIUS } from '../../src/constants/theme';
import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.white,
    },
    backBtn: {
        padding: SPACING.xs,
        marginRight: SPACING.sm,
    },
    appBarTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl * 2,
    },
    section: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    footer: {
        marginTop: SPACING.md,
    },
    submitBtn: {
        backgroundColor: '#8E8E8E', // Gray as seen in screenshot "Continue"
    },
});