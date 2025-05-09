import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TaskCard = ({ task, pulseAnim, isOverdue }) => {
  const [expanded, setExpanded] = useState(false);

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

  return (
    <Animated.View style={{ 
      transform: [{ scale: isOverdue ? pulseAnim : 1 }], 
      marginBottom: 20 
    }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(!expanded)}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 16,
            padding: 2,
          }}
        >
          <View style={{ 
            backgroundColor: '#000', 
            borderRadius: 14, 
            padding: 16 
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
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
                        <Icon 
                          name={subtask.completed ? 'checkbox-marked' : 'checkbox-blank-outline'} 
                          size={20} 
                          color="#7CF5FF" 
                        />
                        <Text style={{ color: '#bbb', marginLeft: 8 }}>{subtask.title}</Text>
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
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TaskCard;