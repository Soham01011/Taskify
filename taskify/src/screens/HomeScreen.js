import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator, // To show loading state
} from "react-native";
import * as SecureStore from "expo-secure-store";

// Consistent color scheme from the login screen
const colors = {
  darkPurple: "#22092C",
  darkMaroon: "#872341",
  boldRed: "#BE3144",
  vibrantOrange: "#F05941",
  white: "#FFFFFF",
  lightGray: "#E0E0E0", // For primary text
  mediumGray: "#A0A0A0", // For secondary text
  cardBackground: "#2a1b3d", // A slightly lighter purple for cards
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        const apiUrl = await SecureStore.getItemAsync("apiUrl");

        if (!token || !apiUrl) {
          throw new Error("Authentication details not found.");
        }

        const res = await fetch(`${apiUrl}/api/tasks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch tasks");
        }

        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const toggleExpand = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const formatLocalDate = (utcDate) => {
    if (!utcDate) return "No date";
    const date = new Date(utcDate);
    return date.toLocaleString(); // converts to device's local time zone
  };

  const renderTask = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => toggleExpand(item._id)} style={styles.cardTouchable}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.dueDate}>Due: {formatLocalDate(item.dueDate)}</Text>
      </TouchableOpacity>

      {expandedTaskId === item._id && (
        <View style={styles.subtasksContainer}>
          {item.subtasks && item.subtasks.length > 0 ? (
            item.subtasks.map((subtask) => (
              <View key={subtask._id} style={styles.subtask}>
                <Text style={styles.subtaskTitle}>{subtask.title}</Text>
                <Text style={styles.subtaskDueDate}>
                  Due: {formatLocalDate(subtask.dueDate)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSubtasksText}>No subtasks</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.vibrantOrange} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>Error: {error}</Text>;
    }
    if (tasks.length === 0) {
        return <Text style={styles.emptyText}>No tasks found. Great job!</Text>
    }
    return (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.heading}>Today's Tasks</Text>
      {renderContent()}
    </SafeAreaView>
  );
}

// The new, themed stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkPurple,
  },
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.vibrantOrange,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.cardBackground,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardTouchable: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.lightGray,
  },
  description: {
    fontSize: 15,
    color: colors.mediumGray,
    marginVertical: 8,
    lineHeight: 22,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.boldRed,
    marginTop: 4,
  },
  subtasksContainer: {
    marginTop: 10,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: colors.darkMaroon,
  },
  subtask: {
    paddingVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.darkMaroon,
    paddingLeft: 12,
    marginBottom: 8,
  },
  subtaskTitle: {
    fontSize: 15,
    color: colors.lightGray,
  },
  subtaskDueDate: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 4,
  },
  noSubtasksText: {
    fontSize: 14,
    color: colors.mediumGray,
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.boldRed,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
      color: colors.mediumGray,
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
  }
});
