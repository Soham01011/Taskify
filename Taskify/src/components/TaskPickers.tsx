import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

interface TaskPickersProps {
    colors: any;
    styles: any;
    groups: any[];
    activeGroup: any;
    selectedGroupId: string | null;
    setSelectedGroupId: (id: string | null) => void;
    assignee: any;
    setAssignee: (assignee: any) => void;
    showGroupPicker: boolean;
    setShowGroupPicker: (show: boolean) => void;
    showAssigneePicker: boolean;
    setShowAssigneePicker: (show: boolean) => void;
}

export const TaskPickers: React.FC<TaskPickersProps> = ({
    colors, styles, groups, activeGroup, selectedGroupId, setSelectedGroupId,
    assignee, setAssignee, showGroupPicker, setShowGroupPicker,
    showAssigneePicker, setShowAssigneePicker
}) => {
    return (
        <>
            {showGroupPicker && (
                <View style={{ backgroundColor: colors.card, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                        <TouchableOpacity
                            onPress={() => { setSelectedGroupId(null); setAssignee(null); setShowGroupPicker(false); }}
                            style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <View style={[styles.inboxIcon, { marginRight: 8 }]}><View style={styles.trayIcon} /></View>
                            <Text style={{ color: colors.text, fontWeight: '600' }}>Inbox (Personal)</Text>
                            {!selectedGroupId && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                        {groups.map((g: any) => (
                            <TouchableOpacity
                                key={g._id}
                                onPress={() => { setSelectedGroupId(g._id); setAssignee(null); setShowGroupPicker(false); }}
                                style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 28 }}>{g.name}</Text>
                                {selectedGroupId === g._id && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            {showAssigneePicker && activeGroup && (
                <View style={{ backgroundColor: colors.card, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                        <TouchableOpacity
                            onPress={() => { setAssignee(null); setShowAssigneePicker(false); }}
                            style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>None (Unassigned)</Text>
                            {!assignee && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                        {(() => {
                            const memberList = Array.isArray(activeGroup.members) ? [...activeGroup.members] : [];

                            // If adminId exists and is an object, try to include it if not already in members
                            if (activeGroup.adminId && typeof activeGroup.adminId === 'object') {
                                const adminIdValue = activeGroup.adminId._id;
                                const isAdminInMembers = memberList.some(m => {
                                    const mid = typeof m === 'string' ? m : m._id;
                                    return mid === adminIdValue;
                                });
                                if (!isAdminInMembers) {
                                    memberList.unshift(activeGroup.adminId);
                                }
                            }

                            return memberList.map((member: any, index: number) => {
                                const username = typeof member === 'string' ? member : (member.username || member._id);
                                const id = typeof member === 'string' ? member : member._id;
                                const displayName = username === id ? `User ${id.substring(0, 6)}` : username;
                                const isAdmin = (typeof activeGroup.adminId === 'string' && activeGroup.adminId === id) ||
                                    (typeof activeGroup.adminId === 'object' && activeGroup.adminId?._id === id);

                                return (
                                    <TouchableOpacity
                                        key={`${id}-${index}`}
                                        onPress={() => { setAssignee({ id, username: displayName }); setShowAssigneePicker(false); }}
                                        style={{ padding: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                        <Text style={{ color: colors.text, fontWeight: '500', marginLeft: 8 }}>
                                            {displayName} {isAdmin ? '(Admin)' : ''}
                                        </Text>
                                        {assignee?.id === id && <Check size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                                    </TouchableOpacity>
                                );
                            });
                        })()}
                    </ScrollView>
                </View>
            )}
        </>
    );
};
