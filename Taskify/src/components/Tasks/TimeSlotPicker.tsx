import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Minus, Plus } from 'lucide-react-native';
import { RADIUS, SPACING } from '@/src/constants/theme';

interface TimeSlotPickerProps {
    colors: any;
    hours: number;          // 0–23
    setHours: (h: number) => void;
    minutes: number;        // 0, 15, 30, 45
    setMinutes: (m: number) => void;
    dueDate: Date | null;
}

/** Format total minutes as a readable label */
export const formatDurationLabel = (hours: number, minutes: number): string => {
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
};

const formatTime12 = (d: Date): string => {
    const h = d.getHours();
    const m = d.getMinutes();
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = String(m).padStart(2, '0');
    return `${displayHour}:${displayMin} ${period}`;
};

// Quick preset durations as { hours, minutes }
const PRESETS = [
    { label: '15m',   hours: 0, minutes: 15 },
    { label: '30m',   hours: 0, minutes: 30 },
    { label: '45m',   hours: 0, minutes: 45 },
    { label: '1h',    hours: 1, minutes: 0  },
    { label: '1h 30m',hours: 1, minutes: 30 },
    { label: '2h',    hours: 2, minutes: 0  },
    { label: '3h',    hours: 3, minutes: 0  },
];

const MINUTE_STEP = 15; // snap minutes to 0 / 15 / 30 / 45

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
    colors,
    hours,
    setHours,
    minutes,
    setMinutes,
    dueDate,
}) => {
    const totalMinutes = hours * 60 + minutes;

    // Compute displayed time window
    const startTimeStr = dueDate ? formatTime12(dueDate) : null;
    const endTimeStr = dueDate
        ? formatTime12(new Date(dueDate.getTime() + totalMinutes * 60000))
        : null;

    const adjustHours = (delta: number) => {
        const next = Math.max(0, Math.min(23, hours + delta));
        setHours(next);
    };

    const adjustMinutes = (delta: number) => {
        const nextRaw = minutes + delta * MINUTE_STEP;
        if (nextRaw < 0) {
            // Borrow an hour
            if (hours > 0) {
                setHours(hours - 1);
                setMinutes(60 - MINUTE_STEP);
            }
        } else if (nextRaw >= 60) {
            // Carry into hours
            setHours(Math.min(23, hours + 1));
            setMinutes(0);
        } else {
            setMinutes(nextRaw);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View style={styles.headerTitleRow}>
                    <Clock size={16} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        TIME SLOT / DURATION
                    </Text>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                    <Text style={[styles.durationBadgeText, { color: colors.primary }]}>
                        {formatDurationLabel(hours, minutes)}
                    </Text>
                </View>
            </View>

            {/* Time Window Preview */}
            {startTimeStr && endTimeStr && (
                <View style={[styles.previewBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                        Scheduled Window:
                    </Text>
                    <Text style={[styles.previewTime, { color: colors.text }]}>
                        {startTimeStr} – {endTimeStr}
                    </Text>
                </View>
            )}

            {/* Quick Presets */}
            <View style={styles.presetRow}>
                {PRESETS.map((p) => {
                    const isSelected = hours === p.hours && minutes === p.minutes;
                    return (
                        <TouchableOpacity
                            key={p.label}
                            style={[
                                styles.presetChip,
                                {
                                    backgroundColor: isSelected ? colors.primary : colors.background,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => { setHours(p.hours); setMinutes(p.minutes); }}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.presetChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Custom Hours + Minutes Steppers */}
            <View style={[styles.stepperRow, { borderTopColor: colors.border }]}>
                {/* Hours */}
                <View style={styles.stepperUnit}>
                    <Text style={[styles.stepperUnitLabel, { color: colors.textSecondary }]}>Hours</Text>
                    <View style={styles.stepperControls}>
                        <TouchableOpacity
                            style={[styles.stepBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => adjustHours(-1)}
                            disabled={hours <= 0}
                            activeOpacity={0.6}
                        >
                            <Minus size={14} color={hours <= 0 ? colors.border : colors.text} />
                        </TouchableOpacity>
                        <View style={styles.valueDisplay}>
                            <Text style={[styles.valueText, { color: colors.text }]}>{hours}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.stepBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => adjustHours(1)}
                            disabled={hours >= 23}
                            activeOpacity={0.6}
                        >
                            <Plus size={14} color={hours >= 23 ? colors.border : colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={[styles.colonSep, { color: colors.textSecondary }]}>:</Text>

                {/* Minutes */}
                <View style={styles.stepperUnit}>
                    <Text style={[styles.stepperUnitLabel, { color: colors.textSecondary }]}>Minutes</Text>
                    <View style={styles.stepperControls}>
                        <TouchableOpacity
                            style={[styles.stepBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => adjustMinutes(-1)}
                            disabled={hours === 0 && minutes === 0}
                            activeOpacity={0.6}
                        >
                            <Minus size={14} color={hours === 0 && minutes === 0 ? colors.border : colors.text} />
                        </TouchableOpacity>
                        <View style={styles.valueDisplay}>
                            <Text style={[styles.valueText, { color: colors.text }]}>
                                {String(minutes).padStart(2, '0')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.stepBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                            onPress={() => adjustMinutes(1)}
                            activeOpacity={0.6}
                        >
                            <Plus size={14} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        padding: SPACING.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    durationBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.round,
        borderWidth: 1,
    },
    durationBadgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    previewBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        marginBottom: SPACING.sm,
    },
    previewLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    previewTime: {
        fontSize: 12,
        fontWeight: '700',
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    presetChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
    },
    presetChipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        paddingTop: SPACING.sm,
        marginTop: 2,
        gap: 16,
    },
    stepperUnit: {
        alignItems: 'center',
        gap: 6,
    },
    stepperUnitLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colonSep: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 16,
    },
    stepBtn: {
        width: 34,
        height: 34,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueDisplay: {
        minWidth: 42,
        alignItems: 'center',
    },
    valueText: {
        fontSize: 20,
        fontWeight: '800',
    },
});
