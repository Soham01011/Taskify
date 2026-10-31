import { CategoryGroup, MerchantRule } from '../types/expense';

export const DEFAULT_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'food_dining',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#FF7A00',
    isFixed: false,
    subCategories: [
      'Dining Out & Cafes',
      'Quick Groceries & Delivery',
      'Coffee & Pantry Snacks',
    ],
  },
  {
    id: 'fixed_bills',
    name: 'Fixed Bills & Subscriptions',
    icon: 'Calendar',
    color: '#00A3FF',
    isFixed: true,
    subCategories: [
      'Rent & Maintenance',
      'Investments & SIP',
      'Cloud & OTT',
      'Utilities & Telecom',
    ],
  },
  {
    id: 'transport_commute',
    name: 'Transport & Commute',
    icon: 'Car',
    color: '#8E44AD',
    isFixed: false,
    subCategories: [
      'Cabs & Autos',
      'Metro & Transit',
      'Fuel & Parking',
    ],
  },
  {
    id: 'shopping_lifestyle',
    name: 'Shopping & Lifestyle',
    icon: 'ShoppingBag',
    color: '#E91E63',
    isFixed: false,
    subCategories: [
      'E-Commerce & Retail',
      'Fashion & Clothing',
      'Gadgets & Electronics',
    ],
  },
  {
    id: 'health_medical',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#2ECC71',
    isFixed: false,
    subCategories: [
      'Pharmacy & Medicines',
      'Diagnostics & Consultations',
      'Fitness & Wellness',
    ],
  },
  {
    id: 'transfers_personal',
    name: 'Transfers & Personal',
    icon: 'Wallet',
    color: '#F39C12',
    isFixed: false,
    subCategories: [
      'Friends & Family',
      'Salary & Income',
      'Cash & Self-Transfer',
      'Reimbursements',
    ],
  },
  {
    id: 'uncategorized',
    name: 'Uncategorized',
    icon: 'HelpCircle',
    color: '#7F8C8D',
    isFixed: false,
    subCategories: [
      'General Outflow',
      'Review Needed',
    ],
  },
];

export const DEFAULT_MERCHANT_RULES: MerchantRule[] = [
  // Food - Dining Out & Cafes
  { merchantKeyword: 'eatgood', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'swiggy', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'zomato', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'starbucks', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'third wave', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'tanvis kitchen', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'jalaram sweet', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'saundarya', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'mcdonald', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'burger king', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'domino', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'pizza', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'restaurant', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'cafe', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },
  { merchantKeyword: 'deli', category: 'Food & Dining', subCategory: 'Dining Out & Cafes' },

  // Food - Quick Groceries
  { merchantKeyword: 'zepto', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'blinkit', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'instamart', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'bigbasket', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'aarey milk', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'jayshree krishna vegetable', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'thakur chakki', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'grocery', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'vegetable', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'fruits', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },
  { merchantKeyword: 'dairy', category: 'Food & Dining', subCategory: 'Quick Groceries & Delivery' },

  // Food - Coffee & Pantry Snacks
  { merchantKeyword: 'hungerbox', category: 'Food & Dining', subCategory: 'Coffee & Pantry Snacks' },
  { merchantKeyword: 'vendiman', category: 'Food & Dining', subCategory: 'Coffee & Pantry Snacks' },
  { merchantKeyword: 'chai', category: 'Food & Dining', subCategory: 'Coffee & Pantry Snacks' },
  { merchantKeyword: 'tea', category: 'Food & Dining', subCategory: 'Coffee & Pantry Snacks' },
  { merchantKeyword: 'pantry', category: 'Food & Dining', subCategory: 'Coffee & Pantry Snacks' },
  { merchantKeyword: 'vending', category: 'Food & Dining', subCategory: 'Coffee & Pantry Snacks' },

  // Fixed Bills - Rent & Maintenance
  { merchantKeyword: 'landlord', category: 'Fixed Bills & Subscriptions', subCategory: 'Rent & Maintenance' },
  { merchantKeyword: 'rent', category: 'Fixed Bills & Subscriptions', subCategory: 'Rent & Maintenance' },
  { merchantKeyword: 'society', category: 'Fixed Bills & Subscriptions', subCategory: 'Rent & Maintenance' },
  { merchantKeyword: 'maintenance', category: 'Fixed Bills & Subscriptions', subCategory: 'Rent & Maintenance' },

  // Fixed Bills - Investments & SIP
  { merchantKeyword: 'sip', category: 'Fixed Bills & Subscriptions', subCategory: 'Investments & SIP' },
  { merchantKeyword: 'mutual fund', category: 'Fixed Bills & Subscriptions', subCategory: 'Investments & SIP' },
  { merchantKeyword: 'zerodha', category: 'Fixed Bills & Subscriptions', subCategory: 'Investments & SIP' },
  { merchantKeyword: 'groww', category: 'Fixed Bills & Subscriptions', subCategory: 'Investments & SIP' },
  { merchantKeyword: 'nifty', category: 'Fixed Bills & Subscriptions', subCategory: 'Investments & SIP' },

  // Fixed Bills - Cloud & OTT
  { merchantKeyword: 'netflix', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'spotify', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'prime', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'aws', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'google one', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'youtube', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'hotstar', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },
  { merchantKeyword: 'apple.com', category: 'Fixed Bills & Subscriptions', subCategory: 'Cloud & OTT' },

  // Fixed Bills - Utilities & Telecom
  { merchantKeyword: 'vodafone', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'vi', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'airtel', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'jio', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'electricity', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'bescom', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'tata play', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },
  { merchantKeyword: 'broadband', category: 'Fixed Bills & Subscriptions', subCategory: 'Utilities & Telecom' },

  // Transport - Cabs & Autos
  { merchantKeyword: 'rapido', category: 'Transport & Commute', subCategory: 'Cabs & Autos' },
  { merchantKeyword: 'uber', category: 'Transport & Commute', subCategory: 'Cabs & Autos' },
  { merchantKeyword: 'ola', category: 'Transport & Commute', subCategory: 'Cabs & Autos' },
  { merchantKeyword: 'auto', category: 'Transport & Commute', subCategory: 'Cabs & Autos' },

  // Transport - Metro & Transit
  { merchantKeyword: 'indian railways', category: 'Transport & Commute', subCategory: 'Metro & Transit' },
  { merchantKeyword: 'uts', category: 'Transport & Commute', subCategory: 'Metro & Transit' },
  { merchantKeyword: 'irctc', category: 'Transport & Commute', subCategory: 'Metro & Transit' },
  { merchantKeyword: 'metro', category: 'Transport & Commute', subCategory: 'Metro & Transit' },
  { merchantKeyword: 'ncmc', category: 'Transport & Commute', subCategory: 'Metro & Transit' },
  { merchantKeyword: 'chalo', category: 'Transport & Commute', subCategory: 'Metro & Transit' },

  // Shopping & Lifestyle
  { merchantKeyword: 'amazon', category: 'Shopping & Lifestyle', subCategory: 'E-Commerce & Retail' },
  { merchantKeyword: 'flipkart', category: 'Shopping & Lifestyle', subCategory: 'E-Commerce & Retail' },
  { merchantKeyword: 'myntra', category: 'Shopping & Lifestyle', subCategory: 'Fashion & Clothing' },
  { merchantKeyword: 'ajio', category: 'Shopping & Lifestyle', subCategory: 'Fashion & Clothing' },
  { merchantKeyword: 'jay ambe art printers', category: 'Shopping & Lifestyle', subCategory: 'E-Commerce & Retail' },

  // Health & Medical
  { merchantKeyword: 'mediplus', category: 'Health & Medical', subCategory: 'Pharmacy & Medicines' },
  { merchantKeyword: 'pharmacy', category: 'Health & Medical', subCategory: 'Pharmacy & Medicines' },
  { merchantKeyword: 'apollo', category: 'Health & Medical', subCategory: 'Pharmacy & Medicines' },
  { merchantKeyword: '1mg', category: 'Health & Medical', subCategory: 'Pharmacy & Medicines' },
  { merchantKeyword: 'chemist', category: 'Health & Medical', subCategory: 'Pharmacy & Medicines' },
  { merchantKeyword: 'doctor', category: 'Health & Medical', subCategory: 'Diagnostics & Consultations' },
  { merchantKeyword: 'hospital', category: 'Health & Medical', subCategory: 'Diagnostics & Consultations' },

  // Transfers & Personal
  { merchantKeyword: 'sangramji rajuji sama', category: 'Transfers & Personal', subCategory: 'Friends & Family' },
  { merchantKeyword: 'abhesh prasad singh', category: 'Transfers & Personal', subCategory: 'Friends & Family' },
  { merchantKeyword: 'anubhav singh gaharwar', category: 'Transfers & Personal', subCategory: 'Friends & Family' },
  { merchantKeyword: 'sanjay rudranarayan jha', category: 'Transfers & Personal', subCategory: 'Friends & Family' },
  { merchantKeyword: 'ramchandra bachai pal', category: 'Transfers & Personal', subCategory: 'Friends & Family' },
];
