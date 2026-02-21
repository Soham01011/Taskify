import { StyleSheet } from "react-native";
import { SPACING, RADIUS } from "@/src/constants/theme";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
        marginLeft: 4,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    optionsCard: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    optionLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resetText: {
        fontSize: 12,
        fontWeight: '600',
    },
    colorPickerCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        padding: SPACING.md,
        ...StyleSheet.flatten({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
        }),
    },
    pickerStyle: {
        gap: 16,
    },
    pickerMainRow: {
        flexDirection: 'row',
        gap: 16,
    },
    nativePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    panelStyle: {
        flex: 1,
        height: 150,
        borderRadius: RADIUS.lg,
    },
    previewColumn: {
        gap: 12,
        alignItems: 'center',
    },
    previewStyle: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    demoToken: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slidersContainer: {
        gap: 8,
    },
    sliderLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    slider: {
        height: 20,
        borderRadius: 10,
    },
    swatches: {
        justifyContent: 'space-between',
        marginTop: 8,
    },
    colorInfo: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorValueText: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    helpText: {
        fontSize: 12,
        marginTop: SPACING.sm,
        paddingHorizontal: 4,
        lineHeight: 18,
    },
    previewCard: {
        borderRadius: RADIUS.xl,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    previewHeader: {
        padding: SPACING.md,
    },
    previewHeaderText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    previewContent: {
        padding: SPACING.md,
        gap: 12,
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: RADIUS.md,
        gap: 8,
    },
    previewItemText: {
        fontSize: 13,
        fontWeight: '600',
    },
    previewButton: {
        paddingVertical: 10,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    previewButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    }
});