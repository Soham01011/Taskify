import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    stepContent: {
        gap: 14,
        paddingVertical: 10,
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    dropZone: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cloudIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    dropTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    dropSub: {
        fontSize: 12,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 11,
        fontWeight: '600',
    },
    sampleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    sampleBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
        fontWeight: '700',
    },
    loadingSub: {
        fontSize: 12,
    },
    lockIconBox: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    passwordTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    passwordSub: {
        fontSize: 13,
        textAlign: 'center',
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#E74C3C15',
    },
    errorText: {
        fontSize: 12,
        color: '#E74C3C',
        fontWeight: '500',
    },
    passwordInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 48,
    },
    passwordInput: {
        flex: 1,
        fontSize: 14,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    btnSecondary: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    btnSecondaryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    btnPrimary: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    previewContainer: {
        gap: 12,
    },
    previewSummaryCard: {
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        gap: 8,
    },
    previewTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    previewPeriod: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    previewBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    previewBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    previewAmountsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 2,
    },
    previewAmtCol: {
        flex: 1,
    },
    previewAmtLabel: {
        fontSize: 10,
    },
    previewAmtVal: {
        fontSize: 16,
        fontWeight: '800',
        marginTop: 1,
    },
    duplicateStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 4,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#88888833',
    },
    duplicateText: {
        fontSize: 11,
    },
    previewHeadingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    previewListHeading: {
        fontSize: 12,
        fontWeight: '700',
    },
    swipeHint: {
        fontSize: 11,
        fontWeight: '600',
    },
    horizontalPreviewList: {
        paddingVertical: 6,
        paddingHorizontal: 2,
        gap: 10,
    },
    previewHorizontalCard: {
        width: 230,
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    indexPill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    indexPillText: {
        fontSize: 10,
        fontWeight: '700',
    },
    typePill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typePillText: {
        fontSize: 9,
        fontWeight: '700',
    },
    skippedPill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#FF7A0020',
    },
    skippedPillText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FF7A00',
    },
    cardAmount: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    cardMerchant: {
        fontSize: 13,
        fontWeight: '700',
    },
    cardFooter: {
        marginTop: 8,
        gap: 4,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 5,
    },
    categoryTagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    cardMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    cardDate: {
        fontSize: 10,
    },
    cardAccount: {
        fontSize: 10,
    },
});