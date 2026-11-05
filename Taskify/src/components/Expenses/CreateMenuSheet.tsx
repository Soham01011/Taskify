import { styles } from '@/assets/styles/createMenuSheet.style';
import { useAppTheme } from '@/hooks/use-theme';
import {
  FolderPlus,
  PlusCircle,
  Upload,
  X,
} from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

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

