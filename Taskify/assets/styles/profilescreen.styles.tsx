import { StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: COLORS.white,
        ...SHADOWS.md,
        marginBottom: SPACING.md,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    profileEmail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
        marginLeft: 4,
    },
    accountList: {
        backgroundColor: COLORS.white,
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
        backgroundColor: '#F8FAFC',
    },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    activeMiniAvatar: {
        backgroundColor: COLORS.primary,
    },
    accountName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    activeAccountName: {
        color: COLORS.primary,
    },
    addAccountBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        marginTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    addAccountText: {
        marginLeft: SPACING.sm,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
    menuCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
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
        color: COLORS.text,
    },
    menuSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    logoutBtn: {
        marginTop: 'auto',
        marginBottom: SPACING.md,
    },
});