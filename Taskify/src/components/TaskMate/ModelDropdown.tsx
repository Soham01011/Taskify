import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { X, CheckCircle2, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { styles } from '@/assets/styles/mateScreen.styles';
import { MODEL_SECTIONS } from '@/src/constants/mateModels';
import { CustomGenieIn, CustomGenieOut } from '@/src/components/GenieAnimation';

interface ModelDropdownProps {
    colors: any;
    selectedModelId: string;
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
                    <Text style={[styles.dropdownTitle, { color: colors.text }]}>Intelligence Models</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={MODEL_SECTIONS}
                    keyExtractor={item => item.type}
                    renderItem={({ item: section }) => (
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                {section.icon}
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
                            </View>
                            
                            {section.models.length === 0 ? (
                                <Text style={[styles.emptySection, { color: colors.textSecondary }]}>No models available</Text>
                            ) : (
                                section.models.map(model => {
                                    const isDownloaded = downloadedModels.some(m => m.includes(model.config.modelSource.split('/').pop() || ''));
                                    const isSelected = selectedModelId === model.id;
                                    
                                    return (
                                        <TouchableOpacity 
                                            key={model.id}
                                            style={[
                                                styles.modelItem, 
                                                isSelected && { backgroundColor: colors.primary10 }
                                            ]}
                                            onPress={() => onSelect(model)}
                                        >
                                            <View style={styles.modelItemInfo}>
                                                <Text style={[
                                                    styles.modelItemName, 
                                                    { color: isSelected ? colors.primary : colors.text }
                                                ]}>
                                                    {model.name}
                                                </Text>
                                                {isDownloaded && <CheckCircle2 size={14} color={colors.primary} />}
                                            </View>
                                            
                                            {isDownloaded && (
                                                <TouchableOpacity 
                                                    onPress={() => onDelete(model)}
                                                    style={styles.deleteBtn}
                                                >
                                                    <Trash2 size={18} color={colors.danger} />
                                                </TouchableOpacity>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    )}
                />
            </Animated.View>
        </Animated.View>
    );
};
