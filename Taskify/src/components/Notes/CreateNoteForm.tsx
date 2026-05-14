import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Keyboard, Alert } from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { Lock, Unlock, X } from 'lucide-react-native';

interface CreateNoteFormProps {
    onSuccess: (title: string, body: string, isSecure: boolean) => Promise<void>;
    onCancel: () => void;
}

export function CreateNoteForm({ onSuccess, onCancel }: CreateNoteFormProps) {
    const { colors } = useAppTheme();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isSecure, setIsSecure] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAuthSetup, setHasAuthSetup] = useState(true);

    useEffect(() => {
        // We bypass LocalAuthentication.isEnrolledAsync() check to prevent native module crashes 
        // on dev clients missing the module. SecureStore will throw gracefully if auth is missing.
        setHasAuthSetup(true);
    }, []);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please provide a title for your note.');
            return;
        }

        Keyboard.dismiss();
        setIsSubmitting(true);
        try {
            await onSuccess(title, body, isSecure);
        } catch (e) {
            Alert.alert('Error', 'Failed to secure note. Ensure biometrics/passcode is set up.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, shadowColor: '#000' }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Note</Text>
                <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                    <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <TextInput
                style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
                placeholder="Note Title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                autoFocus
            />

            <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Write your secret note here..."
                placeholderTextColor={colors.textSecondary}
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
            />

            <View style={[styles.secureRow, { borderColor: colors.border }]}>
                <View style={styles.secureTextRow}>
                    {isSecure ? <Lock size={20} color={colors.primary} /> : <Unlock size={20} color={colors.textSecondary} />}
                    <View>
                        <Text style={[styles.secureLabel, { color: isSecure ? colors.primary : colors.textSecondary }]}>
                            {isSecure ? 'Secured with Device Auth' : 'Unsecured Note'}
                        </Text>
                        {!hasAuthSetup && (
                            <Text style={[styles.warningText, { color: colors.danger || '#FF3B30' }]}>
                                No device passcode/biometrics set
                            </Text>
                        )}
                    </View>
                </View>
                <Switch
                    value={isSecure}
                    onValueChange={(val) => {
                        if (!hasAuthSetup && val) {
                            Alert.alert('Authentication Required', 'You must set up a device PIN, password, or biometrics in your phone settings to use secure notes.');
                            return;
                        }
                        setIsSecure(val);
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                />
            </View>

            <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
                <Text style={styles.submitBtnText}>{isSubmitting ? 'Saving...' : 'Save Note'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 3,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeBtn: {
        padding: SPACING.xs,
    },
    input: {
        fontSize: 22,
        fontWeight: '600',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        marginBottom: SPACING.md,
    },
    textArea: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        height: 150,
        marginBottom: SPACING.lg,
    },
    secureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginBottom: SPACING.xl,
    },
    secureTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    secureLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    warningText: {
        fontSize: 11,
        marginTop: 2,
    },
    submitBtn: {
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
