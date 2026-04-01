import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Send, Square } from 'lucide-react-native';
import { styles } from '@/assets/styles/mateScreen.styles';

interface ChatInputProps {
    colors: any;
    input: string;
    setInput: (text: string) => void;
    onSend: () => void;
    onInterrupt: () => void;
    isReady: boolean;
    isGenerating: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
    colors, 
    input, 
    setInput, 
    onSend, 
    onInterrupt,
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
                editable={isReady}
            />
            <TouchableOpacity 
                style={[
                    styles.sendBtn, 
                    { backgroundColor: (!input.trim() && !isGenerating) || !isReady ? colors.border : (isGenerating ? '#ef4444' : colors.primary) }
                ]}
                onPress={isGenerating ? onInterrupt : onSend}
                disabled={(!input.trim() && !isGenerating) || !isReady}
            >
                {isGenerating ? (
                    <Square size={20} fill="#fff" color="#fff" />
                ) : (
                    <Send size={20} color="#fff" />
                )}
            </TouchableOpacity>
        </View>
    );
};
