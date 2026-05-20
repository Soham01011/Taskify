import client from './client';

export interface Workflow {
    _id: string;
    name: string;
    description?: string;
    type: 'PERSONAL' | 'GROUP';
    owner_id: string;
    created_by: string;
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface WorkflowNode {
    _id: string;
    workflow_id: string;
    source_type: 'TASK' | 'IDEA';
    source_id: string;
    node_type: 'ACTION' | 'MILESTONE' | 'DECISION';
    status: 'LOCKED' | 'READY' | 'IN_PROGRESS' | 'DONE' | 'SKIPPED';
    assigned_to?: string[];
    completion_rule: 'ALL' | 'ANY';
    due_date?: string;
    position_x: number;
    position_y: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    completed_by?: Record<string, string | null>;
    source_data?: any; // Hydrated task/idea data
}

export interface WorkflowEdge {
    _id: string;
    workflow_id: string;
    from_node_id: string;
    to_node_id: string;
    edge_type: 'BLOCKS' | 'RELATED' | 'SOFT_BLOCK';
    created_at: string;
}

export interface WorkflowDag {
    workflow: Workflow;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export const workflowsApi = {
    // Workflow CRUD
    getAll: (params?: { type?: 'PERSONAL' | 'GROUP'; owner_id?: string }) =>
        client.get<Workflow[]>('/workflows', { params }),

    getById: (id: string) =>
        client.get<Workflow>(`/workflows/${id}`),

    create: (data: Partial<Workflow>) =>
        client.post<Workflow>('/workflows', data),

    update: (id: string, data: Partial<Workflow>) =>
        client.patch<Workflow>(`/workflows/${id}`, data),

    delete: (id: string) =>
        client.delete(`/workflows/${id}`),

    // Node CRUD
    getNodes: (workflowId: string) =>
        client.get<WorkflowNode[]>(`/workflows/${workflowId}/nodes`),

    getNodeById: (workflowId: string, nodeId: string) =>
        client.get<WorkflowNode>(`/workflows/${workflowId}/nodes/${nodeId}`),

    createNode: (workflowId: string, data: any) =>
        client.post<WorkflowNode>(`/workflows/${workflowId}/nodes`, data),

    updateNode: (workflowId: string, nodeId: string, data: Partial<WorkflowNode>) =>
        client.patch<WorkflowNode>(`/workflows/${workflowId}/nodes/${nodeId}`, data),

    deleteNode: (workflowId: string, nodeId: string) =>
        client.delete(`/workflows/${workflowId}/nodes/${nodeId}`),

    // Edge CRUD
    getEdges: (workflowId: string) =>
        client.get<WorkflowEdge[]>(`/workflows/${workflowId}/edges`),

    createEdge: (workflowId: string, data: { from_node_id: string; to_node_id: string; edge_type: 'BLOCKS' | 'RELATED' | 'SOFT_BLOCK' }) =>
        client.post<WorkflowEdge>(`/workflows/${workflowId}/edges`, data),

    deleteEdge: (workflowId: string, edgeId: string) =>
        client.delete(`/workflows/${workflowId}/edges/${edgeId}`),

    // Node Status Update
    updateNodeStatus: (workflowId: string, nodeId: string, data: { status: string; user_id?: string }) =>
        client.patch(`/workflows/${workflowId}/nodes/${nodeId}/status`, data),

    // Fetch Full DAG
    getDag: (workflowId: string) =>
        client.get<WorkflowDag>(`/workflows/${workflowId}/dag`),

    // Validation
    validate: (workflowId: string) =>
        client.get(`/workflows/${workflowId}/validate`),
};
