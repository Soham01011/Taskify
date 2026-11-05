import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: 310,
        position: 'relative',
    },
    card: {
        width: '100%',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        backfaceVisibility: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    cardBack: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pillBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    pillBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    txCountText: {
        fontSize: 12,
        fontWeight: '500',
    },
    flipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    flipButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    confidenceText: {
        fontSize: 11,
        fontWeight: '600',
    },
    totalBlock: {
        marginBottom: 12,
    },
    labelSmall: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        flexWrap: 'wrap',
    },
    largeAmount: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        color: '#2ECC71',
        fontSize: 11,
        fontWeight: '600',
    },
    subNote: {
        fontSize: 12,
        marginTop: 2,
    },
    splitGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    splitCard: {
        flex: 1,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    splitLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    splitValue: {
        fontSize: 17,
        fontWeight: '700',
        marginVertical: 2,
    },
    splitSub: {
        fontSize: 10,
    },
    topOutflowsBlock: {
        marginTop: 2,
    },
    sectionMicroTitle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    microListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
        marginBottom: 5,
    },
    microLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    microIconBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    microMerchant: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    microAmount: {
        fontSize: 13,
        fontWeight: '700',
    },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10,
    },
    noteTitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    noteText: {
        fontSize: 11,
        marginTop: 2,
        lineHeight: 15,
    },
    returnHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingVertical: 4,
    },
    returnHintText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
