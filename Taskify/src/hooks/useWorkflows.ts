import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { workflowsApi, Workflow } from '../api/workflows';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function useWorkflows(type?: 'PERSONAL' | 'GROUP', owner_id?: string) {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const fetchWorkflows = useCallback(async () => {
        if (!currentUserId) return;
        try {
            const response = await workflowsApi.getAll({ type, owner_id });
            setWorkflows(response.data);
        } catch (error) {
            console.error('Failed to fetch workflows', error);
        }
    }, [currentUserId, type, owner_id]);

    useFocusEffect(
        useCallback(() => {
            let mounted = true;
            const load = async () => {
                if (workflows.length === 0) setIsLoading(true);
                await fetchWorkflows();
                if (mounted) setIsLoading(false);
            };
            load();
            return () => { mounted = false; };
        }, [fetchWorkflows])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWorkflows();
        setRefreshing(false);
    };

    const createWorkflow = async (data: Partial<Workflow>) => {
        try {
            const response = await workflowsApi.create(data);
            setWorkflows((prev) => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Failed to create workflow', error);
            throw error;
        }
    };

    const deleteWorkflow = async (id: string) => {
        try {
            await workflowsApi.delete(id);
            setWorkflows((prev) => prev.filter(w => w._id !== id));
        } catch (error) {
            console.error('Failed to delete workflow', error);
            throw error;
        }
    };

    return {
        workflows,
        isLoading,
        refreshing,
        handleRefresh,
        createWorkflow,
        deleteWorkflow,
        fetchWorkflows,
    };
}
