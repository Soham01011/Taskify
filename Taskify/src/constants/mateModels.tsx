import { Bot, Mic, ScanLine, Volume2, Cpu, Zap } from 'lucide-react-native';
import React from 'react';
import { 
    QWEN2_5_1_5B_QUANTIZED, 
    QWEN2_5_3B,
    SMOLLM2_1_360M_QUANTIZED,
    // Note: These might not all be exported from the library yet, 
    // assuming standard naming or representing their existence for UI.
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
    ROUTER: {
        id: 'smollm2_360m_quantized',
        name: 'SmolLM2 360M (Quantized)',
        ramMB: 200,
        config: SMOLLM2_1_360M_QUANTIZED
    },
    // User provided list
    REASONING: [
        { id: 'hammer_2_1_0_5b_quantized', name: 'Hammer 2.1 0.5B (Quant)', ramMB: 280 },
        { id: 'hammer_2_1_1_5b_quantized', name: 'Hammer 2.1 1.5B (Quant)', ramMB: 850 },
        { id: 'hammer_2_1_3b_quantized', name: 'Hammer 2.1 3B (Quant)', ramMB: 3500 },
        { id: 'llama_3_2_1b', name: 'Llama 3.2 1B', ramMB: 900 },
        { id: 'llama_3_2_3b', name: 'Llama 3.2 3B', ramMB: 4200 },
        { id: 'phi_4_mini_4b_quantized', name: 'Phi-4 Mini 4B (Quant)', ramMB: 4500 },
        { id: 'qwen_2_5_0_5b_quantized', name: 'Qwen 2.5 0.5B (Quant)', ramMB: 320 },
        { id: 'qwen_2_5_1_5b_quantized', name: 'Qwen 2.5 1.5B (Quant)', ramMB: 900, config: QWEN2_5_1_5B_QUANTIZED },
        { id: 'qwen_2_5_3b', name: 'Qwen 2.5 3B', ramMB: 4200, config: QWEN2_5_3B },
        { id: 'gemini_api', name: 'Gemini Flash (API)', ramMB: 0, isApi: true },
    ] as ModelMetadata[],
    VTT: [
        { id: 'whisper_base', name: 'Whisper Base', ramMB: 410 },
        { id: 'whisper_base_en', name: 'Whisper Base EN', ramMB: 410 },
        { id: 'whisper_base_en_quantized', name: 'Whisper Base EN (Quantized)', ramMB: 250 },
        { id: 'whisper_small', name: 'Whisper Small', ramMB: 900 },
        { id: 'whisper_small_en', name: 'Whisper Small EN', ramMB: 900 },
        { id: 'whisper_small_en_quantized', name: 'Whisper Small EN (Quantized)', ramMB: 500 },
        { id: 'whisper_tiny', name: 'Whisper Tiny', ramMB: 200 },
        { id: 'whisper_tiny_en', name: 'Whisper Tiny EN', ramMB: 200 },
        { id: 'whisper_tiny_en_quantized', name: 'Whisper Tiny EN (Quantized)', ramMB: 120 },
    ] as ModelMetadata[],
    TTV: [
        { id: 'kokoro_medium', name: 'Kokoro Medium', ramMB: 1140 },
        { id: 'kokoro_small', name: 'Kokoro Small', ramMB: 820 },
    ] as ModelMetadata[],
    OCR: [
        { id: 'ocr_english', name: 'OCR English', ramMB: 1300 }, // Average of 1000-1600
    ] as ModelMetadata[]
};


export const MODEL_SECTIONS = [
    {
        title: 'Reasoning Models',
        icon: <Bot size={18} color="#6366f1" />,
        type: 'llm',
        models: MATE_MODELS.REASONING
    },
    {
        title: 'Voice to Text',
        icon: <Mic size={18} color="#10b981" />,
        type: 'vtt',
        models: MATE_MODELS.VTT
    },
    {
        title: 'Text to Voice',
        icon: <Volume2 size={18} color="#f59e0b" />,
        type: 'ttv',
        models: MATE_MODELS.TTV
    },
    {
        title: 'OCR Models',
        icon: <ScanLine size={18} color="#ec4899" />,
        type: 'ocr',
        models: MATE_MODELS.OCR
    }
];
