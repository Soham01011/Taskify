import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export interface NoteMeta {
    id: string;
    title: string;
    isSecure: boolean;
    createdAt: number;
}

const STORAGE_KEY = '@secure_notes_meta';

export function useSecureNotes() {
    const [notes, setNotes] = useState<NoteMeta[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // Sort by newest first
                setNotes(parsed.sort((a: NoteMeta, b: NoteMeta) => b.createdAt - a.createdAt));
            }
        } catch (error) {
            console.error('Failed to load notes', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const saveNote = async (title: string, body: string, isSecure: boolean) => {
        try {
            const id = 'note_' + Date.now().toString() + Math.random().toString(36).substring(7);
            
            // Save body in SecureStore
            if (isSecure) {
                await SecureStore.setItemAsync(id, body, {
                    requireAuthentication: true,
                    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
                });
            } else {
                await SecureStore.setItemAsync(id, body);
            }

            // Save meta in AsyncStorage
            const newMeta: NoteMeta = {
                id,
                title,
                isSecure,
                createdAt: Date.now()
            };
            const newNotes = [newMeta, ...notes];
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
            setNotes(newNotes);
            return true;
        } catch (error) {
            console.error('Failed to save note:', error);
            throw error; // Let the caller handle the error (e.g. auth failed)
        }
    };

    const readNoteBody = async (id: string, isSecure: boolean): Promise<string | null> => {
        try {
            if (isSecure) {
                return await SecureStore.getItemAsync(id, {
                    requireAuthentication: true
                });
            } else {
                return await SecureStore.getItemAsync(id);
            }
        } catch (error) {
            console.error('Failed to read note body:', error);
            throw error;
        }
    };

    const deleteNote = async (id: string) => {
        try {
            await SecureStore.deleteItemAsync(id);
            const newNotes = notes.filter(n => n.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
            setNotes(newNotes);
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    return {
        notes,
        loading,
        saveNote,
        readNoteBody,
        deleteNote,
        reloadNotes: loadNotes
    };
}
