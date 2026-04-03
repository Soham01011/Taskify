import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bot, Settings, Zap } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';

interface ChatHeaderProps {
    colors: any;
    selectedModelId: string | null;
    onToggleDropdown: () => void; // kept for compatibility but unused
    onToggleControlCenter: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
    colors, 
    onToggleControlCenter
}) => {
    return (
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
                <Bot size={24} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>TaskMate</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Static dual-model indicator – no manual selection */}
                <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    backgroundColor: colors.background,
                    paddingHorizontal: 10, paddingVertical: 5,
                    borderRadius: 16, borderWidth: 1, borderColor: colors.border
                }}>
                    <Zap size={12} color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                        Hammer · Qwen3
                    </Text>
                </View>

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
