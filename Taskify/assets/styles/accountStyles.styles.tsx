import { StyleSheet } from 'react-native';
import { SPACING, RADIUS } from '@/src/constants/theme';

export const getAccountStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modal: {
        backgroundColor: colors.card,
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
        color: colors.text,
    },
    accountList: {
        marginBottom: SPACING.lg,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: colors.background,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    accountAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    accountName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    anotherBtn: {
        marginTop: SPACING.sm,
    }
});
