import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { AppDispatch, RootState } from '../store';
import { fetchGroups } from '../store/slices/groupSlice';
import { groupApi } from '../api/groups';

export function useGroupMembers(groupId: string) {
    const dispatch = useDispatch<AppDispatch>();
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const { groups } = useSelector((state: RootState) => state.groups);

    const [newMemberId, setNewMemberId] = useState('');
    const [loading, setLoading] = useState(false);

    const group = groups.find(g => g._id === groupId);
    const isAdmin = group?.adminId === currentUserId || (group?.adminId as any)?._id === currentUserId;

    const handleAddMember = useCallback(async () => {
        if (!group || !newMemberId.trim()) return;
        try {
            setLoading(true);
            await groupApi.addMember(group._id, newMemberId.trim());
            Alert.alert('Success', 'Member added successfully');
            setNewMemberId('');
            if (currentUserId) dispatch(fetchGroups({ userId: currentUserId }));
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    }, [group, newMemberId, currentUserId, dispatch]);

    const handleRemoveMember = useCallback((userId: string) => {
        if (!group) return;
        Alert.alert(
            'Remove Member',
            'Are you sure you want to remove this member from the group?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await groupApi.removeMember(group._id, userId);
                            if (currentUserId) dispatch(fetchGroups({ userId: currentUserId }));
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to remove member');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }, [group, currentUserId, dispatch]);

    const handleDeleteGroup = useCallback((onDeleted: () => void) => {
        if (!group) return;
        Alert.alert(
            'Delete Group',
            'This action is permanent and will delete the group and all its tasks. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await groupApi.delete(group._id);
                            if (currentUserId) dispatch(fetchGroups({ userId: currentUserId }));
                            onDeleted();
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete group');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }, [group, currentUserId, dispatch]);

    return {
        group,
        isAdmin,
        newMemberId,
        setNewMemberId,
        loading,
        handleAddMember,
        handleRemoveMember,
        handleDeleteGroup,
        currentUserId
    };
}
