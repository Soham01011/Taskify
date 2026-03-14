import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bot, ChevronDown } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';
import { MODEL_SECTIONS } from '@/src/constants/mateModels';

interface ChatHeaderProps {
    colors: any;
    selectedModelId: string;
    onToggleDropdown: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ colors, selectedModelId, onToggleDropdown }) => {
    const activeModelName = MODEL_SECTIONS[0].models.find(m => m.id === selectedModelId)?.name || 'Select Model';

    return (
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
                <Bot size={24} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>TaskMate</Text>
            </View>
            
            <TouchableOpacity 
                style={[styles.modelSelector, { backgroundColor: colors.background }]}
                onPress={onToggleDropdown}
            >
                <Text style={[styles.modelName, { color: colors.text }]} numberOfLines={1}>
                    {activeModelName}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );
};
