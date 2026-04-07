import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MateConfigState {
    systemRamOffsetGB: number; // RAM reserved for OS/other apps (default 2.5GB)
    useApiForReasoning: boolean; // Global toggle to force API
    selectedReasoningModelId: string | null;
    selectedVttModelId: string | null;
    selectedTtvModelId: string | null;
    selectedOcrModelId: string | null;
    contextWindowSize: number; // Number of messages to keep in sliding window
    dualModelEnabled: boolean; // Keep both Router and Reasoner in RAM for speed
}

const initialState: MateConfigState = {
    systemRamOffsetGB: 2.5,
    useApiForReasoning: false,
    selectedReasoningModelId: null,
    selectedVttModelId: null,
    selectedTtvModelId: null,
    selectedOcrModelId: null,
    contextWindowSize: 10,
    dualModelEnabled: false, // Sequential by default
};

const mateConfigSlice = createSlice({
    name: 'mateConfig',
    initialState,
    reducers: {
        toggleDualModel: (state, action: PayloadAction<boolean>) => {
            state.dualModelEnabled = action.payload;
        },
        setSystemRamOffset: (state, action: PayloadAction<number>) => {
            state.systemRamOffsetGB = action.payload;
        },
        toggleApiReasoning: (state, action: PayloadAction<boolean>) => {
            state.useApiForReasoning = action.payload;
        },
        setSelectedModel: (state, action: PayloadAction<{ type: 'reasoning' | 'vtt' | 'ttv' | 'ocr', id: string | null }>) => {
            const { type, id } = action.payload;
            if (type === 'reasoning' && id) state.selectedReasoningModelId = id;
            else if (type === 'vtt') state.selectedVttModelId = id;
            else if (type === 'ttv') state.selectedTtvModelId = id;
            else if (type === 'ocr') state.selectedOcrModelId = id;
        },
        setContextWindowSize: (state, action: PayloadAction<number>) => {
            state.contextWindowSize = action.payload;
        }
    }
});

export const { 
    setSystemRamOffset, 
    toggleApiReasoning, 
    setSelectedModel, 
    setContextWindowSize,
    toggleDualModel
} = mateConfigSlice.actions;

export default mateConfigSlice.reducer;
