export const ASSET_CATEGORIES = {
  Furniture: {
    name: 'Furniture',
    description: 'Classroom, lab, faculty, and administrative furniture fixtures',
    color: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50',
    subCategories: {
      Chair: {
        name: 'Chair',
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
    description: 'Classroom instruction, presentation, and audio-visual technologies',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
    subCategories: {
      Boards: {
        name: 'Boards',
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
        description: 'High-definition digital projectors for lecture halls and seminar rooms',
        items: [
          'LCD Projector',
          'LED Projector',
          'Laser Projector'
        ]
      },
      Microphone: {
        name: 'Microphone',
        description: 'Wired, wireless and lapel microphones for auditoriums and smart halls',
        items: [
          'Wired Microphone',
          'Wireless Microphone',
          'Collar/Lapel Microphone'
        ]
      },
      'Camera & AV': {
        name: 'Camera & AV',
        description: 'High-res webcams and digital recording cameras',
        items: [
          'Web cam'
        ]
      }
    }
  },
  Electricals: {
    name: 'Electricals',
    description: 'Campus electrical appliances and cooling fixtures',
    color: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
    subCategories: {
      'Fans & Cooling': {
        name: 'Fans & Cooling',
        description: 'Air conditioners, ceiling fans, and high-velocity wall fans',
        items: [
          'Ceiling Fan',
          'Wall Fan',
          'Split AC'
        ]
      },
      Lighting: {
        name: 'Lighting',
        description: 'Energy-efficient LED fixtures and fluorescent tube lights',
        items: [
          'LED Light',
          'Tube Light'
        ]
      }
    }
  },
  Laboratory: {
    name: 'Laboratory',
    description: 'Scientific precision instruments, analytical testing, optical, and research apparatus',
    color: 'bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50',
    subCategories: {
      'Analytical Instruments': {
        name: 'Analytical Instruments',
        description: 'Digital analytical balances, UV-Vis spectrophotometers, pH meters, and centrifuges',
        items: [
          'Digital Precision Analytical Balance',
          'UV-Visible Spectrophotometer',
          'Microprocessor pH Meter',
          'High Speed Refrigerated Centrifuge'
        ]
      },
      'Optical & Microscopy': {
        name: 'Optical & Microscopy',
        description: 'Binocular biological microscopes, stereo zoom optics, and refractometers',
        items: [
          'Binocular Research Compound Microscope',
          'Digital Trinocular Zoom Stereo Microscope',
          'Abbe Benchtop Refractometer'
        ]
      },
      'Glassware & Biosafety': {
        name: 'Glassware & Biosafety',
        description: 'Laminar air flow chambers, vertical autoclaves, and water distillation plants',
        items: [
          'Horizontal Laminar Air Flow Chamber',
          'Vertical High-Pressure Autoclave',
          'Automatic Water Distillation Apparatus'
        ]
      },
      'Engineering & Testing': {
        name: 'Engineering & Testing',
        description: 'Fluid mechanics test rigs, universal testing units, and electronic test benches',
        items: [
          'Pelton Wheel Turbine Fluid Mechanics Rig',
          'Digital Universal Testing Machine 50kN',
          'Digital Storage Oscilloscope 100MHz'
        ]
      }
    }
  },
  'IT Hardware': {
    name: 'IT Hardware',
    description: 'Computing workstations, enterprise servers, managed networking, and digital peripherals',
    color: 'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50',
    subCategories: {
      'Computing & Workstations': {
        name: 'Computing & Workstations',
        description: 'Desktop computers, AI workstations, high-density blade servers, and laptops',
        items: [
          'All-in-One Desktop Core i7 Workstation',
          'High-Performance AI & Data Science Workstation',
          '2U Dual Xeon Enterprise Rackmount Server',
          'Faculty Ultra-Light Commercial Laptop'
        ]
      },
      'Networking & Infrastructure': {
        name: 'Networking & Infrastructure',
        description: 'Managed switches, Wi-Fi 6 enterprise access points, and firewall gateways',
        items: [
          '24-Port Gigabit Managed PoE+ Network Switch',
          'Enterprise Dual-Band Wi-Fi 6 Access Point',
          'Next-Gen Security Network Firewall Gateway'
        ]
      },
      'Displays & Peripherals': {
        name: 'Displays & Peripherals',
        description: 'Ultra-HD monitors, network laser printers, document scanners, and accessories',
        items: [
          '27-inch 4K UHD IPS Professional Monitor',
          'Enterprise Network Monochrome Laser Multi-Function Printer',
          'High-Speed Automatic Document Scanner'
        ]
      },
      'Power & UPS': {
        name: 'Power & UPS',
        description: 'Online server UPS systems, rackmount power distribution units, and battery banks',
        items: [
          'Online Modular Rackmount UPS 5KVA',
          'Online High-Capacity Dual-Conversion UPS 10KVA',
          'Rackmount Intelligent Power Distribution Unit PDU'
        ]
      }
    }
  },
  Electronics: {
    name: 'Electronics',
    description: 'Interactive smart screens, digital podiums, and campus audio systems',
    color: 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50',
    subCategories: {
      'Interactive Displays': {
        name: 'Interactive Displays',
        description: 'Touch interactive flat panels and smart digital whiteboards',
        items: [
          '75-inch 4K Interactive Touch Flat Panel Display',
          'Digital Smart Podium with Touch Controller'
        ]
      },
      'Audio & Public Address': {
        name: 'Audio & Public Address',
        description: 'PA amplifier mixers, column speakers, and wireless microphone stations',
        items: [
          'Multi-Zone Public Address Amplifier System',
          'UHF Dual Wireless Lapel Microphone System'
        ]
      },
      'Power & Backup': {
        name: 'Power & Backup',
        description: 'Smart power backup units and voltage regulators',
        items: [
          'Matrix Smart UPS & Power Backup 5KVA',
          'Servo Controlled Automatic Voltage Stabilizer'
        ]
      }
    }
  }
};

// Helper: Get list of all main category names
export const getMainCategories = (categories = ASSET_CATEGORIES) => {
  return Object.keys(categories || ASSET_CATEGORIES);
};

export const MAIN_CATEGORIES = Object.keys(ASSET_CATEGORIES);

// Helper: Flatten list of all subcategories
export const getAllSubCategories = (mainCategory = null, categories = ASSET_CATEGORIES) => {
  const catSource = categories || ASSET_CATEGORIES;
  if (mainCategory && catSource[mainCategory]?.subCategories) {
    return Object.values(catSource[mainCategory].subCategories);
  }
  const result = [];
  Object.values(catSource).forEach((main) => {
    if (main?.subCategories) {
      Object.values(main.subCategories).forEach((sub) => {
        result.push({ ...sub, mainCategory: main.name });
      });
    }
  });
  return result;
};

// Helper: Get subcategories for a given main category
export const getSubCategories = (mainCategory, categories = ASSET_CATEGORIES) => {
  const catSource = categories || ASSET_CATEGORIES;
  if (mainCategory && catSource[mainCategory]?.subCategories) {
    return Object.keys(catSource[mainCategory].subCategories);
  }
  return [];
};

// Helper: Get all specific item types for a subcategory or main category
export const getItemTypes = (mainCategory, subCategory, categories = ASSET_CATEGORIES) => {
  const catSource = categories || ASSET_CATEGORIES;
  if (mainCategory && subCategory && catSource[mainCategory]?.subCategories?.[subCategory]?.items) {
    return catSource[mainCategory].subCategories[subCategory].items;
  }
  return [];
};

// Helper: Get all unique item types across system
export const getAllItemTypes = (categories = ASSET_CATEGORIES) => {
  const catSource = categories || ASSET_CATEGORIES;
  const items = [];
  Object.entries(catSource).forEach(([mainKey, main]) => {
    if (main?.subCategories) {
      Object.entries(main.subCategories).forEach(([subKey, sub]) => {
        (sub.items || []).forEach((item) => {
          items.push({
            item,
            subCategory: subKey,
            mainCategory: mainKey,
          });
        });
      });
    }
  });
  return items;
};

// Helper: Find category info for a given item type name
export const findCategoryByItem = (itemName, categories = ASSET_CATEGORIES) => {
  const catSource = categories || ASSET_CATEGORIES;
  for (const [mainKey, main] of Object.entries(catSource)) {
    if (main?.subCategories) {
      for (const [subKey, sub] of Object.entries(main.subCategories)) {
        if (sub.items?.includes(itemName) || itemName?.toLowerCase().includes(subKey.toLowerCase())) {
          return { mainCategory: mainKey, subCategory: subKey, itemName };
        }
      }
    }
  }
  return { mainCategory: 'Furniture', subCategory: 'Chair', itemName };
};

