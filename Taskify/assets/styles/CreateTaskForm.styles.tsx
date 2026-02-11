import { StyleSheet, Platform } from "react-native";
import { COLORS, RADIUS, SPACING } from "@/src/constants/theme";
export const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        width: '100%',
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    scrollArea: {
        maxHeight: 400,
    },
    titleInput: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        paddingVertical: SPACING.xs,
        marginBottom: 4,
    },
    descriptionInput: {
        fontSize: 14,
        color: '#666',
        paddingVertical: 4,
        minHeight: 40,
    },
    subtaskContainer: {
        marginVertical: SPACING.xs,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    subtaskText: {
        fontSize: 13,
        color: '#555',
        flex: 1,
    },
    subtaskInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    subtaskInput: {
        flex: 1,
        fontSize: 13,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 2,
    },
    addSubtaskBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        gap: 4,
    },
    addSubtaskText: {
        fontSize: 12,
        color: '#808080',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        gap: SPACING.xs,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'transparent',
    },
    pillText: {
        fontSize: 12,
        marginLeft: 4,
        color: '#505050',
    },
    iconButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginVertical: SPACING.md,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    projectDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    inboxIcon: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        borderColor: '#505050',
        borderRadius: 3,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 2,
    },
    trayIcon: {
        width: 8,
        height: 2,
        backgroundColor: '#505050',
        borderRadius: 1,
    },
    projectText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#505050',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#F5F5F5',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: '#DE8C82',
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    errorText: {
        color: COLORS.danger,
        textAlign: 'center',
        marginTop: SPACING.sm,
        fontSize: 12,
    }
});