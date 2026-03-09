import { GroupMembersModal } from '@/src/components/Groups/GroupMembersModal';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function GroupMembersModalScreen() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId: string }>();
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            router.back();
        }, 300);
    };

    if (!groupId) return null;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'android' ? 'padding' : 'padding'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 40}
        >
            <Stack.Screen options={{
                headerShown: false,
                presentation: 'transparentModal',
            }} />
            <StatusBar style="auto" />

            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            />

            <View style={styles.modalContent}>
                {!isClosing && (
                    <GroupMembersModal
                        groupId={groupId}
                        onClose={handleClose}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: 'transparent',
        width: '100%',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
});
