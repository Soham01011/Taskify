// Fallback for using Lucide Icons on Android and web.

import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { OpaqueColorValue, type StyleProp, type ViewStyle } from 'react-native';
import { Home, Send, Code, ChevronRight, type LucideIcon } from 'lucide-react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], LucideIcon>>;

/**
 * Add your SF Symbols to Lucide Icons mappings here.
 */
const MAPPING: IconMapping = {
  'house.fill': Home,
  'paperplane.fill': Send,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': ChevronRight,
};

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Lucide Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Lucide Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const IconComponent = MAPPING[name] as LucideIcon;
  if (!IconComponent) return null;
  return <IconComponent color={color as string} size={size} style={style} />;
}
