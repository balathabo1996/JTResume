const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Replace imports
content = content.replace(
  /import \{ useForm \} from "react-hook-form";\nimport BuilderForm from "\.\/components\/BuilderForm";\nimport ResumePreview from "\.\/components\/ResumePreview";/,
  `import BuilderForm from "./components/BuilderForm";
import ResumePreview from "./components/ResumePreview";
import ProfileModal from "./components/ProfileModal";
import DesignSettingsSidebar from "./components/DesignSettingsSidebar";
import { useATSScanner } from "./hooks/useATSScanner";`
);

// 2. Profile Modal State
content = content.replace(
  /const \[isEditingProfile, setIsEditingProfile\] = useState\(false\);[\s\S]*?\} = useForm\(\{ mode: "onChange" \}\);/m,
  ''
);

// 3. ATS Scanner Logic + Colors array
content = content.replace(
  /\/\* --- ADVANCED SAAS ATS SCANNER STATE & LOGIC --- \*\/[\s\S]*?hex: "#701a75" \},\n  \];/m,
  `/* --- ADVANCED SAAS ATS SCANNER LOGIC --- */
  const {
    jobDescription,
    targetKeywords,
    matchedKeywords,
    matchPercentage,
    handleJobDescriptionChange
  } = useATSScanner(formData);`
);

// 4. API Calls (handleProfileUpdate -> handleDeleteAccount)
content = content.replace(
  /const handleProfileUpdate = async \(data\) => \{[\s\S]*?const handleDeleteAccount = async \(\) => \{[\s\S]*?\n  \};\n/m,
  ''
);

// 5. User Profile Modal UI
content = content.replace(
  /\{\/\* ── User Profile Modal ─────────────────────────────────────── \*\/\}\n      \{profileOpen && \([\s\S]*?<\/div>\n      \)\}\n/m,
  `{/* ── User Profile Modal ─────────────────────────────────────── */}
      <ProfileModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        user={user} 
        onUserUpdate={(u) => {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        }}
        onLogout={handleLogout}
      />\n`
);

// 6. Settings Sidebar UI (escaping correctly)
content = content.replace(
  /<div\n              className="canvas-settings-bar mb-4 mx-auto"[\s\S]*?\{\/\* Realtime compliance alerts block \*\/\}/m,
  `<DesignSettingsSidebar
              templateStyle={templateStyle} setTemplateStyle={setTemplateStyle}
              accentColor={accentColor} setAccentColor={setAccentColor}
              fontPairing={fontPairing} setFontPairing={setFontPairing}
              spacingTuning={spacingTuning} setSpacingTuning={setSpacingTuning}
            />

            {/* Realtime compliance alerts block */}`
);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log("Refactoring complete.");
