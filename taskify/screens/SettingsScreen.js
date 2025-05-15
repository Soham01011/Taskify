import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Modal,
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomNavBar from '../modules/BottomNavBar';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isCreateGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');

  useEffect(() => {
    loadUserData();
    loadNotifications();
    loadGroups();
  }, []);

  const loadUserData = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      setUsername(savedUsername);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const members = newGroupMembers.split(',').map(m => m.trim());
      
      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newGroupName,
          members: members
        })
      });

      if (response.ok) {
        setCreateGroupModalVisible(false);
        setNewGroupName('');
        setNewGroupMembers('');
        loadGroups();
        Alert.alert('Success', 'Group created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* User Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account" size={24} color="#7CF5FF" />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
          <Text style={styles.username}>{username}</Text>
        </View>

        {/* Inbox Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="inbox" size={24} color="#7CF5FF" />
            <Text style={styles.sectionTitle}>Inbox</Text>
          </View>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications</Text>
          ) : (
            notifications.map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <Text style={styles.notificationText}>{notification.message}</Text>
              </View>
            ))
          )}
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account-group" size={24} color="#7CF5FF" />
            <Text style={styles.sectionTitle}>Groups</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setCreateGroupModalVisible(true)}
            >
              <Icon name="plus" size={24} color="#7CF5FF" />
            </TouchableOpacity>
          </View>
          {groups.map((group, index) => (
            <View key={index} style={styles.groupItem}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupMembers}>
                {group.members.length} members
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={isCreateGroupModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              placeholderTextColor="#666"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TextInput
              style={styles.input}
              placeholder="Member usernames (comma-separated)"
              placeholderTextColor="#666"
              value={newGroupMembers}
              onChangeText={setNewGroupMembers}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setCreateGroupModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateGroup}
              >
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  username: {
    color: '#7CF5FF',
    fontSize: 16,
  },
  notificationItem: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notificationText: {
    color: '#fff',
  },
  groupItem: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  groupName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupMembers: {
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    marginLeft: 'auto',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: '#7CF5FF',
    borderRadius: 8,
    padding: 12,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  }
});

export default SettingsScreen;