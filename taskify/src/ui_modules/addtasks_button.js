import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Keyboard,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";

// Consistent color scheme from the other screens
const colors = {
  darkPurple: "#22092C",
  darkMaroon: "#872341",
  boldRed: "#BE3144",
  vibrantOrange: "#F05941",
  white: "#FFFFFF",
  lightGray: "#E0E0E0",
  mediumGray: "#A0A0A0",
  cardBackground: "#2a1b3d",
  placeholder: "rgba(190, 49, 68, 0.7)",
  successGreen: "#28a745",
};

export default function AddTaskButton({ onTaskAdded }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const [parentDueDate, setParentDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleExpand = () => {
    if (expanded) {
      resetForm();
    }
    setExpanded(!expanded);
  };

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtaskTitle }]);
      setNewSubtaskTitle("");
    }
  };

  const resetForm = () => {
      setTitle("");
      setDescription("");
      setParentDueDate(new Date());
      setSubtasks([]);
      setNewSubtaskTitle("");
  }

  const submitTask = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for the task.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const apiUrl = await SecureStore.getItemAsync("apiUrl");
      if (!token || !apiUrl) {
        Alert.alert("Error", "Authentication details not found. Please log in again.");
        return;
      }

      const subtasksForApi = subtasks.map(st => ({ title: st.title, dueDate: null }));

      const payload = {
        title,
        description,
        dueDate: parentDueDate.toISOString(),
        subtasks: subtasksForApi,
      };

      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      Alert.alert("Success", "Task created successfully!");
      resetForm();
      setExpanded(false);
      Keyboard.dismiss();
      if(onTaskAdded) {
        onTaskAdded();
      }

    } catch (error) {
      Alert.alert("Submission Error", error.message);
      console.error("Error submitting task:", error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setParentDueDate(selectedDate);
    }
  };

  const showDatePickerHandler = () => {
    Keyboard.dismiss(); // Dismiss keyboard before showing picker
    setShowDatePicker(true);
  }

  return (
    <>
      {expanded && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
        >
          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Finish Q3 Report"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="(Optional) Add more details"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={showDatePickerHandler}
            >
              <Text style={styles.datePickerText}>{parentDueDate.toLocaleString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={parentDueDate}
                mode="datetime"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
              />
            )}

            <Text style={styles.label}>Subtasks</Text>
            <FlatList
              data={subtasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <Text style={styles.subtaskItem}>• {item.title}</Text>}
              style={styles.subtaskList}
              scrollEnabled={false} // The parent ScrollView will handle scrolling
            />

            <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={[styles.input, {flex: 1}]}
                  placeholder="Add a subtask"
                  placeholderTextColor={colors.placeholder}
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={addSubtask}
                />
                <TouchableOpacity onPress={addSubtask} style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>


            <TouchableOpacity onPress={submitTask} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit Task</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />{/* Extra space at the bottom */}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <TouchableOpacity style={styles.fab} onPress={toggleExpand}>
        <Text style={styles.fabIcon}>
          {expanded ? "×" : "+"}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%', // Limit how much space the form can take
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: colors.vibrantOrange,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10, // Ensure FAB is above the form
  },
  fabIcon: {
      color: colors.white,
      fontSize: 30,
      lineHeight: 32,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    color: colors.lightGray,
    fontSize: 16,
  },
  input: {
    backgroundColor: colors.darkPurple,
    borderWidth: 1,
    borderColor: colors.darkMaroon,
    borderRadius: 8,
    padding: 12,
    color: colors.white,
    fontSize: 15,
  },
  datePickerButton: {
    backgroundColor: colors.darkPurple,
    borderWidth: 1,
    borderColor: colors.darkMaroon,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  datePickerText: {
    color: colors.white,
    fontSize: 15,
  },
  subtaskList: {
      marginVertical: 10,
  },
  subtaskItem: {
      color: colors.mediumGray,
      fontSize: 14,
      paddingVertical: 4,
  },
  addSubtaskContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
  },
  addButton: {
    backgroundColor: colors.darkMaroon,
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
  },
  addButtonText: {
      color: colors.white,
      fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: colors.successGreen,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 16,
  },
});
