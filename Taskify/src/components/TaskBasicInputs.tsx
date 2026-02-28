import React from 'react';
import { View, TextInput } from 'react-native';

interface TaskBasicInputsProps {
    colors: any;
    styles: any;
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
}

export const TaskBasicInputs: React.FC<TaskBasicInputsProps> = ({
    colors, styles, title, setTitle, description, setDescription
}) => {
    return (
        <View>
            <TextInput
                style={styles.titleInput}
                placeholder="Task name"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.descriptionInput}
                placeholder="Description"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
            />
        </View>
    );
};
