import { useCallback, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';
import { fetchGroups } from '@/src/store/slices/groupSlice';

export function useGroups() {
    const dispatch = useDispatch<AppDispatch>();
    const { groups, isLoading } = useSelector((state: RootState) => state.groups);
    const { currentUserId } = useSelector((state: RootState) => state.auth);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const hasAttemptedInitialSync = useRef(false);

    const getLatestTimestamp = useCallback(() => {
        if (groups.length === 0) return null;
        return groups.reduce((latest, group) => {
            if (!group.created_at) return latest;
            const groupTime = new Date(group.created_at).getTime();
            const latestTime = new Date(latest).getTime();
            return groupTime > latestTime ? group.created_at : latest;
        }, groups[0].created_at || '');
    }, [groups]);

    const loadGroups = useCallback(async (created_at?: string) => {
        if (currentUserId) {
            return dispatch(fetchGroups({ userId: currentUserId, created_at })).unwrap();
        }
    }, [currentUserId, dispatch]);

    useEffect(() => {
        if (currentUserId && !hasAttemptedInitialSync.current) {
            hasAttemptedInitialSync.current = true;
            const latest = getLatestTimestamp();
            if (latest) {
                setSyncing(true);
                loadGroups(latest ?? undefined).finally(() => setSyncing(false));
            } else {
                loadGroups();
            }
        }
    }, [currentUserId, loadGroups, getLatestTimestamp]);

    const onRefresh = async () => {
        setRefreshing(true);
        const latest = getLatestTimestamp();
        try {
            await loadGroups(latest ?? undefined);
        } catch (err) {
            console.error('Refresh failed', err);
            await loadGroups();
        } finally {
            setRefreshing(false);
        }
    };

    return {
        groups,
        isLoading,
        refreshing,
        syncing,
        onRefresh,
        loadGroups,
    };
}
