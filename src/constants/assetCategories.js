export const ASSET_CATEGORIES = {
  Furniture: {
    name: 'Furniture',
    icon: '🪑',
    description: 'Classroom, lab, faculty, and administrative furniture fixtures',
    color: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50',
    subCategories: {
      Chair: {
        name: 'Chair',
        icon: '💺',
        description: 'Student, faculty, executive and task seating',
        items: [
          'Student Chair',
          'Student Chair with Writing Pad',
          'Task Chair',
          'Faculty Chair',
          'Visitor Chair'
        ]
      },
      Table: {
        name: 'Table',
        icon: '🪵',
        description: 'Classroom benches, conference and faculty desks',
        items: [
          'Student Table',
          'Student Bench',
          'Faculty Table',
          'Office Table'
        ]
      },
      'Cupboard & Storage': {
        name: 'Cupboard & Storage',
        icon: '🗄️',
        description: 'Cabinets, racks, lockers, and filing storage',
        items: [
          'Steel Cupboard',
          'Wooden Cupboard',
          'Filing Cabinet',
          'Storage Cabinet',
          'Book Rack',
          'Locker',
          'Drawer Unit'
        ]
      },
      'Other Furniture': {
        name: 'Other Furniture',
        icon: '📦',
        description: 'Podiums, podium lecterns, and display notice boards',
        items: [
          'Lectern',
          'Notice Board'
        ]
      }
    }
  },
  'Teaching Equipment': {
    name: 'Teaching Equipment',
    icon: '🎓',
    description: 'Classroom instruction, presentation, and audio-visual technologies',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
    subCategories: {
      Boards: {
        name: 'Boards',
        icon: '📋',
        description: 'Writing, ceramic, interactive and projection boards',
        items: [
          'Whiteboard',
          'Green Board',
          'Interactive Smart Board',
          'Projection Board'
        ]
      },
      Projector: {
        name: 'Projector',
        icon: '📽️',
        description: 'High-definition digital projectors for lecture halls and seminar rooms',
        items: [
          'LCD Projector',
          'LED Projector',
          'Laser Projector'
        ]
      },
      Microphone: {
        name: 'Microphone',
        icon: '🎙️',
        description: 'Wired, wireless and lapel microphones for auditoriums and smart halls',
        items: [
          'Wired Microphone',
          'Wireless Microphone',
          'Collar/Lapel Microphone'
        ]
      },
      'Camera & AV': {
        name: 'Camera & AV',
        icon: '📹',
        description: 'High-res webcams and digital recording cameras',
        items: [
          'Web cam'
        ]
      }
    }
  },
  Electricals: {
    name: 'Electricals',
    icon: '⚡',
    description: 'Campus electrical appliances, cooling fixtures, and power distribution',
    color: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
    subCategories: {
      'Fans & Cooling': {
        name: 'Fans & Cooling',
        icon: '❄️',
        description: 'Air conditioners, ceiling fans, and high-velocity wall fans',
        items: [
          'Ceiling Fan',
          'Wall Fan',
          'Split AC'
        ]
      },
      Lighting: {
        name: 'Lighting',
        icon: '💡',
        description: 'Energy-efficient LED fixtures and fluorescent tube lights',
        items: [
          'LED Light',
          'Tube Light'
        ]
      },
      'Power & Distribution': {
        name: 'Power & Distribution',
        icon: '🔌',
        description: 'Switchboards, heavy-duty surge extension boxes and power outlets',
        items: [
          'Electrical Switchboard',
          'Power Socket',
          'Extension Board'
        ]
      }
    }
  }
};

// Helper: Get list of all main category names
export const MAIN_CATEGORIES = Object.keys(ASSET_CATEGORIES);

// Helper: Flatten list of all subcategories
export const getAllSubCategories = (mainCategory = null) => {
  if (mainCategory && ASSET_CATEGORIES[mainCategory]) {
    return Object.values(ASSET_CATEGORIES[mainCategory].subCategories);
  }
  const result = [];
  Object.values(ASSET_CATEGORIES).forEach((main) => {
    Object.values(main.subCategories).forEach((sub) => {
      result.push({ ...sub, mainCategory: main.name });
    });
  });
  return result;
};

// Helper: Get all specific item types for a subcategory or main category
export const getItemTypes = (mainCategory, subCategory) => {
  if (mainCategory && subCategory && ASSET_CATEGORIES[mainCategory]?.subCategories[subCategory]) {
    return ASSET_CATEGORIES[mainCategory].subCategories[subCategory].items;
  }
  return [];
};

// Helper: Get all unique item types across system
export const getAllItemTypes = () => {
  const items = [];
  Object.entries(ASSET_CATEGORIES).forEach(([mainKey, main]) => {
    Object.entries(main.subCategories).forEach(([subKey, sub]) => {
      sub.items.forEach((item) => {
        items.push({
          item,
          subCategory: subKey,
          mainCategory: mainKey,
        });
      });
    });
  });
  return items;
};

// Helper: Find category info for a given item type name
export const findCategoryByItem = (itemName) => {
  for (const [mainKey, main] of Object.entries(ASSET_CATEGORIES)) {
    for (const [subKey, sub] of Object.entries(main.subCategories)) {
      if (sub.items.includes(itemName) || itemName?.toLowerCase().includes(subKey.toLowerCase())) {
        return { mainCategory: mainKey, subCategory: subKey, itemName };
      }
    }
  }
  return { mainCategory: 'Furniture', subCategory: 'Chair', itemName };
};
