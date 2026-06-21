const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const normalizeFn = `
const normalizeResumeData = (data) => {
  if (!data) return data;
  const newData = { ...data };
  const addIds = (arr, prefix) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item, idx) => ({
      ...item,
      id: item.id || \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}-\${idx}\`
    }));
  };
  newData.workExperience = addIds(newData.workExperience, 'exp');
  newData.projects = addIds(newData.projects, 'proj');
  newData.education = addIds(newData.education, 'edu');
  newData.skills = addIds(newData.skills, 'sk');
  newData.certifications = addIds(newData.certifications, 'cert');
  newData.references = addIds(newData.references, 'ref');
  
  if (Array.isArray(newData.customSections)) {
    newData.customSections = newData.customSections.map((sec, sIdx) => ({
      ...sec,
      id: sec.id || \`custom-\${Date.now()}-\${sIdx}\`,
      items: addIds(sec.items, 'ci')
    }));
  }
  return newData;
};
`;

// Insert the function outside the component or right before it's used.
// Let's insert it right after emptyResumeState
if (!content.includes('const normalizeResumeData')) {
  content = content.replace(
    'const emptyResumeState = {', 
    normalizeFn + '\nconst emptyResumeState = {'
  );
}

// Replace setFormData(resumeData || emptyResumeState) with normalizeResumeData
const target = 'setFormData(resumeData || emptyResumeState);';
const replacement = 'setFormData(resumeData ? normalizeResumeData(resumeData) : emptyResumeState);';
if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.jsx', content);
  console.log('App.jsx patched successfully!');
} else {
  console.error('Target setFormData not found in App.jsx');
}
