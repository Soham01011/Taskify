import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput } from 'react-native';
import { Cpu, Settings, X, Zap, Globe, AlertTriangle, Database, Trash2, HardDrive, Route } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setSystemRamOffset, toggleApiReasoning, setContextWindowSize } from '../../store/slices/mateConfigSlice';
import { useDeviceCapability, getModelRamRequiredGB } from '../../utils/usedevicecapability';
import { MATE_MODELS } from '../../constants/mateModels';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { styles } from '@/assets/styles/mateScreen.styles';
import { StyleSheet } from 'react-native';

// Module-level constant prevents a new array reference on every render
const EMPTY_DOWNLOADED: string[] = [];

interface ControlCenterProps {
    colors: any;
    onClose: () => void;
    downloadedModels?: string[];
    onDeleteModel?: (model: any) => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ colors, onClose, downloadedModels = EMPTY_DOWNLOADED, onDeleteModel }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { systemRamOffsetGB, useApiForReasoning, contextWindowSize, selectedReasoningModelId } = useSelector((s: RootState) => s.mateConfig);
    const capability = useDeviceCapability();
    
    const [offsetInput, setOffsetInput] = useState(() => systemRamOffsetGB.toString());

    const handleSaveOffset = () => {
        const val = parseFloat(offsetInput);
        if (!isNaN(val)) {
            dispatch(setSystemRamOffset(val));
        }
    };

    // Dynamic RAM requirement
    const selectedModel = useApiForReasoning 
        ? MATE_MODELS.REASONING.find(m => m.id === 'gemini_api')
        : MATE_MODELS.REASONING.find(m => m.id === selectedReasoningModelId);
    
    const ramRequired = selectedReasoningModelId ? getModelRamRequiredGB(selectedReasoningModelId) : 0;
    
    // RAM usage calculation for the bar
    const totalRam = capability.totalRamGB || 1;
    const systemUsagePercent = Math.min(100, (systemRamOffsetGB / totalRam) * 100);
    const appAvailablePercent = Math.min(100, (capability.availableForAppGB / totalRam) * 100);
    const modelRequirementPercent = Math.min(appAvailablePercent, (ramRequired / totalRam) * 100);

    // Downloaded local models (cross-reference with REASONING list)
    const downloadedReasoningModels = MATE_MODELS.REASONING.filter(m => {
        if (m.isApi) return false;
        const modelSource = (m as any).config?.modelSource;
        if (!modelSource) return false;
        const sourceStem = modelSource.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
        return sourceStem.length > 4 && downloadedModels.some(dm => {
            const dmStem = dm.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
            return dmStem.includes(sourceStem) || sourceStem.includes(dmStem) ||
                dm.toLowerCase().includes(sourceStem.split('-')[0]);
        });
    });

    // Total storage estimate
    const totalStorageMB = downloadedReasoningModels.reduce((acc, m) => acc + (m.ramMB || 0), 0);
    const totalStorageDisplay = totalStorageMB >= 1024
        ? `${(totalStorageMB / 1024).toFixed(1)} GB`
        : `${totalStorageMB} MB`;

    return (
        <Animated.View 
            entering={SlideInRight} 
            exiting={SlideOutRight} 
            style={[styles.controlCenterOverlay, { backgroundColor: colors.card, borderLeftColor: colors.border, borderLeftWidth: 1 }]}
        >
            <View style={styles.controlHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Settings color={colors.primary} size={20} />
                    <Text style={[styles.controlTitle, { color: colors.text }]}>LLM Control Center</Text>
                </View>
                <TouchableOpacity onPress={onClose}>
                    <X color={colors.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.controlScroll}>
                {/* ─── RAM Bar ─── */}
                <View style={styles.controlSection}>
                    <View style={styles.sectionLabelRow}>
                        <Cpu size={16} color={colors.textSecondary} />
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Device RAM Info</Text>
                    </View>
                    
                    <View style={styles.ramBarContainer}>
                        <View style={[styles.ramBarBase, { backgroundColor: colors.border }]}>
                            {/* System usage */}
                            <View style={[styles.ramBarFilled, { width: `${systemUsagePercent}%`, backgroundColor: colors.textSecondary + '40' }]} />
                            {/* App Available */}
                            <View style={[styles.ramBarFilled, { left: `${systemUsagePercent}%`, width: `${appAvailablePercent}%`, backgroundColor: colors.primary15 }]} />
                            {/* Model requirement */}
                            <View style={[styles.ramBarFilled, { left: `${systemUsagePercent}%`, width: `${modelRequirementPercent}%`, backgroundColor: capability.canRunSpecifiedReasoning ? colors.primary : colors.danger }]} />
                        </View>
                        <View style={styles.ramBarLabels}>
                            <Text style={[styles.ramLabel, { color: colors.textSecondary }]}>Total: {totalRam.toFixed(1)}GB</Text>
                            <Text style={[styles.ramLabel, { color: colors.primary, fontWeight: '700' }]}>App Free: {capability.availableForAppGB.toFixed(1)}GB</Text>
                        </View>
                    </View>

                    {!capability.canRunSpecifiedReasoning && (
                        <View style={[styles.ramWarning, { backgroundColor: colors.danger + '10' }]}>
                            <AlertTriangle size={14} color={colors.danger} />
                            <Text style={[styles.ramWarningText, { color: colors.danger }]}>
                                Insufficient RAM for local {selectedModel?.name}
                            </Text>
                        </View>
                    )}
                </View>

                {/* ─── Downloaded Models ─── */}
                {downloadedReasoningModels.length > 0 && (
                    <View style={styles.controlSection}>
                        <View style={styles.sectionLabelRow}>
                            <HardDrive size={16} color={colors.textSecondary} />
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Downloaded Models</Text>
                            <View style={[ccStyles.storageChip, { backgroundColor: colors.primary + '15' }]}>
                                <Text style={[ccStyles.storageChipText, { color: colors.primary }]}>{totalStorageDisplay} used</Text>
                            </View>
                        </View>

                        {downloadedReasoningModels.map(model => (
                            <View key={model.id} style={[ccStyles.downloadedModelRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[ccStyles.downloadedModelName, { color: colors.text }]} numberOfLines={1}>
                                        {model.name}
                                    </Text>
                                    <Text style={[ccStyles.downloadedModelSize, { color: colors.textSecondary }]}>
                                        {model.ramMB >= 1024 ? `${(model.ramMB / 1024).toFixed(1)} GB` : `${model.ramMB} MB`}
                                    </Text>
                                </View>
                                {onDeleteModel && (
                                    <TouchableOpacity
                                        onPress={() => onDeleteModel(model)}
                                        style={[ccStyles.deleteModelBtn, { backgroundColor: colors.danger + '15' }]}
                                    >
                                        <Trash2 size={15} color={colors.danger} />
                                        <Text style={[ccStyles.deleteModelBtnText, { color: colors.danger }]}>Delete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* ─── System Configuration ─── */}
                <View style={styles.controlSection}>
                    <Text style={[styles.sectionSubTitle, { color: colors.text }]}>Configuration</Text>
                    
                    <View style={styles.configItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.configLabel, { color: colors.text }]}>System Reserved RAM</Text>
                            <Text style={[styles.configSubLabel, { color: colors.textSecondary }]}>Amount of RAM reserved for OS/Background apps</Text>
                        </View>
                        <View style={styles.offsetInputRow}>
                            <TextInput
                                style={[styles.offsetInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                value={offsetInput}
                                onChangeText={setOffsetInput}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={[styles.saveOffsetBtn, { backgroundColor: colors.primary }]} onPress={handleSaveOffset}>
                                <Text style={styles.saveOffsetBtnText}>Set</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.configItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.configLabel, { color: colors.text }]}>Force API Reasoning</Text>
                            <Text style={[styles.configSubLabel, { color: colors.textSecondary }]}>Always use cloud Gemini for complex tasks</Text>
                        </View>
                        <Switch
                            value={useApiForReasoning}
                            onValueChange={(val) => { dispatch(toggleApiReasoning(val)); }}
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                    
                    <View style={styles.configItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.configLabel, { color: colors.text }]}>Context Window (Sliding)</Text>
                            <Text style={[styles.configSubLabel, { color: colors.textSecondary }]}>Number of recent messages sent to AI</Text>
                        </View>
                        <View style={styles.offsetInputRow}>
                            <TouchableOpacity onPress={() => dispatch(setContextWindowSize(Math.max(1, contextWindowSize - 1)))}>

                                <Text style={[styles.counterBtn, { color: colors.primary }]}>-</Text>
                            </TouchableOpacity>
                            <Text style={[styles.counterText, { color: colors.text }]}>{contextWindowSize}</Text>
                            <TouchableOpacity onPress={() => dispatch(setContextWindowSize(contextWindowSize + 1))}>
                                <Text style={[styles.counterBtn, { color: colors.primary }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* ─── Agent Mode ─── */}
                <View style={styles.controlSection}>
                    <Text style={[styles.sectionSubTitle, { color: colors.text }]}>Execution Strategy</Text>
                    <View style={[styles.strategyCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                        <Zap size={20} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.strategyTitle, { color: colors.primary }]}>Unified Agentic Mode</Text>
                            <Text style={[styles.strategyDesc, { color: colors.textSecondary }]}>
                                {useApiForReasoning
                                    ? 'A single Gemini Cloud model handles all routing and reasoning tasks with maximum intelligence.'
                                    : `A single local ${selectedModel?.name ?? 'model'} handles both intent routing and complex reasoning directly.`}
                            </Text>
                        </View>
                    </View>

                    {/* Pipeline legend */}
                    <View style={ccStyles.pipelineLegend}>
                        <View style={ccStyles.pipelineStep}>
                            <View style={[ccStyles.pipelineDot, { backgroundColor: useApiForReasoning ? '#f59e0b' : colors.primary }]} />
                            <View>
                                <Text style={[ccStyles.pipelineStepTitle, { color: colors.text }]}>
                                    {useApiForReasoning ? 'Unified Gemini Cloud' : `Unified Local ${selectedModel?.name ?? 'Model'}`}
                                </Text>
                                <Text style={[ccStyles.pipelineStepDesc, { color: colors.textSecondary }]}>
                                    One model for everything · Intent detection · Tool execution · Reasoning
                                </Text>
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
            
            <View style={[styles.controlFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    Strategy: Triage · Context: SlidingWindow({contextWindowSize})
                </Text>
            </View>
        </Animated.View>
    );
};

const ccStyles = StyleSheet.create({
    storageChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        marginLeft: 'auto',
    },
    storageChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    downloadedModelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    downloadedModelName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    downloadedModelSize: {
        fontSize: 12,
    },
    deleteModelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 8,
        marginLeft: 8,
    },
    deleteModelBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    pipelineLegend: {
        marginTop: 12,
        paddingHorizontal: 4,
    },
    pipelineStep: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    pipelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 3,
        flexShrink: 0,
    },
    pipelineConnector: {
        width: 2,
        height: 14,
        backgroundColor: '#ffffff20',
        marginLeft: 4,
        marginVertical: 2,
    },
    pipelineStepTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    pipelineStepDesc: {
        fontSize: 11,
        marginTop: 1,
    },
});
