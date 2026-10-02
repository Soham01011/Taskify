import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from '@/src/constants/theme';

const HOUR_HEIGHT = 64;
const VISIBLE_HOURS = 3;
const SCHEDULE_CONTAINER_HEIGHT = HOUR_HEIGHT * VISIBLE_HOURS;
const TOTAL_DAY_HEIGHT = HOUR_HEIGHT * 24;

export const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nowCapsule: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        gap: 4,
    },
    nowDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    nowBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    nowDateText: {
        fontSize: 12,
        fontWeight: '500',
    },
    todayTag: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    scheduleCard: {
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    daysScrollView: {
        paddingVertical: 10,
    },
    daysScrollContent: {
        paddingHorizontal: SPACING.md,
        alignItems: 'center',
        gap: 8,
    },
    dayChip: {
        width: 46,
        paddingVertical: 8,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayChipSelected: {},
    dayChipName: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    dayChipNumber: {
        fontSize: 15,
        fontWeight: '800',
    },
    todayDotIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 3,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.6,
    },
    scheduleViewport: {
        height: SCHEDULE_CONTAINER_HEIGHT,
        overflow: 'hidden',
    },
    timelineContent: {
        height: TOTAL_DAY_HEIGHT,
    },
    timelineRow: {
        flexDirection: 'row',
        height: TOTAL_DAY_HEIGHT,
    },
    timeLabelsColumn: {
        width: 54,
        paddingLeft: SPACING.md,
    },
    timeLabelSlot: {
        justifyContent: 'flex-start',
        paddingTop: 2,
    },
    timeLabelText: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.7,
    },
    timelineGridArea: {
        flex: 1,
        position: 'relative',
        height: TOTAL_DAY_HEIGHT,
    },
    gridLineSlot: {
        borderTopWidth: 1,
    },
    currentTimeIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        transform: [{ translateY: -3 }],
    },
    currentTimeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    currentTimeLine: {
        flex: 1,
        height: 2,
    },
    taskBlock: {
        position: 'absolute',
        marginHorizontal: 2,
        borderRadius: RADIUS.sm,
        borderLeftWidth: 3,
        paddingHorizontal: 8,
        paddingVertical: 3,
        zIndex: 5,
        overflow: 'hidden',
    },
    taskBlockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskBlockTitle: {
        fontSize: 11,
        fontWeight: '700',
        flex: 1,
        marginRight: 4,
    },
    taskCompletedTitle: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    taskBlockIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taskBlockTime: {
        fontSize: 9,
        fontWeight: '600',
        marginTop: 1,
    },
    emptySlot: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    emptySlotText: {
        fontSize: 12,
        fontWeight: '500',
    },
});