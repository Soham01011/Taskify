import { CategoryGroup, MerchantRule } from '../types/expense';

// User-driven: No predefined categories by default
export const DEFAULT_CATEGORY_GROUPS: CategoryGroup[] = [];

// User-driven: No predefined merchant rules by default
export const DEFAULT_MERCHANT_RULES: MerchantRule[] = [];

export const PRESET_GROUP_COLORS = [
  '#00A3FF', // Primary Blue
  '#FF7A00', // Orange
  '#2ECC71', // Green
  '#E91E63', // Pink
  '#8E44AD', // Purple
  '#F39C12', // Amber
  '#E74C3C', // Red
  '#00D2D3', // Teal
  '#54A0FF', // Sky Blue
  '#5F27CD', // Indigo
];

export const PRESET_GROUP_ICONS = [
  'Utensils',
  'ShoppingBag',
  'Car',
  'Calendar',
  'HeartPulse',
  'Wallet',
  'Coffee',
  'Home',
  'Tv',
  'Wifi',
  'Tag',
  'Folder',
];
