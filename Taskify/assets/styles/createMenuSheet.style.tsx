import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        padding: 20,
        paddingBottom: 32,
        gap: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    actionsList: {
        gap: 10,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTextCol: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    actionSub: {
        fontSize: 11,
        marginTop: 2,
        lineHeight: 15,
    },
});
