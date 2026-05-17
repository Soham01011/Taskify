import { useAppTheme } from '@/hooks/use-theme';
import { Tabs } from 'expo-router';
import { Bot, LayoutDashboard, Lightbulb, Menu, Users } from 'lucide-react-native';
import React from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ideas"
          options={{
            title: 'Ideas',
            tabBarIcon: ({ color }) => <Lightbulb size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="mate"
          options={{
            title: 'TaskMate',
            tabBarIcon: ({ color }) => <Bot size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color }) => <Menu size={24} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
