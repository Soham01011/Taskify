import { useEffect, useState, useCallback } from 'react';
import { NativeModules } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MATE_MODELS } from '../constants/mateModels';

export type DeviceTier = 'low' | 'mid' | 'high' | 'ultra' | 'unknown';

export interface DeviceCapability {
    totalRamGB: number;
    availableForAppGB: number;
    systemOffsetGB: number;
    tier: DeviceTier;
    canRunLocalRouter: boolean;      // SmolLM2
    canRunSpecifiedReasoning: boolean; 
    reason: string;
    isLoading: boolean;
}

export function useDeviceCapability(): DeviceCapability {
    const { systemRamOffsetGB, selectedReasoningModelId } = useSelector((state: RootState) => state.mateConfig);
    
    const [capability, setCapability] = useState<DeviceCapability>({
        totalRamGB: 0,
        availableForAppGB: 0,
        systemOffsetGB: systemRamOffsetGB,
        tier: 'unknown',
        canRunLocalRouter: false,
        canRunSpecifiedReasoning: false,
        reason: 'Checking device capabilities...',
        isLoading: true,
    });

    const detect = useCallback(async () => {
        try {
            let totalRamGB = 4; // Default fallback
            let isNativeReady = false;

            // CHECK NATIVE MODULE EXISTENCE FIRST before requiring the library
            const hasNativeModule = NativeModules.RNDeviceInfo;
            
            if (hasNativeModule) {
                try {
                    // Only require if we are sure the native module is there to prevent fatals
                    const DeviceInfo = require('react-native-device-info');
                    const DI = DeviceInfo.default || DeviceInfo;
                    
                    if (DI && typeof DI.getTotalMemory === 'function') {
                        const totalBytes = await DI.getTotalMemory();
                        if (totalBytes > 0) {
                            totalRamGB = totalBytes / (1024 ** 3);
                            isNativeReady = true;
                        }
                    }
                } catch (diError) {
                    console.log('DeviceInfo native call failed, using fallback');
                }
            } else {
                console.log('RNDeviceInfo native module missing, using estimates');
            }
            
            const availableForAppGB = Math.max(0, totalRamGB - systemRamOffsetGB);
            
            let tier: DeviceTier;
            if (totalRamGB < 4) tier = 'low';
            else if (totalRamGB < 8) tier = 'mid';
            else if (totalRamGB < 12) tier = 'high';
            else tier = 'ultra';

            const canRunLocalRouter = availableForAppGB >= 0.3;

            const selectedModel = MATE_MODELS.REASONING.find(m => m.id === selectedReasoningModelId);
            const modelRamGB = (selectedModel?.ramMB || 0) / 1024;
            const canRunSpecifiedReasoning = selectedModel?.isApi ? true : (availableForAppGB >= modelRamGB);

            let reason = '';
            if (!canRunLocalRouter) {
                reason = `Low RAM (${availableForAppGB.toFixed(1)}GB for app). Local AI might be unstable.`;
            } else if (!canRunSpecifiedReasoning) {
                reason = `Selected model needs ${modelRamGB.toFixed(1)}GB, but only ${availableForAppGB.toFixed(1)}GB is available.`;
            } else {
                reason = `Ready. ${availableForAppGB.toFixed(1)}GB available for AI.`;
            }

            if (!isNativeReady) {
                reason += ' (Estimate mode - Device rebuild required for diagnostics)';
            }

            setCapability({
                totalRamGB,
                availableForAppGB,
                systemOffsetGB: systemRamOffsetGB,
                tier,
                canRunLocalRouter,
                canRunSpecifiedReasoning,
                reason,
                isLoading: false,
            });
        } catch (err) {
            setCapability(prev => ({
                ...prev,
                tier: 'unknown',
                reason: 'Diagnostics failed.',
                isLoading: false,
            }));
        }
    }, [systemRamOffsetGB, selectedReasoningModelId]);

    useEffect(() => {
        detect();
    }, [detect]);

    return capability;
}

export function getModelRamRequiredGB(modelId: string): number {
    const allModels = [
        ...MATE_MODELS.REASONING,
        ...MATE_MODELS.VTT,
        ...MATE_MODELS.TTV,
        ...MATE_MODELS.OCR,
        MATE_MODELS.ROUTER
    ];
    const model = allModels.find(m => m.id === modelId);
    return (model?.ramMB || 0) / 1024;
}