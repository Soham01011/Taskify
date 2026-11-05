import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    kpiRow: {
        flexDirection: 'row',
        gap: 10,
    },
    kpiCard: {
        flex: 1,
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    kpiLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    kpiValue: {
        fontSize: 20,
        fontWeight: '800',
        marginVertical: 3,
    },
    kpiSub: {
        fontSize: 10,
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    sectionSub: {
        fontSize: 11,
        marginTop: 2,
        marginBottom: 12,
    },
    monthList: {
        gap: 8,
    },
    monthRow: {
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    monthHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    monthNameBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthLabelText: {
        fontSize: 13,
        fontWeight: '700',
    },
    monthOutflowText: {
        fontSize: 14,
        fontWeight: '800',
    },
    barTrack: {
        height: 5,
        borderRadius: 999,
        overflow: 'hidden',
        marginVertical: 4,
    },
    barProgress: {
        height: '100%',
        borderRadius: 999,
    },
    monthFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    footerSubText: {
        fontSize: 11,
    },
    footerInflowText: {
        fontSize: 11,
        fontWeight: '600',
    },
    trendList: {
        gap: 8,
    },
    trendCard: {
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    trendTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    trendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    trendCatName: {
        fontSize: 13,
        fontWeight: '600',
    },
    monthlyTrendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    trendMonthItem: {
        flexDirection: 'column',
    },
    trendMonthLabel: {
        fontSize: 10,
    },
    trendMonthAmount: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 1,
    },
});