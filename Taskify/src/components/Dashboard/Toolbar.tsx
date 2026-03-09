import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ArrowUp, ArrowDown } from 'lucide-react-native';

interface ToolbarProps {
  filter: 'active' | 'due' | 'upcoming' | 'completed';
  setFilter: (filter: any) => void;
  sortOrder: 'asc' | 'desc';
  toggleSort: () => void;
  colors: any;
  styles: any;
}

export const DashboardToolbar: React.FC<ToolbarProps> = ({
  filter,
  setFilter,
  sortOrder,
  toggleSort,
  colors,
  styles
}) => {
  return (
    <View style={styles.toolbar}>
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {[
            { id: 'active', label: 'Active' },
            { id: 'due', label: 'Due' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' }
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterChip,
                filter === item.id && styles.activeFilterChip
              ]}
              onPress={() => setFilter(item.id)}
            >
              <Text style={[
                styles.filterChipText,
                filter === item.id && styles.activeFilterChipText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.sortBtn}
        onPress={toggleSort}
      >
        <Text style={styles.sortText}>Time</Text>
        {sortOrder === 'asc' ? (
          <ArrowUp size={14} color={colors.primary} />
        ) : (
          <ArrowDown size={14} color={colors.primary} />
        )}
      </TouchableOpacity>
    </View>
  );
};
