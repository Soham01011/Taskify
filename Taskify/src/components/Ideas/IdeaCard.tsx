import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Trash2, MessageSquare } from 'lucide-react-native';
import { Idea } from '@/src/api/ideas';

interface IdeaCardProps {
    item: Idea;
    isNew: boolean;
    onPress: (item: Idea) => void;
    onDelete: (id: string) => void;
    colors: any;
    styles: any;
    formatDate: (dateStr: string) => string;
}

export const IdeaCard: React.FC<IdeaCardProps> = React.memo(({
    item,
    isNew,
    onPress,
    onDelete,
    colors,
    styles,
    formatDate,
}) => {
    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            layout={undefined}
        >
            <TouchableOpacity
                style={[styles.ideaCard, isNew && styles.ideaCardNew]}
                activeOpacity={0.8}
                onPress={() => onPress(item)}
            >
                <View style={styles.ideaHeader}>
                    <View style={styles.ideaTitleContainer}>
                        <Text style={styles.ideaTitle}>{item.title}</Text>
                        {item.description ? (
                            <Text style={styles.ideaDescription} numberOfLines={2}>
                                {item.description}
                            </Text>
                        ) : null}
                    </View>
                    <View style={styles.ideaActions}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => onDelete(item._id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Trash2 size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.ideaMeta}>
                    <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                    {item.thread && item.thread.length > 0 && (
                        <View style={styles.threadBadge}>
                            <MessageSquare size={10} color={colors.primary} />
                            <Text style={styles.threadBadgeText}>
                                {item.thread.length} note{item.thread.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});
