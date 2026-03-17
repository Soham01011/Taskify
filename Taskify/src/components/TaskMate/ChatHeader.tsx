import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bot, ChevronDown, Settings } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';
import { MODEL_SECTIONS } from '@/src/constants/mateModels';

interface ChatHeaderProps {
    colors: any;
    selectedModelId: string;
    onToggleDropdown: () => void;
    onToggleControlCenter: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    colors, 
    selectedModelId, 
    onToggleDropdown,
    onToggleControlCenter
}) => {
    // Find model in any section
    let activeModelName = 'Select Model';
    for (const section of MODEL_SECTIONS) {
        const found = section.models.find(m => m.id === selectedModelId);
        if (found) {
            activeModelName = found.name;
            break;
        }
    }

    return (
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
                <Bot size={24} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>TaskMate</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity 
                    style={[styles.modelSelector, { backgroundColor: colors.background }]}
                    onPress={onToggleDropdown}
                >
                    <Text style={[styles.modelName, { color: colors.text }]} numberOfLines={1}>
                        {activeModelName}
                    </Text>
                    <ChevronDown size={14} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={{ padding: 8 }}
                    onPress={onToggleControlCenter}
                >
                    <Settings size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
