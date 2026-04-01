import { Bot, Mic, ScanLine, Volume2 } from 'lucide-react-native';
import React from 'react';
import {
    QWEN2_5_0_5B_QUANTIZED,
    QWEN2_5_1_5B_QUANTIZED,
    QWEN2_5_3B_QUANTIZED,
    QWEN3_0_6B_QUANTIZED,
    QWEN3_1_7B_QUANTIZED,
    QWEN3_4B_QUANTIZED,
    HAMMER2_1_0_5B_QUANTIZED,
    HAMMER2_1_1_5B_QUANTIZED,
    HAMMER2_1_3B_QUANTIZED,
    LLAMA3_2_1B,
    LLAMA3_2_3B,
    PHI_4_MINI_4B_QUANTIZED,
    SMOLLM2_1_360M_QUANTIZED,
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
    // User-selectable reasoning / chat models
    REASONING: [
        // ── Hammer 2.1 ───────────────────────────────────────────────────────
        {
            id: 'hammer_2_1_0_5b_quantized',
            name: 'Hammer 2.1 0.5B (Quant)',
            ramMB: 280,
            config: HAMMER2_1_0_5B_QUANTIZED,
            description: 'Ultra-light, fastest local model.',
        },
        {
            id: 'hammer_2_1_1_5b_quantized',
            name: 'Hammer 2.1 1.5B (Quant)',
            ramMB: 850,
            config: HAMMER2_1_1_5B_QUANTIZED,
            description: 'Balanced speed and quality.',
        },
        {
            id: 'hammer_2_1_3b_quantized',
            name: 'Hammer 2.1 3B (Quant)',
            ramMB: 3500,
            config: HAMMER2_1_3B_QUANTIZED,
            description: 'Best local quality in the Hammer family.',
        },
        // ── Llama 3.2 ────────────────────────────────────────────────────────
        {
            id: 'llama_3_2_1b',
            name: 'Llama 3.2 1B',
            ramMB: 900,
            config: LLAMA3_2_1B,
            description: 'Meta\'s compact reasoning model.',
        },
        {
            id: 'llama_3_2_3b',
            name: 'Llama 3.2 3B',
            ramMB: 4200,
            config: LLAMA3_2_3B,
            description: 'Meta\'s mid-size reasoning model.',
        },
        // ── Phi-4 Mini ───────────────────────────────────────────────────────
        {
            id: 'phi_4_mini_4b_quantized',
            name: 'Phi-4 Mini 4B (Quant)',
            ramMB: 4500,
            config: PHI_4_MINI_4B_QUANTIZED,
            description: 'Microsoft\'s small but capable model.',
        },
        // ── Qwen 2.5 ─────────────────────────────────────────────────────────
        {
            id: 'qwen_2_5_0_5b_quantized',
            name: 'Qwen 2.5 0.5B (Quant)',
            ramMB: 320,
            config: QWEN2_5_0_5B_QUANTIZED,
            description: 'Smallest Qwen, very fast.',
        },
        {
            id: 'qwen_2_5_1_5b_quantized',
            name: 'Qwen 2.5 1.5B (Quant)',
            ramMB: 900,
            config: QWEN2_5_1_5B_QUANTIZED,
            description: 'Good balance of speed and reasoning.',
        },
        {
            id: 'qwen_2_5_3b_quantized',
            name: 'Qwen 2.5 3B (Quant)',
            ramMB: 4200,
            config: QWEN2_5_3B_QUANTIZED,
            description: 'Strongest Qwen 2.5 local model.',
        },
        // ── Qwen 3 ───────────────────────────────────────────────────────────
        {
            id: 'qwen3_0_6b_quantized',
            name: 'Qwen3 0.6B (Quant)',
            ramMB: 380,
            config: QWEN3_0_6B_QUANTIZED,
            description: 'Latest Qwen3, ultra-compact.',
        },
        {
            id: 'qwen3_1_7b_quantized',
            name: 'Qwen3 1.7B (Quant)',
            ramMB: 1000,
            config: QWEN3_1_7B_QUANTIZED,
            description: 'Qwen3 mid tier with strong instruction following.',
        },
        {
            id: 'qwen3_4b_quantized',
            name: 'Qwen3 4B (Quant)',
            ramMB: 4600,
            config: QWEN3_4B_QUANTIZED,
            description: 'Qwen3 flagship local model.',
        },
        // ── Cloud API ────────────────────────────────────────────────────────
        {
            id: 'gemini_api',
            name: 'Gemini Flash (API)',
            ramMB: 0,
            isApi: true,
            description: 'Google Gemini via cloud API. Requires network.',
        },
    ] as ModelMetadata[],

    VTT: [
        { id: 'whisper_base', name: 'Whisper Base', ramMB: 410 },
        { id: 'whisper_base_en', name: 'Whisper Base EN', ramMB: 410 },
        { id: 'whisper_base_en_quantized', name: 'Whisper Base EN (Quant)', ramMB: 250 },
        { id: 'whisper_small', name: 'Whisper Small', ramMB: 900 },
        { id: 'whisper_small_en', name: 'Whisper Small EN', ramMB: 900 },
        { id: 'whisper_small_en_quantized', name: 'Whisper Small EN (Quant)', ramMB: 500 },
        { id: 'whisper_tiny', name: 'Whisper Tiny', ramMB: 200 },
        { id: 'whisper_tiny_en', name: 'Whisper Tiny EN', ramMB: 200 },
        { id: 'whisper_tiny_en_quantized', name: 'Whisper Tiny EN (Quant)', ramMB: 120 },
    ] as ModelMetadata[],

    TTV: [
        { id: 'kokoro_medium', name: 'Kokoro Medium', ramMB: 1140 },
        { id: 'kokoro_small', name: 'Kokoro Small', ramMB: 820 },
    ] as ModelMetadata[],

    OCR: [
        { id: 'ocr_english', name: 'OCR English', ramMB: 1300 },
    ] as ModelMetadata[],
};

export const MODEL_SECTIONS = [
    {
        title: 'Reasoning Models',
        icon: <Bot size={18} color="#6366f1" />,
        type: 'llm',
        models: MATE_MODELS.REASONING,
    },
    {
        title: 'Voice to Text',
        icon: <Mic size={18} color="#10b981" />,
        type: 'vtt',
        models: MATE_MODELS.VTT,
    },
    {
        title: 'Text to Voice',
        icon: <Volume2 size={18} color="#f59e0b" />,
        type: 'ttv',
        models: MATE_MODELS.TTV,
    },
    {
        title: 'OCR Models',
        icon: <ScanLine size={18} color="#ec4899" />,
        type: 'ocr',
        models: MATE_MODELS.OCR,
    },
];
