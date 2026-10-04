import { createSlice } from '@reduxjs/toolkit';
import { ASSET_CATEGORIES } from '../constants/assetCategories';

const STORAGE_KEY = 'asset_categories_taxonomy_v3';

const getInitialCategories = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return ASSET_CATEGORIES;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        // Deep merge with base categories so defaults are always available
        const merged = { ...ASSET_CATEGORIES };
        Object.entries(parsed).forEach(([mainKey, mainVal]) => {
          if (!merged[mainKey]) {
            merged[mainKey] = mainVal;
          } else {
            merged[mainKey] = {
              ...merged[mainKey],
              ...mainVal,
              subCategories: {
                ...merged[mainKey].subCategories,
                ...(mainVal.subCategories || {}),
              },
            };
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.error('Error loading saved categories:', e);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ASSET_CATEGORIES));
  } catch {
    // Ignore storage quota errors
  }
  return ASSET_CATEGORIES;
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    taxonomy: getInitialCategories(),
    loading: false,
    error: null,
  },
  reducers: {
    setTaxonomy: (state, action) => {
      state.taxonomy = action.payload || ASSET_CATEGORIES;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.taxonomy));
      } catch (e) {
        console.error('Failed to save taxonomy:', e);
      }
    },
    addPrimaryCategory: (state, action) => {
      const { name, description = '', color, initialSubCategory = 'General', initialItemType } = action.payload;
      if (!name || !name.trim()) return;

      const trimmedName = name.trim();
      const subName = (initialSubCategory && initialSubCategory.trim()) ? initialSubCategory.trim() : 'General';
      const itemName = (initialItemType && initialItemType.trim()) ? initialItemType.trim() : subName;

      const defaultColor = color || 'bg-violet-50 border-violet-100 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50';

      if (!state.taxonomy[trimmedName]) {
        state.taxonomy[trimmedName] = {
          name: trimmedName,
          description: description.trim() || `Department and campus ${trimmedName.toLowerCase()} assets`,
          color: defaultColor,
          subCategories: {
            [subName]: {
              name: subName,
              description: `${subName} items and units`,
              items: [itemName],
            },
          },
        };
      } else {
        // If it already exists, ensure subcategory is added if missing
        if (!state.taxonomy[trimmedName].subCategories[subName]) {
          state.taxonomy[trimmedName].subCategories[subName] = {
            name: subName,
            description: `${subName} items and units`,
            items: [itemName],
          };
        } else if (itemName && !state.taxonomy[trimmedName].subCategories[subName].items.includes(itemName)) {
          state.taxonomy[trimmedName].subCategories[subName].items.push(itemName);
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.taxonomy));
      } catch (e) {
        console.error('Failed to save taxonomy:', e);
      }
    },
    addSubCategory: (state, action) => {
      const { mainCategory, name, description = '', initialItemType } = action.payload;
      if (!mainCategory || !name || !name.trim()) return;

      const trimmedMain = mainCategory.trim();
      const trimmedSub = name.trim();
      const itemName = (initialItemType && initialItemType.trim()) ? initialItemType.trim() : trimmedSub;

      if (!state.taxonomy[trimmedMain]) {
        // Create main if it doesn't exist
        state.taxonomy[trimmedMain] = {
          name: trimmedMain,
          description: `Assets under ${trimmedMain}`,
          color: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50',
          subCategories: {},
        };
      }

      if (!state.taxonomy[trimmedMain].subCategories[trimmedSub]) {
        state.taxonomy[trimmedMain].subCategories[trimmedSub] = {
          name: trimmedSub,
          description: description.trim() || `${trimmedSub} equipment and items`,
          items: [itemName],
        };
      } else {
        // Subcategory already exists, append item if specified
        if (itemName && !state.taxonomy[trimmedMain].subCategories[trimmedSub].items.includes(itemName)) {
          state.taxonomy[trimmedMain].subCategories[trimmedSub].items.push(itemName);
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.taxonomy));
      } catch (e) {
        console.error('Failed to save taxonomy:', e);
      }
    },
    addItemType: (state, action) => {
      const { mainCategory, subCategory, name } = action.payload;
      if (!mainCategory || !subCategory || !name || !name.trim()) return;

      const trimmedMain = mainCategory.trim();
      const trimmedSub = subCategory.trim();
      const trimmedItem = name.trim();

      if (state.taxonomy[trimmedMain]?.subCategories?.[trimmedSub]) {
        if (!state.taxonomy[trimmedMain].subCategories[trimmedSub].items.includes(trimmedItem)) {
          state.taxonomy[trimmedMain].subCategories[trimmedSub].items.push(trimmedItem);
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.taxonomy));
      } catch (e) {
        console.error('Failed to save taxonomy:', e);
      }
    },
    resetTaxonomy: (state) => {
      state.taxonomy = ASSET_CATEGORIES;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ASSET_CATEGORIES));
      } catch (e) {
        console.error('Failed to reset taxonomy:', e);
      }
    },
  },
});

export const {
  setTaxonomy,
  addPrimaryCategory,
  addSubCategory,
  addItemType,
  resetTaxonomy,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
