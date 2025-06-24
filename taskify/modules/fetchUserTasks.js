import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchuserTasks = async () => {
    try {
        const token = await AsyncStorage.getItem('@access_token');
        
        const response = await fetch('http://192.168.1.3:5000/api/tasks', {
            method : 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (response.ok) {
            return data;
        }else {
            throw new Error(data.message || "Failed to fetch tasks");
        }
    }
    catch (error){
        console.error("Error fetching tasks:", error);
        throw error; // Re-throw the error for further handling if needed
        return [];
    }
};