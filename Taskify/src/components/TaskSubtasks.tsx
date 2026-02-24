import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Circle, X, Plus } from 'lucide-react-native';

interface TaskSubtasksProps {
    colors: any;
    styles: any;
    selectedGroupId: string | null;
    subtasks: string[];
    newSubtaskTitle: string;
    setNewSubtaskTitle: (title: string) => void;
    showSubtaskInput: boolean;
    setShowSubtaskInput: (show: boolean) => void;
    addSubtask: () => void;
    removeSubtask: (index: number) => void;
}

export const TaskSubtasks: React.FC<TaskSubtasksProps> = ({
    colors, styles, selectedGroupId, subtasks, newSubtaskTitle, setNewSubtaskTitle,
    showSubtaskInput, setShowSubtaskInput, addSubtask, removeSubtask
}) => {
    if (selectedGroupId) return null;
    return (
        <>
            {subtasks.length > 0 && (
                <View style={styles.subtaskContainer}>
                    {subtasks.map((st, index) => (
                        <View key={st} style={styles.subtaskItem}>
                            <Circle size={14} color={colors.textSecondary} />
                            <Text style={styles.subtaskText}>{st}</Text>
                            <TouchableOpacity onPress={() => removeSubtask(index)}>
                                <X size={14} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
            {showSubtaskInput ? (
                <View style={styles.subtaskInputRow}>
                    <TextInput
                        style={styles.subtaskInput}
                        placeholder="Add subtask..."
                        value={newSubtaskTitle}
                        onChangeText={setNewSubtaskTitle}
                        onSubmitEditing={addSubtask}
                    />
                    <TouchableOpacity onPress={addSubtask}>
                        <Plus size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.addSubtaskBtn}
                    onPress={() => setShowSubtaskInput(true)}
                >
                    <Plus size={14} color={colors.textSecondary} />
                    <Text style={styles.addSubtaskText}>Add subtask</Text>
                </TouchableOpacity>
            )}
        </>
    );
};
