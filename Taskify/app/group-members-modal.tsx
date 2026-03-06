import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { User, Trash2, UserPlus, ShieldAlert, X } from 'lucide-react-native';

import { GenieAnimation } from '../src/components/GenieAnimation';
import { useAppTheme } from '@/hooks/use-theme';
import { AppDispatch, RootState } from '../src/store';
import { fetchGroups } from '../src/store/slices/groupSlice';
import { groupApi } from '../src/api/groups';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { RADIUS, SPACING } from '@/src/constants/theme';

export default function GroupMembersModalScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const { groups } = useSelector((state: RootState) => state.groups);

    // Using string for explicitly passed params
    const { groupId } = useLocalSearchParams<{ groupId: string }>();

    const [isClosing, setIsClosing] = useState(false);
    const [newMemberId, setNewMemberId] = useState('');
    const [loading, setLoading] = useState(false);

    const group = groups.find(g => g._id === groupId);
    const isAdmin = group?.adminId === currentUserId || (group?.adminId as any)?._id === currentUserId;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            router.back();
        }, 300);
    };

    if (!group) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose} />
                {!isClosing && (
                    <GenieAnimation>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={{ color: colors.text }}>Group not found.</Text>
                            <Button title="Close" onPress={handleClose} />
                        </View>
                    </GenieAnimation>
                )}
            </View>
        );
    }

    const handleAddMember = async () => {
        if (!newMemberId.trim()) return;
        try {
            setLoading(true);
            await groupApi.addMember(group._id, newMemberId.trim());
            Alert.alert('Success', 'Member added successfully');
            setNewMemberId('');
            if (currentUserId) dispatch(fetchGroups({ userId: currentUserId }));
            setLoading(false);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to add member');
            setLoading(false);
        }
    };

    const handleRemoveMember = (userId: string) => {
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
                            setLoading(false);
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to remove member');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteGroup = () => {
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
                            await groupApi.delete(group._id); t
                            if (currentUserId) dispatch(fetchGroups({ userId: currentUserId }));
                            setLoading(false);
                            handleClose();
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete group');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderMember = (member: any) => {
        const username = typeof member === 'string' ? member : (member.username || member._id);
        const id = typeof member === 'string' ? member : member._id;
        const isMemberAdmin = id === group.adminId || id === (group.adminId as any)?._id;

        return (
            <View key={id} style={[styles.memberRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.memberAvatar, { backgroundColor: colors.primary + '20' }]}>
                    <User size={18} color={colors.primary} />
                </View>
                <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                        {username} {id === currentUserId ? '(You)' : ''}
                    </Text>
                    {isMemberAdmin && (
                        <View style={[styles.adminBadge, { backgroundColor: colors.secondary + '20' }]}>
                            <Text style={[styles.adminBadgeText, { color: colors.secondary }]}>Admin</Text>
                        </View>
                    )}
                </View>

                {isAdmin && !isMemberAdmin && (
                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemoveMember(id)}
                    >
                        <Trash2 size={18} color={colors.danger} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'android' ? 'padding' : 'padding'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 40}
        >
            <Stack.Screen options={{
                headerShown: false,
                presentation: 'transparentModal',
            }} />
            <StatusBar style="auto" />

            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            />

            <View style={styles.modalContent}>
                {!isClosing && (
                    <GenieAnimation>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.title, { color: colors.text }]}>{group.name} Members</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <X size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                                {(() => {
                                    // Make sure Admin is definitely in the mapped list, and put them first.
                                    let allMembers = [...(group.members || [])];

                                    const adminId = typeof group.adminId === 'string' ? group.adminId : (group.adminId as any)?._id;
                                    const isAdminInMembers = allMembers.some(m => {
                                        const id = typeof m === 'string' ? m : m._id;
                                        return id === adminId;
                                    });

                                    if (!isAdminInMembers) {
                                        // The admin id might not be fully populated in the members array by the backend
                                        allMembers.unshift(group.adminId);
                                    } else {
                                        // Move admin to front
                                        const idx = allMembers.findIndex(m => {
                                            const id = typeof m === 'string' ? m : m._id;
                                            return id === adminId;
                                        });
                                        if (idx > -1) {
                                            const [adminItem] = allMembers.splice(idx, 1);
                                            allMembers.unshift(adminItem);
                                        }
                                    }

                                    return allMembers.map(renderMember);
                                })()}
                            </ScrollView>

                            {isAdmin && (
                                <View style={styles.adminSection}>
                                    <Text style={[styles.adminTitle, { color: colors.text }]}>Add New Member</Text>
                                    <View style={styles.addMemberRow}>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                placeholder="Enter User ID"
                                                value={newMemberId}
                                                onChangeText={setNewMemberId}
                                                autoCapitalize="none"
                                            />
                                        </View>
                                        <Button
                                            title="Add"
                                            onPress={handleAddMember}
                                            disabled={loading || !newMemberId.trim()}
                                            style={styles.addBtn}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.deleteGroupBtn, { borderColor: colors.danger }]}
                                        onPress={handleDeleteGroup}
                                    >
                                        <ShieldAlert size={18} color={colors.danger} style={{ marginRight: 8 }} />
                                        <Text style={[styles.deleteGroupText, { color: colors.danger }]}>Delete Group</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                        </View>
                    </GenieAnimation>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: 'transparent',
        width: '100%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    card: {
        margin: SPACING.md,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: SPACING.md,
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    memberAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
    },
    adminBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    removeBtn: {
        padding: 8,
    },
    adminSection: {
        marginTop: SPACING.lg,
        paddingTop: SPACING.md,
    },
    adminTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: SPACING.sm,
    },
    addMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.sm,
    },
    addBtn: {
        marginTop: -8, // visually align with input
    },
    deleteGroupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        marginTop: SPACING.md,
    },
    deleteGroupText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
