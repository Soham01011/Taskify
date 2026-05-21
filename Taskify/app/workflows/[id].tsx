import { useAppTheme } from '@/hooks/use-theme';
import { WorkflowDag, WorkflowNode, workflowsApi } from '@/src/api/workflows';
import { taskApi, Task } from '@/src/api/tasks';
import { ideaApi, Idea } from '@/src/api/ideas';
import { WorkflowCanvas } from '@/src/components/Workflows/WorkflowCanvas';
import { SPACING } from '@/src/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Edit2, Plus, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/assets/styles/workflow-id.styles'

import { CreateEdgeModal } from '@/src/components/Workflows/CreateEdgeModal';
import { CreateNodeModal } from '@/src/components/Workflows/CreateNodeModal';
import { Link } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';

export default function WorkflowDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useAppTheme();
    const [dag, setDag] = useState<WorkflowDag | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingEdge, setIsCreatingEdge] = useState(false);
    const [editingNode, setEditingNode] = useState<WorkflowNode | null>(null);
    const { currentUserId } = useSelector((state: RootState) => state.auth);

    const fetchDag = async () => {
        try {
            const response = await workflowsApi.getDag(id as string);
            let fetchedDag = response.data;

            // Enrichment: backend populate fails for embedded sub-tasks and threads.
            // If any node lacks source_data.title, we manually find it.
            const nodesMissingTitle = fetchedDag.nodes.filter(n => !n.source_data || !n.source_data.title);
            if (nodesMissingTitle.length > 0) {
                const [tasksRes, ideasRes] = await Promise.all([
                    taskApi.getAll().catch(() => ({ data: [] })),
                    ideaApi.getAll().catch(() => ({ data: [] }))
                ]);

                const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : (tasksRes.data as any).tasks || [];
                const ideas = Array.isArray(ideasRes.data) ? ideasRes.data : (ideasRes.data as any).ideas || [];

                fetchedDag.nodes = fetchedDag.nodes.map(node => {
                    if (node.source_data?.title) return node;

                    let foundTitle = 'Unknown Node';
                    if (node.source_type === 'TASK') {
                        tasks.forEach((t: Task) => {
                            if (t._id === node.source_id) foundTitle = t.title;
                            t.subtasks?.forEach((st: any) => {
                                if (st._id === node.source_id || `${t._id}-${st.title}` === node.source_id) {
                                    foundTitle = `↳ ${st.title} (Subtask of ${t.title})`;
                                }
                            });
                        });
                    } else if (node.source_type === 'IDEA') {
                        ideas.forEach((i: Idea) => {
                            if (i._id === node.source_id) foundTitle = i.title;
                            i.thread?.forEach((th: any, idx: number) => {
                                if (th._id === node.source_id || `${i._id}-th-${idx}` === node.source_id) {
                                    foundTitle = `↳ Thread: ${th.content?.substring(0, 20) || '...'}...`;
                                }
                            });
                        });
                    }

                    return {
                        ...node,
                        source_data: { ...node.source_data, title: foundTitle }
                    };
                });
            }

            setDag(fetchedDag);
        } catch (error) {
            console.error("Failed to fetch DAG", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNodeDragEnd = async (nodeId: string, x: number, y: number) => {
        try {
            await workflowsApi.updateNode(id as string, nodeId, { position_x: x, position_y: y });
            // Local state inside WorkflowCanvas handles immediate redraw, so we don't strictly need to force a full re-render here.
        } catch (error) {
            console.error("Failed to update node position", error);
        }
    };

    const handleNodeComplete = async (node: WorkflowNode) => {
        try {
            const newStatus = node.status === 'DONE' ? 'READY' : 'DONE';
            await workflowsApi.updateNodeStatus(id as string, node._id, { status: newStatus, user_id: currentUserId || undefined });
            fetchDag(); // re-fetch to reflect propagated edge unblockings
        } catch (error) {
            console.error("Failed to update node status", error);
        }
    };

    useEffect(() => {
        fetchDag();
    }, [id]);

    if (loading || !dag) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>{dag.workflow.name}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.primary + '20' }]}>
                        <Edit2 size={16} color={colors.primary} />
                        <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Settings size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Canvas Area */}
            <View style={styles.canvasContainer}>
                <WorkflowCanvas
                    nodes={dag.nodes}
                    edges={dag.edges}
                    colors={colors}
                    onNodePress={(node) => setEditingNode(node)}
                    onNodeDragEnd={handleNodeDragEnd}
                    onNodeComplete={handleNodeComplete}
                />
            </View>

            {/* Bottom Floating Action Area */}
            <View style={styles.bottomBar} pointerEvents="box-none">
                <View style={styles.bottomLeft}>
                    {/* Could add mini-map or context tools here */}
                </View>

                <View style={styles.bottomRight}>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.card, width: 48, height: 48, borderRadius: 24, marginBottom: 8 }]} onPress={() => setIsCreatingEdge(true)}>
                        <Link size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => setIsCreating(true)}>
                        <Plus size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {isCreatingEdge && (
                <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'flex-end', zIndex: 100 }]} pointerEvents="box-none">
                    <CreateEdgeModal
                        workflowId={id as string}
                        nodes={dag.nodes}
                        onSuccess={() => {
                            setIsCreatingEdge(false);
                            fetchDag();
                        }}
                        onCancel={() => setIsCreatingEdge(false)}
                    />
                </View>
            )}

            {(isCreating || editingNode) && (
                <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'flex-end', zIndex: 100 }]} pointerEvents="box-none">
                    <CreateNodeModal
                        workflowId={id as string}
                        initialNode={editingNode}
                        onSuccess={() => {
                            setIsCreating(false);
                            setEditingNode(null);
                            fetchDag();
                        }}
                        onCancel={() => {
                            setIsCreating(false);
                            setEditingNode(null);
                        }}
                    />
                </View>
            )}

            {(isCreating || isCreatingEdge || editingNode) && (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 98 }]}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => { setIsCreating(false); setIsCreatingEdge(false); setEditingNode(null); }} activeOpacity={1} />
                </View>
            )}
        </SafeAreaView>
    );
}


