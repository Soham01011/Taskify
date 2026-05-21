import { StyleSheet } from "react-native";
import { SPACING, RADIUS } from "@/src/constants/theme";

export const styles = StyleSheet.create({
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
    typeSelector: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    typeBtn: {
        flex: 1,
        padding: SPACING.sm,
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    formGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 14,
        marginBottom: SPACING.xs,
    },
    input: {
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
    },
    itemBtn: {
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        marginBottom: SPACING.xs,
    },
    dateBtn: {
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: SPACING.lg,
        marginTop: SPACING.md,
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