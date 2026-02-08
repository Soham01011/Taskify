import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Plus, Shield, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { RootState, AppDispatch } from '@/src/store';
import { fetchGroups } from '@/src/store/slices/groupSlice';
import { Group } from '@/src/api/groups';
import { COLORS } from '@/src/constants/theme';
import { styles } from '@/assets/styles/groupsscreen.styles';

import { AppHeader } from '@/src/components/AppHeader';

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

