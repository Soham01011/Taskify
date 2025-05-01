// screens/AddTaskScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddTaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add New Task</Text>
      {/* Here you will add your form later */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
