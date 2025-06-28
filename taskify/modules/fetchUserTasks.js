import AsyncStorage from "@react-native-async-storage/async-storage";
import { stringify } from "uuid";

export const fetchuserTasks = async () => {
    try {
        const token = await AsyncStorage.getItem('@access_token');

        // Fetch tasks
        const tasksResponse = await fetch('http://192.168.1.2:5000/api/tasks', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const tasks = await tasksResponse.json();
        if (!tasksResponse.ok) {throw new Error(tasks.message || "Failed to fetch tasks");}

        return tasks;

    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};