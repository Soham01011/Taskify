import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { X } from 'lucide-react-native';

import { COLORS, SPACING, RADIUS } from '../src/constants/theme';
import { CreateTaskForm } from '../src/components/CreateTaskForm';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerShown: true,
        title: 'Create New Task',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        ),
      }} />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <CreateTaskForm onSuccess={() => router.back()} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  closeBtn: {
    marginLeft: SPACING.md,
  }
});

