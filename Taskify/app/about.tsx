import { useAppTheme } from '@/hooks/use-theme';
import { RADIUS, SHADOWS, SPACING } from '@/src/constants/theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Code, Database, Github, Heart } from 'lucide-react-native';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const { colors, isDark } = useAppTheme();

    const openGithub = () => {
        Linking.openURL('https://github.com/Soham01011/Taskify');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'About Taskify',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.card },
                headerTintColor: colors.text,
            }} />
            <StatusBar style={isDark ? 'light' : 'dark'} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: colors.primary15 }]}>
                        <CheckCircle size={40} color={colors.primary} strokeWidth={3} />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>Taskify</Text>
                    <Text style={[styles.version, { color: colors.textSecondary }]}>Version 0.0.2</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Heart size={20} color={colors.danger} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Open Source</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                            Taskify is a completely open-source project designed to help you stay organized without compromising your privacy or freedom.
                            We believe in build-in-public and transparent development.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Database size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Transparency</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                            Your data is recorded and stored on the backend specified in your account settings.
                            Whoever is hosting the backend has access to the stored data. If you&apos;re using a private instance,
                            your data remains on your infrastructure.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Code size={20} color={colors.secondary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contribute</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                            Are you a developer? We&apos;d love your help! Feel free to contribute to the project by reporting bugs,
                            suggesting features, or submitting pull requests.
                        </Text>

                        <TouchableOpacity
                            style={[styles.githubBtn, { backgroundColor: colors.text }]}
                            onPress={openGithub}
                        >
                            <Github size={20} color={colors.background} />
                            <Text style={[styles.githubBtnText, { color: colors.background }]}>View on GitHub</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Crafted with ❤️ for the community
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const CheckCircle = ({ size, color, strokeWidth }: any) => (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: color, borderRadius: 2 }} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        alignItems: 'center',
        marginVertical: SPACING.xl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    version: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.sm,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    githubBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: RADIUS.lg,
        marginTop: SPACING.lg,
        gap: SPACING.sm,
    },
    githubBtnText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
