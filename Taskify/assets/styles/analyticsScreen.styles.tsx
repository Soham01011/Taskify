import { StyleSheet } from "react-native";

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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chartCard: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    chartSubtitle: {
        fontSize: 13,
        marginBottom: 20,
    },
    chartWrapper: {
        marginTop: 10,
    },
    legendRow: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 13,
        fontWeight: '500',
    }
});