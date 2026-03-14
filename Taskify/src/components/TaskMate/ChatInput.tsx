import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';

interface ChatInputProps {
    colors: any;
    input: string;
    setInput: (text: string) => void;
    onSend: () => void;
    isReady: boolean;
    isGenerating: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
    colors, 
    input, 
    setInput, 
    onSend, 
    isReady, 
    isGenerating 
}) => {
    return (
        <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
            <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background }]}
                placeholder="Ask TaskMate anything..."
                placeholderTextColor={colors.textSecondary}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={1000}
                editable={isReady && !isGenerating}
            />
            <TouchableOpacity 
                style={[
                    styles.sendBtn, 
                    { backgroundColor: !input.trim() || !isReady ? colors.border : colors.primary }
                ]}
                onPress={onSend}
                disabled={!input.trim() || !isReady}
            >
                {isGenerating ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Send size={20} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
};
