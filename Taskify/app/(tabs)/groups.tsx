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
import { getStyles } from '@/assets/styles/groupsscreen.styles';
import { useAppTheme } from '@/hooks/use-theme';
import { GroupCard } from '@/src/components/GroupCard';
import { AppHeader } from '@/src/components/AppHeader';

export default function GroupsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
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
    <GroupCard group={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />

      <View style={styles.subHeader}>
        <Text style={styles.title}>Your Groups</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/group-modal')}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>


      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
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

