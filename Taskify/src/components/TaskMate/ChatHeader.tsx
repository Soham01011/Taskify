import React from 'react';
import { View, Text } from 'react-native';
import { Bot } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';

interface ChatHeaderProps {
    colors: any;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ colors }) => {
    return (
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleContainer}>
                <Bot size={24} color={colors.primary} strokeWidth={2.5} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>TaskMate</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {/* Clean, model-neutral header */}
                <View style={{ width: 1 }} />
            </View>
        </View>
    );
};
