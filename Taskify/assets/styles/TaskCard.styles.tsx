import { StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/src/constants/theme";
export const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.sm,
        overflow: 'hidden', // Fixes rounded corners clipping
        borderWidth: 1,
        borderColor: 'transparent', // Default border to avoid jump
    },
    expandedCard: {
        borderColor: COLORS.primary,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginRight: SPACING.sm,
    },
    completedTextStrike: {
        textDecorationLine: 'line-through',
        color: COLORS.textSecondary,
    },
    subtaskCountBadge: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    subtaskCountText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primary,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: SPACING.sm,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    overdueText: {
        color: COLORS.danger,
        fontWeight: '600',
    },
    expandIcon: {
        marginLeft: SPACING.sm,
    },
    actionBtn: {
        padding: SPACING.xs,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: SPACING.md,
    },
    subtaskHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    subtasksList: {
        marginTop: SPACING.xs,
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
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },
    subtaskCompletedText: {
        textDecorationLine: 'line-through',
        color: COLORS.textSecondary,
    },
    alarmIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING.md,
        backgroundColor: '#FFF8F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        gap: 4,
    },
    alarmTime: {
        fontSize: 10,
        fontWeight: '600',
        color: '#E67E22',
    }
});
