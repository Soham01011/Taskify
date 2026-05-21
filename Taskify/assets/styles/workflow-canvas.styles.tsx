import { StyleSheet } from "react-native";
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
import { SPACING, RADIUS } from '@/src/constants/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    canvas: {
        flex: 1,
    },
    nodeContainer: {
        position: 'absolute',
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    nodeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    nodeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    nodeFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    nodeDate: {
        fontSize: 12,
    },
});