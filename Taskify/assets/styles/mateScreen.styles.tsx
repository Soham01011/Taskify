import { RADIUS, SHADOWS, SPACING } from '@/src/constants/theme';
import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    modelSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.round,
        gap: 6,
        maxWidth: width * 0.4,
    },
    modelName: {
        fontSize: 12,
        fontWeight: '600',
    },
    dropdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
        justifyContent: 'flex-end',
    },
    dropdownMenu: {
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        paddingBottom: 40,
        maxHeight: '70%',
        ...SHADOWS.md,
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f010',
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionContainer: {
        paddingTop: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptySection: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        fontSize: 14,
        fontStyle: 'italic',
    },
    modelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    modelItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    modelItemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 8,
    },
    messagesContainer: {
        padding: SPACING.lg,
        paddingTop: 100,
        paddingBottom: SPACING.xl,
    },
    introContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
        paddingHorizontal: SPACING.xl,
    },
    welcomeIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: SPACING.sm,
    },
    welcomeSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    setupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: 14,
        borderRadius: RADIUS.xl,
        gap: SPACING.md,
        ...SHADOWS.md,
    },
    setupBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    messageWrapper: {
        marginBottom: SPACING.lg,
        maxWidth: '85%',
    },
    userMessageWrapper: {
        alignSelf: 'flex-end',
    },
    aiMessageWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        gap: SPACING.md,
    },
    input: {
        flex: 1,
        borderRadius: RADIUS.xl,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 12,
        maxHeight: 120,
        fontSize: 16,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    progressOverlay: {
        position: 'absolute',
        top: 200,
        left: SPACING.xl,
        right: SPACING.xl,
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        ...SHADOWS.md,
        zIndex: 500,
    },
    progressText: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: SPACING.lg,
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        marginTop: SPACING.md,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    progressSubtext: {
        fontSize: 12,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
    statusIndicator: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    }
});