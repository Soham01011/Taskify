import { useMemo, useCallback, useRef, useEffect, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';
import { fetchTasks, updateTask, selectUnifiedTasks } from '@/src/store/slices/taskSlice';
import { taskApi, FetchTasksParams } from '@/src/api/tasks';
import { Group } from '@/src/api/groups';

export type TaskFilter = 'active' | 'due' | 'upcoming' | 'completed';
export type SortOrder = 'asc' | 'desc';

interface DashboardState {
    refreshing: boolean;
    isCreating: boolean;
    filter: TaskFilter;
    sortOrder: SortOrder;
    lastParams: FetchTasksParams;
}

type DashboardAction =
    | { type: 'SET_REFRESHING'; payload: boolean }
    | { type: 'SET_IS_CREATING'; payload: boolean }
    | { type: 'SET_FILTER'; payload: TaskFilter }
    | { type: 'SET_SORT_ORDER'; payload: SortOrder }
    | { type: 'SET_LAST_PARAMS'; payload: FetchTasksParams };

const initialState: DashboardState = {
    refreshing: false,
    isCreating: false,
    filter: 'active',
    sortOrder: 'asc',
    lastParams: { pageNumber: 1, pageSize: 15 },
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
    switch (action.type) {
        case 'SET_REFRESHING': return { ...state, refreshing: action.payload };
        case 'SET_IS_CREATING': return { ...state, isCreating: action.payload };
        case 'SET_FILTER': return { ...state, filter: action.payload };
        case 'SET_SORT_ORDER': return { ...state, sortOrder: action.payload };
        case 'SET_LAST_PARAMS': return { ...state, lastParams: action.payload };
        default: return state;
    }
}

export function useTasks() {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading, pagination } = useSelector((state: RootState) => state.tasks);
    const tasks = useSelector(selectUnifiedTasks);
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const groups = useSelector((state: RootState) => state.groups.groups);
    const ideas = useSelector((state: RootState) => state.ideas.ideas);

    const [state, dashboardDispatch] = useReducer(dashboardReducer, initialState);
    const { refreshing, isCreating, filter, sortOrder, lastParams } = state;
    const hasAttemptedInitialSync = useRef(false);

    const pendingGroupTasks = useMemo(() => {
        return groups.flatMap((group: Group) =>
            (group.tasks || [])
                .filter((t: any) => t.userId === currentUserId && !t.completed)
                .map((t: any) => ({ ...t, groupName: group.name }))
        );
    }, [groups, currentUserId]);

    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];
        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        if (filter === 'active') {
            result = result.filter(t => !t.completed);
        } else if (filter === 'due') {
            result = result.filter(t => !t.completed && new Date(t.dueDate) <= endOfToday);
        } else if (filter === 'upcoming') {
            result = result.filter(t => !t.completed && new Date(t.dueDate) > endOfToday);
        } else if (filter === 'completed') {
            result = result.filter(t => t.completed);
        }

        result.sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        return result;
    }, [tasks, filter, sortOrder]);

    const loadTasks = useCallback((params: FetchTasksParams = { pageNumber: 1, pageSize: 15 }) => {
        if (currentUserId) {
            dashboardDispatch({ type: 'SET_LAST_PARAMS', payload: params });
            dispatch(fetchTasks(params));
        }
    }, [currentUserId, dispatch]);

    const loadMoreTasks = () => {
        if (!isLoading && pagination && pagination.currentPage < pagination.totalPages) {
            loadTasks({
                ...lastParams,
                pageNumber: pagination.currentPage + 1,
            });
        }
    };

    const getLatestTimestamp = useCallback(() => {
        if (tasks.length === 0) return null;
        return tasks.reduce((latest, task) => {
            if (!task.created_at) return latest;
            const taskTime = new Date(task.created_at).getTime();
            const latestTime = new Date(latest).getTime();
            return taskTime > latestTime ? task.created_at : latest;
        }, tasks[0].created_at);
    }, [tasks]);

    useEffect(() => {
        if (currentUserId && !hasAttemptedInitialSync.current) {
            hasAttemptedInitialSync.current = true;
            const latest = getLatestTimestamp();
            if (latest) {
                loadTasks({ created_at: latest, pageNumber: 1, pageSize: 15 });
            } else {
                loadTasks({ pageNumber: 1, pageSize: 15 });
            }
        }
    }, [currentUserId, loadTasks, getLatestTimestamp]);

    const onRefresh = async () => {
        dashboardDispatch({ type: 'SET_REFRESHING', payload: true });
        const latest = getLatestTimestamp();
        try {
            if (latest) {
                await dispatch(fetchTasks({ created_at: latest, pageNumber: 1, pageSize: 15 })).unwrap();
            } else {
                await dispatch(fetchTasks({ pageNumber: 1, pageSize: 15 })).unwrap();
            }
        } catch (err) {
            console.error('Refresh failed', err);
            loadTasks({ pageNumber: 1, pageSize: 15 });
        } finally {
            dashboardDispatch({ type: 'SET_REFRESHING', payload: false });
        }
    };

    const handleComplete = useCallback(async (id: string) => {
        try {
            const response = await taskApi.complete(id);
            dispatch(updateTask(response.data));
        } catch (err) {
            console.error('Failed to complete task', err);
        }
    }, [dispatch]);

    return {
        tasks: filteredAndSortedTasks,
        isLoading,
        refreshing,
        isCreating,
        filter,
        sortOrder,
        pendingGroupTasks,
        ideas,
        groups,
        setIsCreating: (val: boolean) => dashboardDispatch({ type: 'SET_IS_CREATING', payload: val }),
        setFilter: (val: TaskFilter) => dashboardDispatch({ type: 'SET_FILTER', payload: val }),
        toggleSort: () => dashboardDispatch({ type: 'SET_SORT_ORDER', payload: sortOrder === 'asc' ? 'desc' : 'asc' }),
        loadTasks,
        loadMoreTasks,
        onRefresh,
        handleComplete,
    };
}
