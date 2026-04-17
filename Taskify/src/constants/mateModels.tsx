import { Bot, Mic, ScanLine, Volume2 } from 'lucide-react-native';
import React from 'react';
import {
    HAMMER2_1_0_5B_QUANTIZED,
} from 'react-native-executorch';

export interface ModelMetadata {
    id: string;
    name: string;
    ramMB: number;
    description?: string;
    config?: any;
    isApi?: boolean;
}

export const MATE_MODELS = {
    // Hidden intelligence config - no user-facing choices
    ACTIVE: {
        id: 'hammer2_1_0_5b_quantized',
        name: 'TaskMate Lite (Hammer 0.5B)',
        ramMB: 400,
        config: HAMMER2_1_0_5B_QUANTIZED,
        description: 'Ultra-fast local tool-calling engine.',
    },
    // Keep VTT/OCR lists if used elsewhere
    VTT: [],
    TTV: [],
    OCR: []
};
