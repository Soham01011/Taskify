import { RADIUS, SPACING } from "@/src/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    headerContainer: {
        marginBottom: SPACING.md,
    },
    sectionContainer: {
        marginBottom: SPACING.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    quickTask: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        marginBottom: SPACING.sm,
        overflow: 'hidden',
    },
    quickTaskBar: {
        width: 4,
        alignSelf: 'stretch',
    },
    quickTaskContent: {
        flex: 1,
        padding: SPACING.md,
    },
    quickTaskTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    quickTaskMeta: {
        fontSize: 12,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    progressBarBg: {
        width: 40,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    }
});