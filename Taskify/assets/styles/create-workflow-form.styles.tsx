import { StyleSheet } from "react-native";
import { RADIUS, SPACING } from "@/src/constants/theme";

export const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        margin: SPACING.md,
    },
    titleInput: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    descriptionInput: {
        fontSize: 16,
        minHeight: 60,
        textAlignVertical: 'top',
        marginBottom: SPACING.md,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.lg,
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