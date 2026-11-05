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
    header: {
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
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    typeSelectorRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    typeBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        marginTop: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 52,
        marginBottom: 8,
    },
    currencyPrefix: {
        fontSize: 22,
        fontWeight: '700',
        marginRight: 6,
    },
    amountInput: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
    },
    textInputWrapper: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 44,
        justifyContent: 'center',
        marginBottom: 8,
    },
    textInput: {
        fontSize: 14,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 11,
        fontWeight: '600',
    },
    subChip: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
    },
    subChipText: {
        fontSize: 11,
        fontWeight: '500',
    },
    submitBtn: {
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    submitBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});