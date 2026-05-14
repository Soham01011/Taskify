"use no memo";
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Lock, Unlock, Trash2, X } from 'lucide-react-native';
import Animated, { ZoomIn, ZoomOut, FadeOut, FadeInUp } from 'react-native-reanimated';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { useSecureNotes, NoteMeta } from '@/src/hooks/useSecureNotes';
import { CreateNoteForm } from '@/src/components/Notes/CreateNoteForm';

interface NoteCardProps {
    item: NoteMeta;
    index: number;
    colors: any;
    onOpen: (note: NoteMeta) => void;
    onDelete: (id: string) => void;
}

const NoteCard = React.memo(({ item, index, colors, onOpen, onDelete }: NoteCardProps) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(400)}>
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onOpen(item)}
        >
            <View style={styles.noteContent}>
                <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.noteMetaRow}>
                    {item.isSecure ? <Lock size={14} color={colors.primary} /> : <Unlock size={14} color={colors.textSecondary} />}
                    <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
                <Trash2 size={20} color="#FF3B30" />
            </TouchableOpacity>
        </TouchableOpacity>
    </Animated.View>
));

export default function NotesScreen() {
    const { colors } = useAppTheme();
    const router = useRouter();
    const { notes, loading, saveNote, readNoteBody, deleteNote } = useSecureNotes();

    const [isCreating, setIsCreating] = useState(false);
    
    // Viewing State
    const [viewingNote, setViewingNote] = useState<NoteMeta | null>(null);
    const [viewingBody, setViewingBody] = useState<string>('');
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleCreate = async (title: string, body: string, isSecure: boolean) => {
        await saveNote(title, body, isSecure);
        setIsCreating(false);
    };

    const handleOpenNote = async (note: NoteMeta) => {
        try {
            setIsUnlocking(true);
            const body = await readNoteBody(note.id, note.isSecure);
            if (body !== null) {
                setViewingBody(body);
                setViewingNote(note);
            }
        } catch (e) {
            console.log('Unlock failed or cancelled', e);
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteNote(id) }
        ]);
    };



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Secure Notes</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={notes}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                    <NoteCard 
                        item={item} 
                        index={index} 
                        colors={colors} 
                        onOpen={handleOpenNote} 
                        onDelete={handleDelete} 
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Lock size={48} color={colors.textSecondary} opacity={0.5} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No notes found.{"\n"}Tap + to create a secure note.
                            </Text>
                        </View>
                    ) : null
                }
            />

            {/* Read Note Modal */}
            <Modal visible={viewingNote !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setViewingNote(null)}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>{viewingNote?.title}</Text>
                            {viewingNote?.isSecure && <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Secured</Text>}
                        </View>
                        <TouchableOpacity onPress={() => setViewingNote(null)} style={{ padding: 8 }}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={[styles.modalBody, { color: colors.text }]}>{viewingBody}</Text>
                    </ScrollView>
                </View>
            </Modal>

            {/* Fluid FAB to Modal Morph for Creation */}
            {!isCreating ? (
                <Animated.View
                    key="fab-container"
                    entering={ZoomIn.duration(400).springify()}
                    exiting={ZoomOut.duration(300).springify()}
                    style={[styles.fab, { zIndex: 99 }]}
                >
                    <TouchableOpacity
                        style={[styles.fabTouch, { backgroundColor: colors.primary }]}
                        onPress={() => setIsCreating(true)}
                        activeOpacity={0.6}
                    >
                        <Plus size={32} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>
            ) : (
                <Animated.View
                    key="modal-container"
                    exiting={FadeOut.duration(400)}
                    style={[styles.compactModalContainer, { zIndex: 100 }]}
                    pointerEvents="box-none"
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
                    >
                        <CreateNoteForm
                            onSuccess={handleCreate}
                            onCancel={() => setIsCreating(false)}
                        />
                    </KeyboardAvoidingView>
                </Animated.View>
            )}

            {/* Background Overlay when creating */}
            {isCreating && (
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => setIsCreating(false)}
                        activeOpacity={1}
                    />
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.md,
    },
    noteContent: {
        flex: 1,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    noteMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noteDate: {
        fontSize: 13,
        fontWeight: '500',
    },
    deleteBtn: {
        padding: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabTouch: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactModalContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'flex-end',
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 90,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalContent: {
        padding: 20,
        paddingBottom: 60,
    },
    modalBody: {
        fontSize: 18,
        lineHeight: 28,
    }
});
