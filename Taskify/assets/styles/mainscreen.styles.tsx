import { StyleSheet } from 'react-native';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { Platform } from 'react-native';

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    headerSection: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    summary: {
        fontSize: 16,
        color: colors.textSecondary,
        opacity: 0.8,
    },

    // Active Section
    activeSection: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
        letterSpacing: 1,
    },

    // Group Progress Cards
    groupCard: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    groupCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    groupDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: SPACING.lg,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        borderRadius: 3,
    },

    // Tasks Section
    tasksSection: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    badge: {
        backgroundColor: colors.primary15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.primary,
        textTransform: 'uppercase',
    },

    listContent: {
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        marginTop: 12,
        opacity: 0.7,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 15px rgba(0, 174, 239, 0.4)',
    },
    fabTouch: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 98,
    },
    compactModalContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
});
