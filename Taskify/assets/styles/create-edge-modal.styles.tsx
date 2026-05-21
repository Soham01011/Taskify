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
