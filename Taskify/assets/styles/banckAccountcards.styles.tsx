import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    countText: {
        fontSize: 11,
        fontWeight: '600',
    },
    list: {
        gap: 8,
    },
    accountRow: {
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    accNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    accountName: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    accountAmount: {
        fontSize: 14,
        fontWeight: '700',
    },
    bottomInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    txCount: {
        fontSize: 11,
    },
    percentageText: {
        fontSize: 11,
        fontWeight: '600',
    },
    progressTrack: {
        height: 5,
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
    },
});