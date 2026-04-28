import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ArrowRight, Trash2 } from 'lucide-react-native';
import * as emoji from 'node-emoji';
import { Idea } from '@/src/api/ideas';
import { RADIUS, SPACING } from '@/src/constants/theme';

interface IdeaCardProps {
    item: Idea;
    isNew: boolean;
    onPress: (item: Idea) => void;
    onDelete: (id: string) => void;
    colors: any;
    formatDate: (dateStr: string) => string;
    index: number;
}

const getEmojiForTitle = (title: string) => {
    if (!title) return '💡';
    
    // 1. Check if the title is exactly an emoji name or contains it
    const words = title.toLowerCase().split(/\s+/);
    
    // Try to find an exact match for any word in the title
    for (const word of words) {
        const cleanWord = word.replace(/[^a-z0-9]/g, '');
        if (cleanWord.length > 1) {
            const exact = emoji.find(cleanWord);
            if (exact) return exact.emoji;
        }
    }
    
    // 2. Try a broad search if no exact word matches
    // We search the entire title to see if node-emoji can find anything related
    const searchResults = emoji.search(title.toLowerCase());
    if (searchResults && searchResults.length > 0) {
        // Return the first matching emoji
        return searchResults[0].emoji;
    }
    
    // 3. Fallback emoji
    return '💡';
};

export const IdeaCard: React.FC<IdeaCardProps> = React.memo(({
    item,
    isNew,
    onPress,
    onDelete,
    colors,
    formatDate,
    index,
}) => {
    const emojiChar = getEmojiForTitle(item.title);

    // Layout rules
    const isFullWidth = index === 0 || index % 5 === 0 || index % 5 === 4;
    const width = isFullWidth ? '100%' : '48%';

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 50).duration(400)}
            style={{ width, marginBottom: SPACING.md }}
        >
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isNew && { borderColor: colors.primary, borderWidth: 1 }
                ]}
                activeOpacity={0.8}
                onPress={() => onPress(item)}
            >
                {/* Watermark Emoji */}
                <View style={styles.watermarkContainer}>
                    <Text style={[styles.watermarkText, { color: colors.text }]}>
                        {emojiChar}
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
                            <Text style={styles.emojiText}>{emojiChar}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={(e) => { e.stopPropagation(); onDelete(item._id); }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.deleteBtn}
                        >
                            <Trash2 size={16} color={colors.textSecondary} opacity={0.6} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                            {item.title}
                        </Text>
                        {item.description && isFullWidth ? (
                            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                                {item.description}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.noteCount, { color: isFullWidth ? colors.primary : colors.textSecondary }]}>
                            {item.thread?.length || 0} Notes
                        </Text>
                        {isFullWidth && (
                            <ArrowRight size={18} color={colors.textSecondary} />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 160,
    },
    watermarkContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 0,
        opacity: 0.05,
    },
    watermarkText: {
        fontSize: 64,
    },
    content: {
        padding: SPACING.lg,
        flex: 1,
        justifyContent: 'space-between',
        zIndex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 18,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 4,
        zIndex: 10,
        borderRadius: 8,
    },
});
