import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Calendar, Repeat, Clock, Check } from 'lucide-react-native';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'six-months' | 'annually' | 'schedule';

interface RecurrencePickerProps {
    colors: any;
    frequency: RecurrenceFrequency;
    setFrequency: (freq: RecurrenceFrequency) => void;
    daysOfWeek: number[];
    setDaysOfWeek: (days: number[]) => void;
    dayOfMonth: number | null;
    setDayOfMonth: (day: number | null) => void;
    lastWeekend: boolean;
    setLastWeekend: (val: boolean) => void;
    timeOfDay: Date | null;
    setTimeOfDay: (time: Date | null) => void;
    showTimePicker: () => void;
    startDate?: Date | null;
    setStartDate?: (date: Date | null) => void;
    endDate?: Date | null;
    setEndDate?: (date: Date | null) => void;
    showStartDatePicker?: () => void;
    showEndDatePicker?: () => void;
}

const DAYS = [
    { label: 'S', name: 'Sunday' },
    { label: 'M', name: 'Monday' },
    { label: 'T', name: 'Tuesday' },
    { label: 'W', name: 'Wednesday' },
    { label: 'T', name: 'Thursday' },
    { label: 'F', name: 'Friday' },
    { label: 'S', name: 'Saturday' },
];

export const RecurrencePicker: React.FC<RecurrencePickerProps> = ({
    colors,
    frequency,
    setFrequency,
    daysOfWeek,
    setDaysOfWeek,
    dayOfMonth,
    setDayOfMonth,
    lastWeekend,
    setLastWeekend,
    timeOfDay,
    setTimeOfDay,
    showTimePicker,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showStartDatePicker,
    showEndDatePicker
}) => {
    const toggleDay = (index: number) => {
        if (daysOfWeek.includes(index)) {
            setDaysOfWeek(daysOfWeek.filter(d => d !== index));
        } else {
            setDaysOfWeek([...daysOfWeek, index].sort());
        }
    };

    const frequencies: { label: string; value: RecurrenceFrequency }[] = [
        { label: 'None', value: 'none' },
        { label: 'Schedule', value: 'schedule' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: '6 Months', value: 'six-months' },
        { label: 'Annually', value: 'annually' },
    ];

    return (
        <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>RECURRENCE</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {frequencies.map((f) => (
                    <TouchableOpacity
                        key={f.value}
                        onPress={() => setFrequency(f.value)}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            backgroundColor: frequency === f.value ? colors.primary : colors.border,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                        }}
                    >
                        {frequency === f.value && <Check size={12} color={colors.white} />}
                        <Text style={{ fontSize: 12, color: frequency === f.value ? colors.white : colors.text }}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {frequency === 'daily' && (
                <View style={{ gap: 8 }}>
                    <TouchableOpacity
                        onPress={showTimePicker}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, backgroundColor: colors.border + '40' }}
                    >
                        <Clock size={16} color={colors.primary} />
                        <Text style={{ fontSize: 13, color: colors.text }}>
                            {timeOfDay ? `Occurs at ${timeOfDay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Select time (e.g. Nightly)'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {frequency === 'weekly' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 }}>
                    {DAYS.map((day, index) => (
                        <TouchableOpacity
                            key={day.name}
                            onPress={() => toggleDay(index)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: daysOfWeek.includes(index) ? colors.primary : colors.border,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontSize: 12, color: daysOfWeek.includes(index) ? colors.white : colors.text }}>{day.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {frequency === 'monthly' && (
                <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                            onPress={() => { setLastWeekend(false); setDayOfMonth(1); }}
                            style={{
                                flex: 1,
                                padding: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: !lastWeekend ? colors.primary : colors.border,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontSize: 12, color: !lastWeekend ? colors.primary : colors.text }}>Specific Date</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { setLastWeekend(true); setDayOfMonth(null); }}
                            style={{
                                flex: 1,
                                padding: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: lastWeekend ? colors.primary : colors.border,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ fontSize: 12, color: lastWeekend ? colors.primary : colors.text }}>Last Weekend</Text>
                        </TouchableOpacity>
                    </View>

                    {!lastWeekend && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setDayOfMonth(day)}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        backgroundColor: dayOfMonth === day ? colors.primary : colors.border,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 6
                                    }}
                                >
                                    <Text style={{ fontSize: 11, color: dayOfMonth === day ? colors.white : colors.text }}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {frequency === 'schedule' && (
                <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                            onPress={showStartDatePicker}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                padding: 10,
                                borderRadius: 8,
                                backgroundColor: colors.border + '30',
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        >
                            <Calendar size={16} color={colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '600' }}>START DATE</Text>
                                <Text style={{ fontSize: 12, color: colors.text, fontWeight: '500' }} numberOfLines={1}>
                                    {startDate ? startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Start Date'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={showEndDatePicker}
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                padding: 10,
                                borderRadius: 8,
                                backgroundColor: colors.border + '30',
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        >
                            <Calendar size={16} color={colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '600' }}>END DATE</Text>
                                <Text style={{ fontSize: 12, color: colors.text, fontWeight: '500' }} numberOfLines={1}>
                                    {endDate ? endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select End Date'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {startDate && endDate && (
                        <View style={{ paddingHorizontal: 4 }}>
                            {new Date(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), new Date(endDate).getDate()) <
                             new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth(), new Date(startDate).getDate()) ? (
                                <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '500' }}>
                                    End date cannot be before start date
                                </Text>
                            ) : (
                                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                                    {(() => {
                                        const startMid = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth(), new Date(startDate).getDate()).getTime();
                                        const endMid = new Date(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), new Date(endDate).getDate()).getTime();
                                        const days = Math.round((endMid - startMid) / (1000 * 60 * 60 * 24)) + 1;
                                        return `📅 Spans ${days} day${days > 1 ? 's' : ''} (generates daily tasks)`;
                                    })()}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            )}

            {frequency !== 'none' && (
                <TouchableOpacity
                    onPress={showTimePicker}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 8, borderRadius: 8, backgroundColor: colors.border + '40' }}
                >
                    <Clock size={16} color={colors.primary} />
                    <Text style={{ fontSize: 13, color: colors.text }}>
                        {timeOfDay ? `Occurs at ${timeOfDay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : frequency === 'schedule' ? 'Select daily time (e.g. 5:00 PM)' : 'Select time'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
