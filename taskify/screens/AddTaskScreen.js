import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Calendar } from "react-native-calendars";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';


const { height: windowHeight } = Dimensions.get("window");

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [subtasks, setSubtasks] = useState([""]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const handleTimeSelect = (event, selected) => {
    setShowTimePicker(false);
    if (selected) {
      setSelectedTime(selected);
    }
  };

  const handleSubtaskChange = (text, index) => {
    const updated = [...subtasks];
    updated[index] = text;
    setSubtasks(updated);

    // If last input is filled, add a new empty one
    if (index === subtasks.length - 1 && text.trim() !== "") {
      setSubtasks([...updated, ""]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Error', 'Task title is required');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const dueDateTime = selectedDate && selectedTime
      ? new Date(new Date(`${selectedDate}T${selectedTime.toTimeString().slice(0, 8)}`).getTime() + 5.5 * 60 * 60 * 1000)
      : selectedDate
      ? new Date(new Date(`${selectedDate}T00:00:00`).getTime() + 5.5 * 60 * 60 * 1000)
      : null;
    

      // Filter out empty subtasks
      const filteredSubtasks = subtasks
        .filter(subtask => subtask.trim() !== '')
        .map(subtask => ({
          title: subtask,
          description: description, // Inherit from parent task
          priority: priority || 'medium',
          dueDate: dueDateTime,
          subjects: []
        }));

      const taskData = {
        title,
        description: description || '',
        dueDate: dueDateTime,
        priority: priority || 'medium',
        subjects: [],
        group: 'personal', // You can make this dynamic if needed
        subtasks: filteredSubtasks
      };

      const response = await fetch('https://taskify-eight-kohl.vercel.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (response.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView keyboardShouldPersistTaps="handled">
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
          value={description}
          onChangeText={setDescription}
          style={styles.descriptionInput}
        />

        {/* Subtasks */}
        {subtasks.map((subtask, index) => (
          <TextInput
            key={index}
            placeholder={`Subtask ${index + 1}`}
            placeholderTextColor="#666"
            value={subtask}
            onChangeText={(text) => handleSubtaskChange(text, index)}
            style={styles.subtaskInput}
          />
        ))}

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setShowCalendar((prev) => !prev)}
          >
            <Icon name="calendar-outline" size={20} color="#666" />
            <Text style={styles.optionText}>{selectedDate || "Date"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              priority && { backgroundColor: getPriorityColor(priority) },
            ]}
            onPress={() => {
              const next =
                priority === "high"
                  ? "medium"
                  : priority === "medium"
                  ? "low"
                  : "high";
              setPriority(next);
            }}
          >
            <Icon
              name="flag-outline"
              size={20}
              color={priority ? "#fff" : "#666"}
            />
            <Text style={[styles.optionText, priority && { color: "#fff" }]}>
              Priority
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              reminder && { backgroundColor: "#3D90D7" },
            ]}
            onPress={() => setReminder(getNextReminder(reminder))}
          >
            <Icon
              name="bell-outline"
              size={20}
              color={reminder ? "#fff" : "#666"}
            />
            <Text style={[styles.optionText, reminder && { color: "#fff" }]}>
              {reminder
                ? reminder.charAt(0).toUpperCase() + reminder.slice(1)
                : "Reminders"}
            </Text>
          </TouchableOpacity>
        </View>

        {showCalendar && (
          <View style={styles.inlineCalendarContainer}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  marked: true,
                  selectedColor: "#3D90D7",
                },
              }}
              theme={{
                backgroundColor: "#000",
                calendarBackground: "#000",
                textSectionTitleColor: "#666",
                selectedDayBackgroundColor: "#3D90D7",
                todayTextColor: "#3D90D7",
                dayTextColor: "#fff",
                monthTextColor: "#fff",
              }}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Icon name="clock-outline" size={20} color="#666" />
          <Text style={styles.optionText}>
            {selectedTime
              ? selectedTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Time"}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          Platform.OS === 'web' ? (
            <TextInput
              type="time"
              style={styles.timeInput}
              value={selectedTime ? selectedTime.toTimeString().slice(0, 5) : ''}
              onChange={(event) => {
                const [hours, minutes] = event.target.value.split(':');
                const newDate = new Date();
                newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                handleTimeSelect({ type: 'set', nativeEvent: { timestamp: newDate } }, newDate);
              }}
            />
          ) : (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="default"
              onChange={handleTimeSelect}
            />
          )
        )}

        <TouchableOpacity style={styles.subjectButton}>
          <Icon name="inbox" size={20} color="#666" />
          <Text style={styles.subjectText}>Subjects</Text>
          <Icon
            name="chevron-right"
            size={20}
            color="#666"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Text style={styles.addText}>Add task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "#FF4444";
    case "medium":
      return "#FFA500";
    case "low":
      return "#4ADE80";
    default:
      return "#333";
  }
};

const getNextReminder = (current) => {
  switch (current) {
    case "daily":
      return "weekly";
    case "weekly":
      return "monthly";
    case "monthly":
      return "yearly";
    case "yearly":
      return null;
    default:
      return "daily";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
    paddingTop: 40,
  },
  titleInput: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    padding: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  subtaskInput: {
    fontSize: 15,
    color: "#ccc",
    backgroundColor: "#111",
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
  },
  optionsRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
    marginBottom: 10,
  },
  optionText: {
    color: "#666",
    fontSize: 14,
  },
  inlineCalendarContainer: {
    backgroundColor: "#222",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  subjectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  subjectText: {
    color: "#666",
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#3D90D7",
    padding: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  timeInput: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 16,
    width: 120,
    borderWidth: 0,
  },
});

export default AddTaskScreen;
