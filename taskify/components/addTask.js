import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, ScrollView, Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const priorities = ['low', 'medium', 'high'];
const groups = ['personal', 'work', 'study']; // You can fetch this dynamically

export default function AddTaskButton({ onAddTask }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [subtasks, setSubtasks] = useState(['']);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [group, setGroup] = useState('personal');

  const handleAddSubtask = () => setSubtasks([...subtasks, '']);
  const handleSubtaskChange = (text, idx) => {
    const updated = [...subtasks];
    updated[idx] = text;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (idx) => {
    const updated = subtasks.filter((_, i) => i !== idx);
    setSubtasks(updated);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  const handleSubmit = () => {
    if (!taskName.trim()) return;
    onAddTask && onAddTask({
      title: taskName,
      description,
      priority,
      dueDate,
      group,
      subtasks: subtasks.filter(s => s.trim()).map(title => ({ title, completed: false }))
    });
    setModalVisible(false);
    setTaskName('');
    setDescription('');
    setPriority('medium');
    setDueDate(new Date());
    setGroup('personal');
    setSubtasks(['']);
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="plus" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Add Task */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TextInput
                style={styles.input}
                placeholder="Task Name"
                value={taskName}
                onChangeText={setTaskName}
              />
              <Text style={styles.label}>Subtasks</Text>
              {subtasks.map((sub, idx) => (
                <View key={idx} style={styles.subtaskRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={`Subtask ${idx + 1}`}
                    value={sub}
                    onChangeText={text => handleSubtaskChange(text, idx)}
                  />
                  {subtasks.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveSubtask(idx)}>
                      <Icon name="close" size={22} color="#FF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={handleAddSubtask} style={styles.addSubtaskBtn}>
                <Icon name="plus" size={18} color="#7CF5FF" />
                <Text style={styles.addSubtaskText}>Add Subtask</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <Text style={styles.label}>Priority</Text>
              <View style={styles.row}>
                {priorities.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      priority === p && styles.chipSelected
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[
                      styles.chipText,
                      priority === p && styles.chipTextSelected
                    ]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Due Date & Time</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>
                  {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={handleDateChange}
                />
              )}
              <Text style={styles.label}>Group</Text>
              <View style={styles.row}>
                {groups.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.chip,
                      group === g && styles.chipSelected
                    ]}
                    onPress={() => setGroup(g)}
                  >
                    <Text style={[
                      styles.chipText,
                      group === g && styles.chipTextSelected
                    ]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={handleSubmit}>
                <Text style={styles.addBtnText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#7CF5FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 10,
    shadowColor: '#7CF5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#7CF5FF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: '#7CF5FF',
  },
  chipText: {
    color: '#7CF5FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chipTextSelected: {
    color: '#fff',
  },
  addBtn: {
    backgroundColor: '#7CF5FF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  addBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 16,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  addSubtaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  addSubtaskText: {
    color: '#7CF5FF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});