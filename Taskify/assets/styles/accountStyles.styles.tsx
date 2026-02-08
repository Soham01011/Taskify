import { StyleSheet } from 'react-native';
import { SPACING, COLORS, RADIUS } from '@/src/constants/theme';
export const accountStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modal: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    accountList: {
        marginBottom: SPACING.lg,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: '#F8FAFC',
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    accountAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    accountName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    anotherBtn: {
        marginTop: SPACING.sm,
    }
});
