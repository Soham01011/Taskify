import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Users, Lightbulb } from 'lucide-react-native';

interface EmptyStateProps {
  filter: string;
  pendingGroupTasks: any[];
  ideas: any[];
  colors: any;
  styles: any;
  onSeeGroups: () => void;
  onExploreIdeas: () => void;
}

export const EmptyDashboardState: React.FC<EmptyStateProps> = ({
  filter,
  pendingGroupTasks,
  ideas,
  colors,
  styles,
  onSeeGroups,
  onExploreIdeas,
}) => {
  if (filter !== 'completed' && pendingGroupTasks.length > 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { marginBottom: 8, fontWeight: '700', fontSize: 15, color: colors.text }]}>
          No personal tasks here
        </Text>
        <Text style={[styles.emptyText, { marginBottom: 16 }]}>
          You have {pendingGroupTasks.length} group task{pendingGroupTasks.length !== 1 ? 's' : ''} waiting for you:
        </Text>
        {pendingGroupTasks.slice(0, 3).map((t: any) => (
          <View key={t._id} style={{
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            width: '100%',
          }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{t.task}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{t.groupName}</Text>
          </View>
        ))}
        <TouchableOpacity
          style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.primary15,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
          }}
          onPress={onSeeGroups}
        >
          <Users size={16} color={colors.primary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
            See all group tasks
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (filter !== 'completed' && ideas.length > 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primary15,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Lightbulb size={28} color={colors.primary} />
        </View>
        <Text style={[styles.emptyText, { fontWeight: '700', fontSize: 15, color: colors.text, marginBottom: 8 }]}>
          All caught up!
        </Text>
        <Text style={[styles.emptyText, { marginBottom: 16 }]}>
          Why not pick up where you left off on one of your {ideas.length} idea{ideas.length !== 1 ? 's' : ''}?
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.primary15,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
          }}
          onPress={onExploreIdeas}
        >
          <Lightbulb size={16} color={colors.primary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
            Explore my ideas
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {filter === 'completed' ? 'No completed tasks.' : 'No tasks found.'}
      </Text>
    </View>
  );
};
