import { RADIUS, SPACING } from "@/src/constants/theme";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.md,
    },
    noteContent: {
        flex: 1,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    noteMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    noteDate: {
        fontSize: 13,
        fontWeight: '500',
    },
    deleteBtn: {
        padding: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabTouch: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactModalContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'flex-end',
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 90,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalContent: {
        padding: 20,
        paddingBottom: 60,
    },
    modalBody: {
        fontSize: 18,
        lineHeight: 28,
    }
});