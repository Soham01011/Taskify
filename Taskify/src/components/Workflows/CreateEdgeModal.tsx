import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useAppTheme } from '@/hooks/use-theme';
import { GenieAnimation } from '@/src/components/GenieAnimation';
import { SPACING, RADIUS } from '@/src/constants/theme';
import { workflowsApi, WorkflowNode } from '@/src/api/workflows';

export const CreateEdgeModal = ({
    workflowId,
    nodes,
    onSuccess,
    onCancel
}: {
    workflowId: string;
    nodes: WorkflowNode[];
    onSuccess: () => void;
    onCancel: () => void;
}) => {
    const { colors } = useAppTheme();
    const [fromNodeId, setFromNodeId] = useState<string | null>(null);
    const [toNodeId, setToNodeId] = useState<string | null>(null);
    const [edgeType, setEdgeType] = useState<'BLOCKS' | 'RELATED' | 'SOFT_BLOCK'>('BLOCKS');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!fromNodeId || !toNodeId || fromNodeId === toNodeId) return;
        setLoading(true);
        try {
            await workflowsApi.createEdge(workflowId, {
                from_node_id: fromNodeId,
                to_node_id: toNodeId,
                edge_type: edgeType,
            });
            onSuccess();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GenieAnimation>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Connect Nodes</Text>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>From Node</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nodeList}>
                        {nodes.map(node => (
                            <TouchableOpacity
                                key={node._id}
                                style={[
                                    styles.nodeBtn,
                                    { borderColor: colors.border },
                                    fromNodeId === node._id && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                                ]}
                                onPress={() => setFromNodeId(node._id)}
                            >
                                <Text style={[{ color: colors.text }, fromNodeId === node._id && { color: colors.primary }]}>
                                    {node.source_data?.title || 'Unknown Node'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>To Node</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nodeList}>
                        {nodes.map(node => (
                            <TouchableOpacity
                                key={node._id}
                                style={[
                                    styles.nodeBtn,
                                    { borderColor: colors.border },
                                    toNodeId === node._id && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                                ]}
                                onPress={() => setToNodeId(node._id)}
                            >
                                <Text style={[{ color: colors.text }, toNodeId === node._id && { color: colors.primary }]}>
                                    {node.source_data?.title || 'Unknown Node'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Edge Type</Text>
                    <View style={styles.typeSelector}>
                        {(['BLOCKS', 'RELATED', 'SOFT_BLOCK'] as const).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeBtn,
                                    { borderColor: colors.border },
                                    edgeType === type && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                                ]}
                                onPress={() => setEdgeType(type)}
                            >
                                <Text style={[{ color: colors.text, fontSize: 12 }, edgeType === type && { color: colors.primary, fontWeight: '700' }]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                        <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.addBtn,
                            { backgroundColor: colors.primary },
                            (!fromNodeId || !toNodeId || fromNodeId === toNodeId || loading) && { opacity: 0.5 }
                        ]}
                        onPress={handleCreate}
                        disabled={!fromNodeId || !toNodeId || fromNodeId === toNodeId || loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Connect</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </GenieAnimation>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        margin: SPACING.md,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 14,
        marginBottom: SPACING.sm,
    },
    nodeList: {
        flexDirection: 'row',
    },
    nodeBtn: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginRight: SPACING.sm,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    typeBtn: {
        flex: 1,
        padding: SPACING.sm,
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    cancelBtn: {
        paddingVertical: SPACING.sm,
    },
    addBtn: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.lg,
    },
});
