import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  FolderPlus,
  PlusCircle,
  Upload,
  X,
} from 'lucide-react-native';
import { useAppTheme } from '@/hooks/use-theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreateGroup: () => void;
  onAddTransaction: () => void;
  onUploadStatement: () => void;
}

export const CreateMenuSheet: React.FC<Props> = ({
  visible,
  onClose,
  onCreateGroup,
  onAddTransaction,
  onUploadStatement,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Create & Import</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Action Options */}
              <View style={styles.actionsList}>
                {/* 1. Create Category Group */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                  ]}
                  onPress={() => {
                    onClose();
                    onCreateGroup();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                    <FolderPlus size={22} color={colors.primary} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      Create Category Group
                    </Text>
                    <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                      Define custom groups, sub-groups, and auto-map merchants
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Add Transaction */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                  ]}
                  onPress={() => {
                    onClose();
                    onAddTransaction();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#2ECC7120' }]}>
                    <PlusCircle size={22} color="#2ECC71" />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      Quick Add Transaction
                    </Text>
                    <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                      Record single payment or income manually
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Upload Statement */}
                <TouchableOpacity
                  style={[
                    styles.actionItem,
                    { backgroundColor: isDark ? '#171C22' : '#F8FAFC', borderColor: colors.border },
                  ]}
                  onPress={() => {
                    onClose();
                    onUploadStatement();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: '#FF7A0020' }]}>
                    <Upload size={22} color="#FF7A00" />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      Upload Statement PDF
                    </Text>
                    <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                      Import GPay statement with duplicate protection
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
