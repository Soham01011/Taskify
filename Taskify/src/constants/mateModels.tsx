import { Bot, Mic, ScanLine, Volume2 } from 'lucide-react-native';
import React from 'react';
import { QWEN2_5_1_5B_QUANTIZED, QWEN2_5_3B, SMOLLM2_1_360M, SMOLLM2_1_360M_QUANTIZED } from 'react-native-executorch';

export const MODEL_SECTIONS = [
    {
        title: 'Large Language Models',
        icon: <Bot size={18} color="#6366f1" />,
        type: 'llm',
        models: [
            { id: 'qwen_2_5_1_5b', name: 'Qwen 2.5 1.5B (Quantized)', config: QWEN2_5_1_5B_QUANTIZED },
            { id: 'qwen_2_5_3b', name: 'Qwen 2.5 3B', config: QWEN2_5_3B },
            { id: 'smollm2_360m', name: 'SmolLM2 360M', config: SMOLLM2_1_360M },
            { id: 'smollm2_360m_quant', name: 'SmolLM2 360M (Quantized)', config: SMOLLM2_1_360M_QUANTIZED }
        ]
    },
    {
        title: 'Voice to Text',
        icon: <Mic size={18} color="#10b981" />,
        type: 'vtt',
        models: []
    },
    {
        title: 'Text to Voice',
        icon: <Volume2 size={18} color="#f59e0b" />,
        type: 'ttv',
        models: []
    },
    {
        title: 'OCR Models',
        icon: <ScanLine size={18} color="#ec4899" />,
        type: 'ocr',
        models: []
    }
];
