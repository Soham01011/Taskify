import { useState, useCallback, useRef, useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';
import { fetchIdeas, updateIdea, removeIdea } from '@/src/store/slices/ideaSlice';
import { ideaApi, Idea } from '@/src/api/ideas';

interface IdeasState {
    isCreating: boolean;
    refreshing: boolean;
    syncing: boolean;
    selectedIdea: Idea | null;
    newIdeaIds: Set<string>;
}

type IdeasAction =
    | { type: 'SET_CREATING'; payload: boolean }
    | { type: 'SET_REFRESHING'; payload: boolean }
    | { type: 'SET_SYNCING'; payload: boolean }
    | { type: 'SET_SELECTED_IDEA'; payload: Idea | null }
    | { type: 'SET_NEW_IDEA_IDS'; payload: Set<string> }
    | { type: 'HIGHLIGHT_NEW_IDEAS'; payload: string[] };

const initialState: IdeasState = {
    isCreating: false,
    refreshing: false,
    syncing: false,
    selectedIdea: null,
    newIdeaIds: new Set(),
};

function ideasReducer(state: IdeasState, action: IdeasAction): IdeasState {
    switch (action.type) {
        case 'SET_CREATING': return { ...state, isCreating: action.payload };
        case 'SET_REFRESHING': return { ...state, refreshing: action.payload };
        case 'SET_SYNCING': return { ...state, syncing: action.payload };
        case 'SET_SELECTED_IDEA': return { ...state, selectedIdea: action.payload };
        case 'SET_NEW_IDEA_IDS': return { ...state, newIdeaIds: action.payload };
        case 'HIGHLIGHT_NEW_IDEAS': {
            const nextNewIds = new Set(action.payload);
            return { ...state, newIdeaIds: nextNewIds };
        }
        default: return state;
    }
}

export function useIdeas() {
    const dispatch = useDispatch<AppDispatch>();
    const { ideas, isLoading } = useSelector((state: RootState) => state.ideas);
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const [state, localDispatch] = useReducer(ideasReducer, initialState);
    const hasAttemptedInitialSync = useRef(false);

    const getLatestTimestamp = useCallback((): string | null => {
        if (ideas.length === 0) return null;
        return ideas.reduce((latest, idea) => {
            if (!idea.created_at) return latest;
            return new Date(idea.created_at).getTime() > new Date(latest).getTime()
                ? idea.created_at
                : latest;
        }, ideas[0].created_at);
    }, [ideas]);

    const loadIdeas = useCallback((params?: object) => {
        if (currentUserId) {
            dispatch(fetchIdeas(params as any));
        }
    }, [currentUserId, dispatch]);

    const backgroundSync = useCallback(async () => {
        if (!currentUserId) return;
        const latest = getLatestTimestamp();
        if (!latest) return;

        localDispatch({ type: 'SET_SYNCING', payload: true });
        try {
            const result = await dispatch(
                fetchIdeas({ created_at: latest, pageNumber: 1, pageSize: 50 })
            ).unwrap();
            const data = result.data;
            const incoming: Idea[] = Array.isArray(data) ? data : data.ideas;
            if (incoming.length > 0) {
                const existingIds = new Set(ideas.map(i => i._id));
                const freshIds = incoming.filter(i => !existingIds.has(i._id)).map(i => i._id);
                if (freshIds.length > 0) {
                    localDispatch({ type: 'HIGHLIGHT_NEW_IDEAS', payload: freshIds });
                    setTimeout(() => localDispatch({ type: 'SET_NEW_IDEA_IDS', payload: new Set() }), 3000);
                }
            }
            localDispatch({ type: 'SET_SYNCING', payload: false });
        } catch (_) {
            localDispatch({ type: 'SET_SYNCING', payload: false });
        }
    }, [currentUserId, dispatch, getLatestTimestamp, ideas]);

    useEffect(() => {
        if (currentUserId && !hasAttemptedInitialSync.current) {
            hasAttemptedInitialSync.current = true;
            const latest = getLatestTimestamp();
            if (latest) {
                backgroundSync();
            } else {
                loadIdeas({ pageNumber: 1, pageSize: 20 });
            }
        }
    }, [currentUserId, loadIdeas, getLatestTimestamp, backgroundSync]);

    const handleRefresh = async () => {
        localDispatch({ type: 'SET_REFRESHING', payload: true });
        try {
            await dispatch(fetchIdeas({ pageNumber: 1, pageSize: 20 })).unwrap();
        } catch (_) { }
        localDispatch({ type: 'SET_REFRESHING', payload: false });
    };

    const handleDelete = async (id: string) => {
        try {
            await ideaApi.delete(id);
            dispatch(removeIdea(id));
            if (state.selectedIdea?._id === id) {
                localDispatch({ type: 'SET_SELECTED_IDEA', payload: null });
            }
        } catch (_) { }
    };

    const handleAddThread = async (content: string) => {
        if (!state.selectedIdea || !content.trim()) return;
        try {
            const response = await ideaApi.addThreadEntry(state.selectedIdea._id, content);
            dispatch(updateIdea(response.data));
            localDispatch({ type: 'SET_SELECTED_IDEA', payload: response.data });
        } catch (_) {
            throw _;
        }
    };

    const handleDeleteThread = async (entryId: string) => {
        if (!state.selectedIdea) return;
        try {
            const response = await ideaApi.deleteThreadEntry(state.selectedIdea._id, entryId);
            dispatch(updateIdea(response.data));
            localDispatch({ type: 'SET_SELECTED_IDEA', payload: response.data });
        } catch (_) { }
    };

    return {
        ideas,
        isLoading,
        currentUserId,
        ...state,
        setIsCreating: (val: boolean) => localDispatch({ type: 'SET_CREATING', payload: val }),
        setSelectedIdea: (val: Idea | null) => localDispatch({ type: 'SET_SELECTED_IDEA', payload: val }),
        handleRefresh,
        handleDelete,
        handleAddThread,
        handleDeleteThread,
    };
}
