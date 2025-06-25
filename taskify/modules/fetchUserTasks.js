import AsyncStorage from "@react-native-async-storage/async-storage";
import { stringify } from "uuid";

export const fetchuserTasks = async () => {
    try {
        const token = await AsyncStorage.getItem('@access_token');

        // Fetch tasks
        const tasksResponse = await fetch('http://192.168.1.4:5000/api/tasks', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const tasks = await tasksResponse.json();
        if (!tasksResponse.ok) {throw new Error(tasks.message || "Failed to fetch tasks");}

        // Fetch groups
        const groupsResponse = await fetch('http://192.168.1.4:5000/api/groups/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const groups = await groupsResponse.json();
        if (!groupsResponse.ok) throw new Error(groups.message || "Failed to fetch groups");

        // Extract all tasks (personal + group tasks)
        const allTasks = [
            ...tasks,
            ...groups.flatMap(group => group.tasks || [])
        ];

        // Categorize tasks by due date
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const categorizedTasks = {
            overdue: [],
            today: [],
            upcoming: [],
        };

        allTasks.forEach(task => {
            if (!task.dueDate) return;

            const dueDate = new Date(task.dueDate);

            if (dueDate < today) {
                categorizedTasks.overdue.push(task);
            } else if (dueDate.toDateString() === now.toDateString()) {
                categorizedTasks.today.push(task);
            } else {
                categorizedTasks.upcoming.push(task);
            }
        });

        // Sort tasks within each category by due date (ascending)
        Object.keys(categorizedTasks).forEach(key => {
            categorizedTasks[key].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        });

        console.log(categorizedTasks)
        return categorizedTasks;

    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};