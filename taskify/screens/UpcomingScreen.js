import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomNavBar from '../modules/BottomNavBar';

const UpcomingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Upcoming Tasks</Text>
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  }
});

export default UpcomingScreen;