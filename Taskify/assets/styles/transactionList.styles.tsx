import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    activeFilterBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    activeFilterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    activeFilterTitle: {
        fontSize: 12,
    },
    clearFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    clearFilterBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        paddingVertical: 0,
    },
    filterPillsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
    },
    pillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeCategoryPill: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    activeCategoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyBox: {
        padding: 24,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginVertical: 8,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptySub: {
        fontSize: 12,
    },
    clearFilterEmptyBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 6,
    },
    clearFilterEmptyText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    itemsList: {
        gap: 8,
    },
    txCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        marginRight: 8,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsCol: {
        flex: 1,
    },
    merchantName: {
        fontSize: 13,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    dateText: {
        fontSize: 11,
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        maxWidth: '65%',
    },
    tagDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '500',
    },
    accountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
    },
    accountBadgeText: {
        fontSize: 10,
    },
    cardRight: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '800',
    },
    refText: {
        fontSize: 10,
        marginTop: 2,
    },
});