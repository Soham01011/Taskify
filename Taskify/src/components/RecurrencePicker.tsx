import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Calendar, Repeat, Clock, Check } from 'lucide-react-native';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'six-months' | 'annually';

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
    timeOfDay: string | null;
    setTimeOfDay: (time: string | null) => void;
    showTimePicker: () => void;
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
    showTimePicker
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
                            {timeOfDay ? `Occurs at ${timeOfDay}` : 'Select time (e.g. Nightly)'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {frequency === 'weekly' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 }}>
                    {DAYS.map((day, index) => (
                        <TouchableOpacity
                            key={index}
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
                            <Text style={{ fontSize: 12, color: daysOfWeek.includes(index) ? colors.white : colors.text }}>{day}</Text>
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

            {frequency !== 'none' && (
                <TouchableOpacity
                    onPress={showTimePicker}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 8, borderRadius: 8, backgroundColor: colors.border + '40' }}
                >
                    <Clock size={16} color={colors.primary} />
                    <Text style={{ fontSize: 13, color: colors.text }}>
                        {timeOfDay ? `Occurs at ${timeOfDay}` : 'Select time'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
