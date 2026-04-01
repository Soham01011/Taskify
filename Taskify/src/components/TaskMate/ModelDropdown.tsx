import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { X, CheckCircle2, Trash2, Download, Cloud, AlertCircle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { styles } from '@/assets/styles/mateScreen.styles';
import { MODEL_SECTIONS } from '@/src/constants/mateModels';
import { CustomGenieIn, CustomGenieOut } from '@/src/components/GenieAnimation';

interface ModelDropdownProps {
    colors: any;
    selectedModelId: string | null;
    downloadedModels: string[];
    onClose: () => void;
    onSelect: (model: any) => void;
    onDelete: (model: any) => void;
}

export const ModelDropdown: React.FC<ModelDropdownProps> = ({
    colors,
    selectedModelId,
    downloadedModels,
    onClose,
    onSelect,
    onDelete
}) => {
    const renderSection = useCallback(({ item: section }: { item: typeof MODEL_SECTIONS[0] }) => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                {section.icon}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            </View>

            {section.models.length === 0 ? (
                <Text style={[styles.emptySection, { color: colors.textSecondary }]}>No models available</Text>
            ) : (
                section.models.map(model => {
                    const isApi = (model as any).isApi === true;
                    const modelSource = (model as any).config?.modelSource;
                    const isDownloaded = isApi
                        ? true
                        : modelSource
                            ? (() => {
                                // Extract the stem (filename without extension) from the model source URL
                                // e.g. "qwen2_5-0_5b_instruct-bfloat16" from the .pte URL
                                const sourceStem = modelSource.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
                                return downloadedModels.some(dm => {
                                    const dmStem = dm.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
                                    // Match if either stem contains the other (handles path differences)
                                    return sourceStem.length > 4 && (
                                        dmStem.includes(sourceStem) || sourceStem.includes(dmStem) ||
                                        // Also check model family keyword match (e.g. "qwen2_5" in path)
                                        dm.toLowerCase().includes(sourceStem.split('-')[0])
                                    );
                                });
                            })()
                            : false;

                    const isSelected = selectedModelId === model.id;
                    const ramDisplay = isApi
                        ? 'Cloud · No RAM'
                        : `${model.ramMB >= 1000 ? (model.ramMB / 1024).toFixed(1) + ' GB' : model.ramMB + ' MB'} RAM`;

                    return (
                        <TouchableOpacity
                            key={model.id}
                            style={[
                                dropdownStyles.modelCard,
                                isSelected
                                    ? { backgroundColor: colors.primary + '15', borderColor: colors.primary + '50' }
                                    : { borderColor: colors.border },
                            ]}
                            onPress={() => onSelect(model)}
                            activeOpacity={0.75}
                        >
                            {/* Left: name + description + badges */}
                            <View style={{ flex: 1 }}>
                                <View style={dropdownStyles.modelNameRow}>
                                    <Text style={[
                                        dropdownStyles.modelCardName,
                                        { color: isSelected ? colors.primary : colors.text }
                                    ]} numberOfLines={1}>
                                        {model.name}
                                    </Text>
                                    {isSelected && <CheckCircle2 size={14} color={colors.primary} />}
                                </View>

                                {(model as any).description && (
                                    <Text style={[dropdownStyles.modelDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {(model as any).description}
                                    </Text>
                                )}

                                <View style={dropdownStyles.modelMeta}>
                                    {/* RAM badge */}
                                    <View style={[dropdownStyles.badge, { backgroundColor: colors.border }]}>
                                        {isApi
                                            ? <Cloud size={10} color={colors.textSecondary} />
                                            : <AlertCircle size={10} color={colors.textSecondary} />
                                        }
                                        <Text style={[dropdownStyles.badgeText, { color: colors.textSecondary }]}>
                                            {ramDisplay}
                                        </Text>
                                    </View>

                                    {/* Download status badge */}
                                    {!isApi && (
                                        <View style={[
                                            dropdownStyles.badge,
                                            {
                                                backgroundColor: isDownloaded
                                                    ? colors.primary + '20'
                                                    : colors.textSecondary + '15',
                                            }
                                        ]}>
                                            {isDownloaded
                                                ? <CheckCircle2 size={10} color={colors.primary} />
                                                : <Download size={10} color={colors.textSecondary} />
                                            }
                                            <Text style={[
                                                dropdownStyles.badgeText,
                                                { color: isDownloaded ? colors.primary : colors.textSecondary }
                                            ]}>
                                                {isDownloaded ? 'Downloaded' : 'Will download'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Delete button — only for downloaded local models */}
                            {isDownloaded && !isApi && (
                                <TouchableOpacity
                                    onPress={() => onDelete(model)}
                                    style={[dropdownStyles.deleteButton, { backgroundColor: colors.danger + '15' }]}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Trash2 size={15} color={colors.danger} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    );
                })
            )}
        </View>
    ), [colors, selectedModelId, downloadedModels, onSelect, onDelete]);

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[styles.dropdownOverlay, { backgroundColor: colors.overlay }]}
        >
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={onClose}
            />
            <Animated.View
                entering={CustomGenieIn}
                exiting={CustomGenieOut}
                style={[styles.dropdownMenu, { backgroundColor: colors.card }]}
            >
                <View style={styles.dropdownHeader}>
                    <View>
                        <Text style={[styles.dropdownTitle, { color: colors.text }]}>Intelligence Models</Text>
                        <Text style={[dropdownStyles.dropdownSubtitle, { color: colors.textSecondary }]}>
                            Select a model · tap 🗑 to free storage
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={MODEL_SECTIONS}
                    keyExtractor={item => item.type}
                    renderItem={renderSection}
                />
            </Animated.View>
        </Animated.View>
    );
};

const dropdownStyles = StyleSheet.create({
    dropdownSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    modelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    modelNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    modelCardName: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    modelDesc: {
        fontSize: 12,
        marginBottom: 6,
        lineHeight: 16,
    },
    modelMeta: {
        flexDirection: 'row',
        gap: 6,
        flexWrap: 'wrap',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    deleteButton: {
        width: 34,
        height: 34,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
});
