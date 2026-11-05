import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    averageLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 90,
        paddingTop: 10,
        gap: 6,
    },
    barColumn: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    track: {
        width: '100%',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    barFill: {
        width: '75%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 6,
    },
    dayLabel: {
        fontSize: 11,
        marginTop: 6,
    },
});
