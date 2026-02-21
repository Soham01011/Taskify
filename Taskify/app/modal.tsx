import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { CreateTaskForm } from '../src/components/CreateTaskForm';

export default function ModalScreen() {
  const router = useRouter();
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      router.back();
    }, 300);
  };

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

      {/* Background overlay to close modal */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      />

      <View style={styles.modalContent}>
        {!isClosing && (
          <CreateTaskForm
            onSuccess={handleClose}
            onCancel={handleClose}
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
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Reduced to avoid double padding with KeyboardAvoidingView
  },
});
