import React, { useReducer } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { Lightbulb } from 'lucide-react-native';
import { GenieAnimation } from './GenieAnimation';
import { ideaApi } from '../api/ideas';
import { addIdea } from '../store/slices/ideaSlice';
import { AppDispatch } from '../store';
import { useAppTheme } from '@/hooks/use-theme';
import { RADIUS, SPACING } from '../constants/theme';

interface CreateIdeaFormProps {
    onSuccess: () => void;
    onCancel?: () => void;
}

interface IdeaFormState {
    title: string;
    description: string;
    loading: boolean;
    error: string;
}

type IdeaFormAction =
    | { type: 'SET_TITLE'; value: string }
    | { type: 'SET_DESCRIPTION'; value: string }
    | { type: 'SUBMIT_START' }
    | { type: 'SUBMIT_SUCCESS' }
    | { type: 'SUBMIT_ERROR'; error: string };

const initialState: IdeaFormState = {
    title: '',
    description: '',
    loading: false,
    error: '',
};

function formReducer(state: IdeaFormState, action: IdeaFormAction): IdeaFormState {
    switch (action.type) {
        case 'SET_TITLE': return { ...state, title: action.value, error: '' };
        case 'SET_DESCRIPTION': return { ...state, description: action.value };
        case 'SUBMIT_START': return { ...state, loading: true, error: '' };
        case 'SUBMIT_SUCCESS': return { ...initialState, loading: false };
        case 'SUBMIT_ERROR': return { ...state, loading: false, error: action.error };
        default: return state;
    }
}

export const CreateIdeaForm: React.FC<CreateIdeaFormProps> = ({ onSuccess, onCancel }) => {
    const { colors } = useAppTheme();
    const styles = getStyles(colors);
    const reduxDispatch = useDispatch<AppDispatch>();
    const [state, dispatch] = useReducer(formReducer, initialState);

    const handleCreate = async () => {
        if (!state.title.trim()) {
            dispatch({ type: 'SUBMIT_ERROR', error: 'Idea title is required' });
            return;
        }

        const title = state.title.trim();
        const description = state.description.trim() || undefined;

        dispatch({ type: 'SUBMIT_START' });
        try {
            const response = await ideaApi.create({
                title,
                description,
            });
            reduxDispatch(addIdea(response.data));
            dispatch({ type: 'SUBMIT_SUCCESS' });
            onSuccess();
        } catch (err: any) {
            let errorMsg = 'Failed to capture idea';
            if (err?.response?.data?.message) {
                errorMsg = err.response.data.message;
            }
            dispatch({ type: 'SUBMIT_ERROR', error: errorMsg });
        }
    };

    return (
        <View style={styles.container}>
            <GenieAnimation>
                <View style={styles.card}>
                    {/* Header accent bar */}
                    <View style={styles.accentBar}>
                        <Lightbulb size={14} color={colors.primary} />
                        <Text style={styles.accentLabel}>New Idea</Text>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollArea}
                    >
                        <TextInput
                            style={styles.titleInput}
                            placeholder="What's the idea?"
                            placeholderTextColor={colors.textSecondary}
                            value={state.title}
                            onChangeText={(val) => dispatch({ type: 'SET_TITLE', value: val })}
                            multiline
                        />
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Add a description or notes (optional)"
                            placeholderTextColor={colors.textSecondary}
                            value={state.description}
                            onChangeText={(val) => dispatch({ type: 'SET_DESCRIPTION', value: val })}
                            multiline
                        />
                    </ScrollView>

                    <View style={styles.divider} />

                    <View style={styles.bottomBar}>
                        <Text style={styles.hintText}>💡 No deadlines, just possibilities</Text>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onCancel || onSuccess}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    (!state.title.trim() || state.loading) && styles.addButtonDisabled
                                ]}
                                onPress={handleCreate}
                                disabled={!state.title.trim() || state.loading}
                            >
                                <Text style={styles.addButtonText}>
                                    {state.loading ? 'Saving...' : 'Capture'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </GenieAnimation>

            {state.error ? <Text style={styles.errorText}>{state.error}</Text> : null}
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        padding: SPACING.md,
        width: '100%',
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: { elevation: 3 },
        }),
    },
    accentBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    accentLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    scrollArea: {
        maxHeight: 220,
    },
    titleInput: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        paddingVertical: SPACING.xs,
        marginBottom: 4,
    },
    descriptionInput: {
        fontSize: 14,
        color: colors.textSecondary,
        paddingVertical: 4,
        minHeight: 50,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: SPACING.md,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    hintText: {
        fontSize: 11,
        color: colors.textSecondary,
        flex: 1,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: colors.border,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.white,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
        marginTop: SPACING.sm,
        fontSize: 12,
    },
});
