import { StyleSheet } from 'react-native';
import { SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';

export const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.white,
        ...SHADOWS.md,
        marginBottom: SPACING.md,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
        marginLeft: 4,
    },
    accountList: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.xl,
        padding: SPACING.sm,
        ...SHADOWS.sm,
    },
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
    },
    activeAccountItem: {
        backgroundColor: colors.background,
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activeMiniAvatar: {
        backgroundColor: colors.primary,
    },
    accountName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    activeAccountName: {
        color: colors.primary,
    },
    addAccountBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        marginTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    addAccountText: {
        marginLeft: SPACING.sm,
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    menuCard: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    logoutBtn: {
        marginTop: 'auto',
        marginBottom: SPACING.md,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
    },
    modalCard: {
        backgroundColor: colors.card,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        ...SHADOWS.md,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.danger10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    logoutModalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
        marginBottom: SPACING.sm,
    },
    logoutModalDesc: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    modalFooter: {
        flexDirection: 'row',
        width: '100%',
        gap: SPACING.md,
    },
    modalButton: {
        flex: 1,
    }
});