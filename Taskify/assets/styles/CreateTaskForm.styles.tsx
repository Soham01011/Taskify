import { StyleSheet, Platform } from "react-native";
import { RADIUS, SPACING } from "@/src/constants/theme";

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        padding: SPACING.md,
        width: '100%',
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
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
        color: colors.text,
        paddingVertical: SPACING.xs,
        marginBottom: 4,
    },
    descriptionInput: {
        fontSize: 14,
        color: colors.textSecondary,
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
        color: colors.text,
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
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        color: colors.textSecondary,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        gap: SPACING.xs,
        flexWrap: 'wrap',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'transparent',
        marginBottom: 4,
    },
    pillText: {
        fontSize: 12,
        marginLeft: 4,
        color: colors.text,
    },
    iconButton: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: SPACING.md,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: SPACING.sm,
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
        borderColor: colors.text,
        borderRadius: 3,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 2,
    },
    trayIcon: {
        width: 8,
        height: 2,
        backgroundColor: colors.text,
        borderRadius: 1,
    },
    projectText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: colors.border,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.white,
    },
    errorText: {
        color: colors.danger,
        textAlign: 'center',
        marginTop: SPACING.sm,
        fontSize: 12,
    }
});