import { StyleSheet } from "react-native";
import { SPACING, RADIUS, SHADOWS } from "@/src/constants/theme";

export const getStyles = (colors: any) => StyleSheet.create({
    cardContainer: {
        marginBottom: SPACING.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.sm,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    expandedCard: {
        borderColor: colors.primary,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        marginRight: SPACING.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxOverdue: {
        borderColor: colors.danger,
        backgroundColor: colors.danger + '10',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    completedTextStrike: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
    subtitleText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    overdueText: {
        color: colors.danger,
        fontWeight: '600',
    },
    rightAction: {
        marginLeft: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 24,
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarMock: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.card,
    },
    expandedContent: {
        overflow: 'hidden',
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: SPACING.sm,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: SPACING.md,
    },
    subtaskHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: SPACING.sm,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
    },
    deleteSubtaskBtn: {
        padding: SPACING.xs,
        marginRight: SPACING.xs,
    },
    subtaskMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtaskTitle: {
        fontSize: 14,
        color: colors.text,
        marginLeft: SPACING.sm,
    },
    subtaskCompletedText: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
});
