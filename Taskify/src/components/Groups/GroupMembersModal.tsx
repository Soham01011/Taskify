import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { User, Trash2, ShieldAlert, X } from 'lucide-react-native';
import { GenieAnimation } from '../GenieAnimation';
import { useAppTheme } from '@/hooks/use-theme';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RADIUS, SPACING } from '@/src/constants/theme';
import { useGroupMembers } from '@/src/hooks/useGroupMembers';

interface GroupMembersModalProps {
    groupId: string;
    onClose: () => void;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ groupId, onClose }) => {
    const { colors } = useAppTheme();
    const {
        group,
        isAdmin,
        newMemberId,
        setNewMemberId,
        loading,
        handleAddMember,
        handleRemoveMember,
        handleDeleteGroup,
        currentUserId
    } = useGroupMembers(groupId);

    if (!group) {
        return (
            <GenieAnimation>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={{ color: colors.text }}>Group not found.</Text>
                    <Button title="Close" onPress={onClose} />
                </View>
            </GenieAnimation>
        );
    }

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

    const adminId = typeof group.adminId === 'string' ? group.adminId : (group.adminId as any)?._id;
    let allMembers = [...(group.members || [])];
    const isAdminInMembers = allMembers.some(m => (typeof m === 'string' ? m : m._id) === adminId);
    if (!isAdminInMembers) allMembers.unshift(group.adminId);
    else {
        const idx = allMembers.findIndex(m => (typeof m === 'string' ? m : m._id) === adminId);
        if (idx > 0) {
            const [adminItem] = allMembers.splice(idx, 1);
            allMembers.unshift(adminItem);
        }
    }

    return (
        <GenieAnimation>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{group.name} Members</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                    {allMembers.map(renderMember)}
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
                            onPress={() => handleDeleteGroup(onClose)}
                        >
                            <ShieldAlert size={18} color={colors.danger} style={{ marginRight: 8 }} />
                            <Text style={[styles.deleteGroupText, { color: colors.danger }]}>Delete Group</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </GenieAnimation>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    addBtn: {
        marginTop: 0,
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
