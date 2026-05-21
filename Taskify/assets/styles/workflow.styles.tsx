import { StyleSheet } from 'react-native';
import { SPACING } from '@/src/constants/theme';

export const localStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    subHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.lg,
    },
    headerLeft: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.md,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: SPACING.md,
        paddingTop: 0,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarsContainer: {
        flexDirection: 'row',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    templateCard: {
        borderRadius: 16,
        padding: SPACING.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.sm,
    },
    templateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 99,
    },
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});