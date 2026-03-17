import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput } from 'react-native';
import { Cpu, Settings, X, Zap, Globe, AlertTriangle, Database } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setSystemRamOffset, toggleApiReasoning, setContextWindowSize } from '../../store/slices/mateConfigSlice';
import { useDeviceCapability, getModelRamRequiredGB } from '../../utils/usedevicecapability';
import { MATE_MODELS } from '../../constants/mateModels';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { styles } from '@/assets/styles/mateScreen.styles';

interface ControlCenterProps {
    colors: any;
    onClose: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({ colors, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { systemRamOffsetGB, useApiForReasoning, contextWindowSize, selectedReasoningModelId } = useSelector((s: RootState) => s.mateConfig);
    const capability = useDeviceCapability();
    
    const [offsetInput, setOffsetInput] = useState(systemRamOffsetGB.toString());

    const handleSaveOffset = () => {
        const val = parseFloat(offsetInput);
        if (!isNaN(val)) {
            dispatch(setSystemRamOffset(val));
        }
    };

    const selectedModel = MATE_MODELS.REASONING.find(m => m.id === selectedReasoningModelId);
    const ramRequired = getModelRamRequiredGB(selectedReasoningModelId);
    
    // RAM usage calculation for the bar
    const totalRam = capability.totalRamGB || 1;
    const systemUsagePercent = Math.min(100, (systemRamOffsetGB / totalRam) * 100);
    const appAvailablePercent = Math.min(100, (capability.availableForAppGB / totalRam) * 100);
    const modelRequirementPercent = Math.min(appAvailablePercent, (ramRequired / totalRam) * 100);

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
                            <Text style={[styles.strategyTitle, { color: colors.primary }]}>Hybrid Agentic AI</Text>
                            <Text style={[styles.strategyDesc, { color: colors.textSecondary }]}>
                                SmolLM2 handles local routing and CRUD operations. 
                                {useApiForReasoning || !capability.canRunSpecifiedReasoning 
                                    ? " Reasoning is currently offloaded to Gemini Cloud API." 
                                    : ` Reasoning runs locally via ${selectedModel?.name}.`}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            
            <View style={[styles.controlFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    Context Strategy: SlidingWindowContext
                </Text>
            </View>
        </Animated.View>
    );
};
