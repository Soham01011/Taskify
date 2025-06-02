import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TaskCard = ({ task, pulseAnim, isOverdue, onComplete, isCompleting }) => {
  const [expanded, setExpanded] = useState(false);

  const handleTaskComplete = () => {
    if (!isCompleting && !task.completed) {
      onComplete(task._id);
    }
  };

  const handleSubtaskComplete = (subtask) => {
    if (!isCompleting && !subtask.completed) {
      onComplete(task._id, subtask.title);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const gradientColors = isOverdue
    ? ['#FF0000', '#FF7F50']
    : ['#0B2F9F', '#7CF5FF'];

  const gradientProps = {
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  };

  return (
    <Animated.View style={[styles.cardContainer, { opacity: task.completed ? 0.5 : 1 }]}>
      <LinearGradient colors={gradientColors} {...gradientProps}>
        <View style={styles.cardContent}>
          {/* Add group indicator if task belongs to a group */}
          {task.group && task.group !== 'personal' && (
            <View style={styles.groupIndicator}>
              <Icon name="account-group" size={16} color="#7CF5FF" />
              <Text style={styles.groupName}>{task.groupName}</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setExpanded(!expanded)}
          >
            <View style={{ 
              backgroundColor: '#000', 
              borderRadius: 14, 
              padding: 16 
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity 
                  onPress={handleTaskComplete}
                  disabled={task.completed || isCompleting}
                  style={{
                    marginRight: 8,
                  }}
                >
                  <Icon 
                    name={task.completed ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                    size={24} 
                    color="#7CF5FF" 
                  />
                </TouchableOpacity>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: 8,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.7 : 1
                }}>
                  {task.title}
                </Text>
                <Icon 
                  name={expanded ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color="#7CF5FF" 
                />
              </View>

              {task.description && (
                <View style={{
                  backgroundColor: '#222',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}>
                  <Text style={{ color: '#bbb', fontSize: 14 }}>
                    {task.description}
                  </Text>
                </View>
              )}

              {expanded && (
                <View style={{ marginTop: 10 }}>
                  {/* Priority */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="flag" size={20} color="#7CF5FF" />
                    <Text style={{ color: '#fff', marginLeft: 8 }}>
                      Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Text>
                  </View>

                  {/* Due Date */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="calendar" size={20} color="#7CF5FF" />
                    <Text style={{ color: '#fff', marginLeft: 8 }}>
                      Due: {formatDate(task.dueDate)}
                    </Text>
                  </View>

                  {/* Subtasks */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={{ color: '#7CF5FF', fontSize: 16, marginBottom: 8 }}>
                        Subtasks:
                      </Text>
                      {task.subtasks.map((subtask, index) => (
                        <View 
                          key={index}
                          style={{
                            backgroundColor: '#222',
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 6,
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}
                        >
                          <TouchableOpacity 
                            onPress={() => handleSubtaskComplete(subtask)}
                            disabled={subtask.completed || isCompleting}
                            style={{
                              marginRight: 8,
                            }}
                          >
                            <Icon 
                              name={subtask.completed ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                              size={20} 
                              color="#7CF5FF" 
                            />
                          </TouchableOpacity>
                          <Text style={{
                            color: '#bbb',
                            marginLeft: 8,
                            textDecorationLine: subtask.completed ? 'line-through' : 'none',
                            opacity: subtask.completed ? 0.7 : 1
                          }}>
                            {subtask.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Created By */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginTop: 10,
                    backgroundColor: '#222',
                    padding: 8,
                    borderRadius: 8
                  }}>
                    <Icon name="group" size={20} color="#7CF5FF" />
                    <Text style={{ color: '#bbb', marginLeft: 8 }}>
                      Group : {task.group}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#000',
  },
  groupIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 245, 255, 0.1)',
    padding: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  groupName: {
    color: '#7CF5FF',
    fontSize: 12,
    marginLeft: 4,
  }
});

export default TaskCard;