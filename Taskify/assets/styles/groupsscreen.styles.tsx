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
        backgroundColor: colors.secondary + '20',
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
});