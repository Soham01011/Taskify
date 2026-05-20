import { useAppTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { Activity, CalendarDays, ChevronRight, Network, PieChart, StickyNote } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
    {
        id: 'calendar',
        title: 'Calendar',
        description: 'View and manage your tasks by date',
        icon: CalendarDays,
        route: '/calendar',
        active: true
    },
    {
        id: 'analytics',
        title: 'Analytics',
        description: 'Track your productivity trends',
        icon: PieChart,
        route: '/analytics',
        active: true
    },
    {
        id: 'notes',
        title: 'Secure Notes',
        description: 'A secure local storage to  save notes and passwords',
        icon: StickyNote,
        active: true,
        route: '/securenotes'
    },
    {
        id: 'workflows',
        title: 'Workflows',
        description: 'Plan your daily task and ideas in a workflow',
        icon: Network,
        active: true,
        route: '/workflows'
    },
    {
        id: 'habits',
        title: 'Habits',
        description: 'Build and monitor daily habits',
        icon: Activity,
        route: '/habits',
        active: false
    }

];

export default function MoreScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();

    const handlePress = (feature: any) => {
        if (feature.active) {
            router.push(feature.route);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>More Features</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {FEATURES.map((feature) => (
                    <TouchableOpacity
                        key={feature.id}
                        style={[
                            styles.featureCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                opacity: feature.active ? 1 : 0.6
                            }
                        ]}
                        onPress={() => handlePress(feature)}
                        disabled={!feature.active}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <feature.icon size={24} color={colors.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.featureTitle, { color: colors.text }]}>
                                {feature.title}
                                {!feature.active && (
                                    <Text style={[styles.comingSoon, { color: colors.primary }]}>  • Soon</Text>
                                )}
                            </Text>
                            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                                {feature.description}
                            </Text>
                        </View>
                        {feature.active && (
                            <ChevronRight size={20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
    },
    comingSoon: {
        fontSize: 12,
        fontWeight: 'bold',
    }
});
