import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height: windowHeight } = Dimensions.get('window');

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TextInput
        placeholder="Task Name"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
      />

      <TextInput
        placeholder="Task Description"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
        style={styles.descriptionInput}
      />

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.optionButton}>
          <Icon name="calendar-outline" size={20} color="#666" />
          <Text style={styles.optionText}>Date</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionButton,
            priority && { backgroundColor: getPriorityColor(priority) }
          ]}
          onPress={() => {
            const next = priority === 'high' ? 'medium' : priority === 'medium' ? 'low' : 'high';
            setPriority(next);
          }}
        >
          <Icon name="flag-outline" size={20} color={priority ? '#fff' : '#666'} />
          <Text style={[styles.optionText, priority && { color: '#fff' }]}>Priority</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Icon name="bell-outline" size={20} color="#666" />
          <Text style={styles.optionText}>Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <Icon name="dots-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.subjectButton}>
        <Icon name="inbox" size={20} color="#666" />
        <Text style={styles.subjectText}>Subjects</Text>
        <Icon name="chevron-right" size={20} color="#666" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addText}>Add task</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#FF4444';
    case 'medium': return '#FFA500';
    case 'low': return '#4ADE80';
    default: return '#333';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    paddingTop: 40,
  },
  titleInput: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
    padding: 8,
  },
  descriptionInput: { 
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  optionText: {
    color: '#666',
    fontSize: 14,
  },
  subjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  subjectText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3D90D7',
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddTaskScreen;