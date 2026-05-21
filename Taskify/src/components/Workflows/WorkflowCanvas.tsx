import { WorkflowEdge, WorkflowNode } from '@/src/api/workflows';
import { styles } from "@/assets/styles/workflow-canvas.styles"
import { Clock, Lightbulb, Square, CheckSquare } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface WorkflowCanvasProps {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    colors: any;
    onNodePress?: (node: WorkflowNode) => void;
    onNodeDragEnd?: (nodeId: string, x: number, y: number) => Promise<void>;
    onNodeComplete?: (node: WorkflowNode) => void;
}
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

const NodeWrapper = ({ node, colors, scale, onNodePress, onNodeDragEnd, handleNodeDragUpdate, onNodeComplete }: any) => {
    const isIdea = node.source_type === 'IDEA';
    const title = node.source_data?.title || 'Unknown Node';
    const dateStr = node.due_date ? new Date(node.due_date).toLocaleDateString() : 'No date';
    
    // Node's localized drag state
    const nodeX = useSharedValue(node.position_x);
    const nodeY = useSharedValue(node.position_y);
    const nodeSavedX = useSharedValue(node.position_x);
    const nodeSavedY = useSharedValue(node.position_y);

    // Sync if backend coords change externally
    useEffect(() => {
        nodeX.value = node.position_x;
        nodeY.value = node.position_y;
        nodeSavedX.value = node.position_x;
        nodeSavedY.value = node.position_y;
    }, [node.position_x, node.position_y]);

    const nodeDragGesture = Gesture.Pan()
        .onStart(() => {
            nodeSavedX.value = nodeX.value;
            nodeSavedY.value = nodeY.value;
        })
        .onUpdate((event) => {
            nodeX.value = nodeSavedX.value + (event.translationX / scale.value);
            nodeY.value = nodeSavedY.value + (event.translationY / scale.value);
            runOnJS(handleNodeDragUpdate)(node._id, nodeX.value, nodeY.value);
        })
        .onEnd(() => {
            nodeSavedX.value = nodeX.value;
            nodeSavedY.value = nodeY.value;
            if (onNodeDragEnd) {
                runOnJS(onNodeDragEnd)(node._id, nodeX.value, nodeY.value);
            }
        });

    const nodeAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: nodeX.value },
                { translateY: nodeY.value }
            ]
        };
    });

    return (
        <GestureDetector gesture={nodeDragGesture}>
            <Animated.View
                style={[
                    styles.nodeContainer,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                    },
                    nodeAnimatedStyle
                ]}
            >
                <TouchableOpacity
                    onPress={() => onNodePress && onNodePress(node)}
                    activeOpacity={0.8}
                    style={{ flex: 1 }}
                >
                    <View style={styles.nodeHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TouchableOpacity
                                onPress={(e) => {
                                    onNodeComplete && onNodeComplete(node);
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {node.status === 'DONE' ? (
                                    <CheckSquare size={16} color={colors.primary} />
                                ) : (
                                    <Square size={16} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                            {isIdea ? (
                                <Lightbulb size={16} color="#F59E0B" />
                            ) : null}
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: colors.border }]}>
                            <Text style={[styles.typeText, { color: colors.textSecondary }]}>
                                {node.source_type}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.nodeTitle, { color: colors.text }]} numberOfLines={1}>
                        {title}
                    </Text>

                    <View style={styles.nodeFooter}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={[styles.nodeDate, { color: colors.textSecondary }]}>
                            {dateStr}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodes, edges, colors, onNodePress, onNodeDragEnd, onNodeComplete }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Track active dragging positions for real-time edge updates
    const [livePositions, setLivePositions] = useState<Record<string, {x: number, y: number}>>({});

    // Sync when props change
    useEffect(() => {
        const initialPositions: Record<string, {x: number, y: number}> = {};
        nodes.forEach(n => {
            initialPositions[n._id] = { x: n.position_x, y: n.position_y };
        });
        setLivePositions(initialPositions);
    }, [nodes]);

    const handleNodeDragUpdate = (nodeId: string, x: number, y: number) => {
        setLivePositions(prev => ({ ...prev, [nodeId]: { x, y } }));
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = savedTranslateX.value + event.translationX;
            translateY.value = savedTranslateY.value + event.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <GestureDetector gesture={combinedGesture}>
            <View style={styles.container}>
                <Animated.View style={[styles.canvas, animatedStyle]}>
                    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                        {edges.map((edge) => {
                            const fromNode = nodes.find((n) => n._id === edge.from_node_id);
                            const toNode = nodes.find((n) => n._id === edge.to_node_id);

                            if (!fromNode || !toNode) return null;

                            const p1 = livePositions[fromNode._id] || { x: fromNode.position_x, y: fromNode.position_y };
                            const p2 = livePositions[toNode._id] || { x: toNode.position_x, y: toNode.position_y };

                            // Calculate center points for edges
                            const x1 = p1.x + NODE_WIDTH / 2;
                            const y1 = p1.y + NODE_HEIGHT; // Bottom of parent
                            const x2 = p2.x + NODE_WIDTH / 2;
                            const y2 = p2.y; // Top of child
                            
                            // Bezier curve for premium flowing look
                            const path = `M ${x1} ${y1} C ${x1} ${y1 + 50}, ${x2} ${y2 - 50}, ${x2} ${y2}`;

                            return (
                                <Path
                                    key={edge._id}
                                    d={path}
                                    stroke={colors.primary}
                                    strokeWidth="2"
                                    strokeDasharray="5, 5"
                                    fill="none"
                                />
                            );
                        })}
                    </Svg>
                    {nodes.map((node) => (
                        <NodeWrapper 
                            key={node._id} 
                            node={node} 
                            colors={colors} 
                            scale={scale} 
                            onNodePress={onNodePress} 
                            onNodeDragEnd={onNodeDragEnd} 
                            handleNodeDragUpdate={handleNodeDragUpdate} 
                            onNodeComplete={onNodeComplete}
                        />
                    ))}
                </Animated.View>
            </View>
        </GestureDetector>
    );
};

