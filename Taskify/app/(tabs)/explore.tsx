import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Plus, Shield, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { RootState, AppDispatch } from '../../src/store';
import { fetchGroups } from '../../src/store/slices/groupSlice';
import { Group } from '../../src/api/groups';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';

import { AppHeader } from '../../src/components/AppHeader';

export default function GroupsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { groups, isLoading } = useSelector((state: RootState) => state.groups);
  const { currentUserId } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = useCallback(() => {
    if (currentUserId) {
      dispatch(fetchGroups(currentUserId));
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const onRefresh = async () => {
    if (currentUserId) {
      setRefreshing(true);
      await dispatch(fetchGroups(currentUserId));
      setRefreshing(false);
    }
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.7}>
      <View style={styles.groupIcon}>
        <Users size={24} color={COLORS.white} />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.groupMeta}>
          <View style={styles.metaItem}>
            <Users size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.members.length} members</Text>
          </View>
          <View style={styles.metaItem}>
            <MessageSquare size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.tasks.length} tasks</Text>
          </View>
        </View>
      </View>
      {item.adminId === currentUserId && (
        <View style={styles.adminBadge}>
          <Shield size={12} color={COLORS.secondary} />
          <Text style={styles.adminText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <View style={styles.subHeader}>
        <Text style={styles.title}>Your Groups</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/modal')}>
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>


      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You are not in any groups yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  subHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addBtn: {
    padding: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    alignItems: 'center',
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  groupDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  adminText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
