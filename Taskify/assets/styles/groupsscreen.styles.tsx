import { SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import { StyleSheet } from 'react-native';

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    subHeader: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    addBtn: {
        padding: SPACING.sm,
    },
    listContent: {
        padding: SPACING.md,
    },
    groupCard: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
        alignItems: 'center',
    },
    groupIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    groupDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: SPACING.xs,
    },
    groupMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    metaText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    adminText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.secondary,
        marginLeft: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    progressSection: {
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    progressValue: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    subtaskHeader: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    visibilityToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    visibilityText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    emptyTasksText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: SPACING.md,
        fontStyle: 'italic',
    },
    viewMoreBtn: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    viewMoreText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: SPACING.sm,
    },
    subtaskItem: {
        paddingVertical: 4,
    },
    subtaskMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subtaskTitle: {
        fontSize: 14,
        color: colors.text,
    },
    subtaskCompletedText: {
        textDecorationLine: 'line-through',
        color: colors.textSecondary,
    },
});