import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    {
      name: 'Today',
      icon: 'calendar-today',
      screen: 'Home'
    },
    {
      name: 'Upcoming',
      icon: 'calendar-clock',
      screen: 'Upcoming'
    },
    {
      name: 'Settings',
      icon: 'cog',
      screen: 'Settings'
    }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.screen;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.screen)}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={isActive ? '#7CF5FF' : '#666'}
            />
            <Text style={[
              styles.tabText,
              { color: isActive ? '#7CF5FF' : '#666' }
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  }
});

export default BottomNavBar;