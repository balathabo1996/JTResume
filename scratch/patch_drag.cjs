const fs = require('fs');
let content = fs.readFileSync('src/components/BuilderForm.jsx', 'utf8');

const sections = [
  'personal', 'experience', 'projects', 'education', 'skills', 'certifications', 'references'
];

sections.forEach(sec => {
  // Replace standalone draggable with dynamic draggable
  const target = `draggable onDragStart={(e) => handleDragStart(e, '${sec}')}`;
  const replacement = `draggable={draggableSectionId === '${sec}'} onDragStart={(e) => handleDragStart(e, '${sec}')}`;
  content = content.replace(target, replacement);
});

// For custom sections
content = content.replace(
  /draggable onDragStart=\{\(e\) => handleDragStart\(e, "custom-" \+ section\.id\)\}/g,
  'draggable={draggableSectionId === "custom-" + section.id} onDragStart={(e) => handleDragStart(e, "custom-" + section.id)}'
);

// Replace <DragHandle /> in section headers with custom hoverable SVG
const dragIconStr = `<div 
                onMouseEnter={() => setDraggableSectionId(SECTION_ID_PLACEHOLDER)} 
                onMouseLeave={() => setDraggableSectionId(null)}
                style={{ cursor: 'grab', padding: '4px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
              </div>`;

const replaceMap = {
  'Personal Information': "'personal'",
  'Work Experience': "'experience'",
  'Projects': "'projects'",
  'Education': "'education'",
  'Skills & Competencies': "'skills'",
  'Certifications': "'certifications'",
  'References': "'references'"
};

Object.keys(replaceMap).forEach(key => {
  const idStr = replaceMap[key];
  const regex = new RegExp(`(>\\s*${key.replace('&', '\\&')}\\s*</h3*>\\s*<div className="d-flex align-items-center gap-2">\\s*)<DragHandle />`, 'g');
  content = content.replace(regex, '$1' + dragIconStr.replace('SECTION_ID_PLACEHOLDER', idStr));
});

// Custom section header
const customHeaderRegex = /(<div className="d-flex align-items-center gap-2">[\s\n]*)<DragHandle \/>([\s\n]*<button[\s\n]*className="btn-repeater-delete"[\s\n]*onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleDeleteCustomSection\(section\.id\); \}\})/g;
content = content.replace(customHeaderRegex, '$1' + dragIconStr.replace('SECTION_ID_PLACEHOLDER', '`custom-${section.id}`') + '$2');

fs.writeFileSync('src/components/BuilderForm.jsx', content);
console.log('Done!');
