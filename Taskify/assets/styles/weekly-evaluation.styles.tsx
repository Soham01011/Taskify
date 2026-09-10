import { StyleSheet } from 'react-native';

export const getWeeklyEvaluationStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            padding: 16,
            paddingBottom: 40,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
            gap: 12,
        },
        loadingText: {
            color: colors.textSecondary,
            fontSize: 14,
        },
        errorTitle: {
            color: colors.text,
            fontSize: 20,
            fontWeight: '700',
        },
        errorMsg: {
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
        },
        retryBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            marginTop: 8,
        },
        retryBtnText: {
            color: '#fff',
            fontWeight: '700',
            fontSize: 15,
        },
        pageHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 14,
        },
        pageTitle: {
            flex: 1,
            color: colors.text,
            fontSize: 22,
            fontWeight: '800',
        },
        weekBadge: {
            color: colors.primary,
            fontSize: 13,
            fontWeight: '700',
            backgroundColor: colors.primary + '18',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
        },
        windowCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            marginBottom: 14,
        },
        windowText: {
            fontSize: 13,
        },
        rateCard: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
            gap: 20,
        },
        rateCircleWrap: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        rateCircle: {
            width: 90,
            height: 90,
            borderRadius: 45,
            borderWidth: 6,
            alignItems: 'center',
            justifyContent: 'center',
        },
        ratePercent: {
            fontSize: 22,
            fontWeight: '800',
        },
        rateLabel: {
            fontSize: 11,
        },
        rateStats: {
            flex: 1,
        },
        tilesRow: {
            flexDirection: 'row',
            marginHorizontal: -4,
            marginBottom: 14,
        },
        sectionCard: {
            borderWidth: 1,
            borderRadius: 16,
            padding: 18,
            marginBottom: 14,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 12,
        },
        subtaskRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        subtaskStat: {
            fontSize: 13,
        },
        subtaskPct: {
            fontSize: 13,
            fontWeight: '700',
        },
        barTrack: {
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
        },
        barFill: {
            height: '100%',
            borderRadius: 4,
        },
        barsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: 130,
        },
        dayCol: {
            flex: 1,
            alignItems: 'center',
            gap: 4,
        },
        dayCompletedLabel: {
            fontSize: 10,
            fontWeight: '700',
            height: 14,
        },
        dayBarTrack: {
            width: 24,
            flex: 1,
            borderRadius: 6,
            overflow: 'hidden',
            justifyContent: 'flex-end',
        },
        dayBarFill: {
            width: '100%',
            borderRadius: 6,
        },
        dayLabel: {
            fontSize: 11,
        },
        starLabel: {
            fontSize: 10,
            height: 14,
        },
        insightCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
            borderWidth: 1,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14,
        },
        insightText: {
            flex: 1,
            fontSize: 14,
            lineHeight: 20,
        },
        // Locked state
        lockedCard: {
            borderWidth: 1,
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            gap: 4,
        },
        lockedTitle: {
            color: colors.text,
            fontSize: 22,
            fontWeight: '800',
            marginBottom: 6,
        },
        lockedMsg: {
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 16,
        },
        countdownBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            marginBottom: 8,
        },
        countdownText: {
            fontSize: 13,
            fontWeight: '600',
        },
        nextDate: {
            fontSize: 12,
        },
    });

export const tileStyles = StyleSheet.create({
    tile: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 14,
        borderWidth: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    value: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 2,
    },
    label: {
        fontSize: 11,
        textAlign: 'center',
    },
});
