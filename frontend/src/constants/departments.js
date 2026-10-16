// STRICT SINGLE SOURCE OF TRUTH FOR DEPARTMENTS / BLOCKS
// Exactly these 9 departments/blocks are permitted throughout the application.

export const ALLOWED_DEPARTMENTS = [
  'Computer Science',
  'Mechanical',
  'Civil',
  'IT',
  'AIDS',
  'ECE',
  'EEE',
  'Science & Humanities',
  'Admin Block'
];

export const isValidDepartment = (dept) => {
  return typeof dept === 'string' && ALLOWED_DEPARTMENTS.includes(dept.trim());
};

// Safe mapping for legacy / alternative department names to the 9 standard departments/blocks
export const mapLegacyDepartment = (dept) => {
  if (!dept || typeof dept !== 'string') return 'Computer Science';
  const clean = dept.trim().toLowerCase();

  // 1. Computer Science
  if (clean === 'computer science' || clean.includes('cse') || clean.includes('cs') || clean.includes('computing')) {
    return 'Computer Science';
  }
  // 2. Mechanical
  if (clean === 'mechanical' || clean.includes('mech') || clean.includes('me')) {
    return 'Mechanical';
  }
  // 3. Civil
  if (clean === 'civil' || clean.includes('civ')) {
    return 'Civil';
  }
  // 4. IT
  if (clean === 'it' || clean === 'information technology' || clean.includes('infotech')) {
    return 'IT';
  }
  // 5. AIDS
  if (clean === 'aids' || clean === 'ai & ds' || clean === 'ai-ds' || clean.includes('artificial intelligence') || clean.includes('data science')) {
    return 'AIDS';
  }
  // 6. ECE
  if (clean === 'ece' || clean.includes('electronics') || clean.includes('communication')) {
    return 'ECE';
  }
  // 7. EEE
  if (clean === 'eee' || clean.includes('electrical')) {
    return 'EEE';
  }
  // 9. Admin Block (Check administration / admin / library before S&H)
  if (clean === 'admin block' || clean === 'administration' || clean === 'admin' || clean === 'admin department' || clean.includes('admin') || clean.includes('estate') || clean.includes('boardroom')) {
    return 'Admin Block';
  }
  // 8. Science & Humanities
  if (
    clean === 'science & humanities' || 
    clean.includes('physics') || 
    clean.includes('chemistry') || 
    clean.includes('mathematics') || 
    clean.includes('math') || 
    clean.includes('science') || 
    clean.includes('humanities') ||
    clean.includes('library')
  ) {
    return 'Science & Humanities';
  }

  return 'Science & Humanities';
};
