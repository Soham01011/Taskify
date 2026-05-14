import React from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Text } from 'react-native';
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
        <View style={{ backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 }}>
            <View style={{ paddingTop: 12, paddingHorizontal: 16 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {['@task', '@idea', '@group'].map(kw => (
                        <TouchableOpacity
                            key={kw}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 16,
                                backgroundColor: colors.background,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                            onPress={() => {
                                if (!input.includes(kw)) {
                                    setInput(input ? `${input} ${kw} ` : `${kw} `);
                                }
                            }}
                        >
                            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>{kw}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={[styles.inputContainer, { borderTopWidth: 0, backgroundColor: 'transparent' }]}>
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
        </View>
    );
};
