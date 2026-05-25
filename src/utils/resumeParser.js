/**
 * Client-Side Heuristic Resume Parser
 * Parses plain text (e.g. copy-pasted from Word/PDF) into the JTResume state schema.
 */

export function parsePlainResumeText(text) {
  if (!text || typeof text !== 'string') return null;

  const lines = text.split('\n').map(line => line.trim());
  
  // Base schema layout matching emptyResumeState
  const parsedData = {
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      languages: "",
      summary: "",
      photoUrl: "",
      birthDate: "",
      maritalStatus: ""
    },
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    references: []
  };

  // 1. REGEX SCANNING FOR CONTACT DETAILS
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/i;
  const phoneRegex = /\+?\d[\d-\s\(\)\.]{8,14}\d/;
  const linkedinRegex = /(linkedin\.com\/in\/[\w\-]+)/i;
  const githubRegex = /(github\.com\/[\w\-]+)/i;
  const urlRegex = /(https?:\/\/[\w.-]+\.\w+[^\s]*)/i;

  let nameFound = false;
  let titleFound = false;
  let summaryBuffer = [];

  // Scanned contacts to exclude them from summary
  const emails = [];
  const phones = [];
  const linkedins = [];
  const urls = [];

  // Parse lines to extract profile info
  let currentSection = 'personal'; // start at personal header
  let activeExp = null;
  let activeEdu = null;
  let activeCert = null;
  let activeRef = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Detect section header switches
    const lowerLine = line.toLowerCase();
    if (lowerLine.match(/^(work experience|experience|employment|professional history|career history|work history|employment history)/i)) {
      currentSection = 'experience';
      continue;
    } else if (lowerLine.match(/^(education|academic background|academics|qualifications|academic credentials)/i)) {
      currentSection = 'education';
      continue;
    } else if (lowerLine.match(/^(skills|technical skills|expertise|core competencies|competencies|skills & competencies)/i)) {
      currentSection = 'skills';
      continue;
    } else if (lowerLine.match(/^(certifications|licenses|courses|awards|certifications & training)/i)) {
      currentSection = 'certifications';
      continue;
    } else if (lowerLine.match(/^(references|professional references)/i)) {
      currentSection = 'references';
      continue;
    } else if (lowerLine.match(/^(summary|professional summary|about me|profile|objective)/i)) {
      currentSection = 'summary_section';
      continue;
    }

    // Extract emails, phones, social links globally
    if (!parsedData.personalInfo.email && line.match(emailRegex)) {
      parsedData.personalInfo.email = line.match(emailRegex)[0];
      emails.push(parsedData.personalInfo.email);
    }
    if (!parsedData.personalInfo.phone && line.match(phoneRegex)) {
      parsedData.personalInfo.phone = line.match(phoneRegex)[0];
      phones.push(parsedData.personalInfo.phone);
    }
    if (!parsedData.personalInfo.linkedin && line.match(linkedinRegex)) {
      parsedData.personalInfo.linkedin = line.match(linkedinRegex)[0];
      linkedins.push(parsedData.personalInfo.linkedin);
    }
    if (!parsedData.personalInfo.website && line.match(urlRegex) && !line.match(linkedinRegex) && !line.match(githubRegex)) {
      parsedData.personalInfo.website = line.match(urlRegex)[0];
      urls.push(parsedData.personalInfo.website);
    }

    // Section specific line parsing
    switch (currentSection) {
      case 'personal':
        // The first 1-2 lines usually contain Name and Title if they are not contact details
        const containsContact = emailRegex.test(line) || phoneRegex.test(line) || linkedinRegex.test(line) || githubRegex.test(line) || urlRegex.test(line);
        
        if (!nameFound && !containsContact && line.split(/\s+/).length <= 4) {
          parsedData.personalInfo.fullName = line;
          nameFound = true;
        } else if (nameFound && !titleFound && !containsContact && line.split(/\s+/).length <= 5) {
          parsedData.personalInfo.jobTitle = line;
          titleFound = true;
        } else if (!containsContact) {
          // If we see lines here, accumulate to summary buffer
          summaryBuffer.push(line);
        }
        break;

      case 'summary_section':
        summaryBuffer.push(line);
        break;

      case 'experience':
        // Detect dates e.g. "2020 - Present", "Jun 2019 - May 2021", "2018 - 2020"
        const datePattern = /(19|20)\d{2}\s*[-–—]\s*(Present|(19|20)\d{2})|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i;
        const lineHasDate = datePattern.test(line);
        
        // If line starts with bullet indicator
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

        if (lineHasDate && !isBullet) {
          // Commit previous experience
          if (activeExp) {
            activeExp.description = activeExp.description.length > 0 ? `<ul><li>${activeExp.description.join('</li><li>')}</li></ul>` : "";
            parsedData.workExperience.push(activeExp);
          }
          
          // Create new experience block
          // Let's heuristically extract title & company e.g. "Software Engineer - Google" or "Lead Dev at ByteWave"
          let role = "Role";
          let company = "Company";
          let location = "";

          const parts = line.split(/[-–—|at@]/);
          if (parts.length >= 2) {
            role = parts[0].trim();
            company = parts[1].trim();
            // clean company names of dates if they got mixed in
            const dateMatch = company.match(datePattern);
            if (dateMatch) {
              company = company.replace(dateMatch[0], '').replace(/\(|\)/g, '').trim();
            }
          } else {
            role = line.trim();
          }

          // Extract date
          let dateStr = "Date";
          const dateMatch = line.match(/(Present|(19|20)\d{2}.*)/i) || line.match(datePattern);
          if (dateMatch) {
            dateStr = dateMatch[0].trim();
            role = role.replace(dateStr, '').trim();
          }

          activeExp = {
            id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            role: role || "Role",
            company: company || "Company",
            location: location || "Remote",
            startDate: dateStr.split(/[-–—]/)[0]?.trim() || "Start",
            endDate: dateStr.split(/[-–—]/)[1]?.trim() || "Present",
            description: []
          };
        } else if (activeExp) {
          if (isBullet) {
            // strip bullet symbol
            const bulletText = line.replace(/^[•\-\*\s]+/, '').trim();
            if (bulletText) activeExp.description.push(bulletText);
          } else {
            // Append as bullet anyway or append to last bullet
            if (activeExp.description.length > 0) {
              activeExp.description[activeExp.description.length - 1] += " " + line;
            } else {
              activeExp.description.push(line);
            }
          }
        }
        break;

      case 'education':
        // Education dates & degrees scanner
        const eduDatePattern = /(19|20)\d{2}/;
        const isEduBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

        if ((line.match(/degree|bachelor|master|phd|bsc|msc|mba|diploma|graduate|university|college|school/i)) && !isEduBullet) {
          if (activeEdu) {
            parsedData.education.push(activeEdu);
          }

          let degree = "Degree";
          let school = "Institution";
          
          const parts = line.split(/,|-|at|from/i);
          if (parts.length >= 2) {
            degree = parts[0].trim();
            school = parts[1].trim();
          } else {
            degree = line.trim();
          }

          // Search dates
          let dateStr = "Date";
          const dateMatch = line.match(eduDatePattern);
          if (dateMatch) {
            dateStr = dateMatch[0];
          }

          activeEdu = {
            id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            degree: degree,
            school: school,
            location: "Location",
            startDate: dateStr,
            endDate: dateStr,
            details: ""
          };
        } else if (activeEdu) {
          activeEdu.details += (activeEdu.details ? " " : "") + line;
        }
        break;

      case 'skills':
        // Split comma-separated items
        // Let's assume categories are either defined as "Languages: JavaScript, Go" or just lists
        let category = "Core Competencies";
        let itemsList = [];

        if (line.includes(':')) {
          const parts = line.split(':');
          category = parts[0].trim();
          itemsList = parts[1].split(',').map(s => s.trim()).filter(Boolean);
        } else {
          category = "Skills Listing";
          itemsList = line.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (itemsList.length > 0) {
          parsedData.skills.push({
            id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            category: category,
            items: itemsList
          });
        }
        break;

      case 'certifications':
        if (activeCert) {
          parsedData.certifications.push(activeCert);
        }
        
        let certName = line;
        let issuer = "Institution";
        
        const certParts = line.split(/,|-|by/i);
        if (certParts.length >= 2) {
          certName = certParts[0].trim();
          issuer = certParts[1].trim();
        }

        activeCert = {
          id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: certName,
          issuer: issuer,
          date: ""
        };
        break;

      case 'references':
        if (activeRef) {
          parsedData.references.push(activeRef);
        }
        
        let refName = line;
        let refTitle = "Relation";
        let refContact = "";

        const refParts = line.split(/,|-/);
        if (refParts.length >= 2) {
          refName = refParts[0].trim();
          refTitle = refParts[1].trim();
        }

        activeRef = {
          id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: refName,
          title: refTitle,
          contact: refContact
        };
        break;
    }
  }

  // Push final lingering records
  if (activeExp) {
    activeExp.description = activeExp.description.length > 0 ? `<ul><li>${activeExp.description.join('</li><li>')}</li></ul>` : "";
    parsedData.workExperience.push(activeExp);
  }
  if (activeEdu) parsedData.education.push(activeEdu);
  if (activeCert) parsedData.certifications.push(activeCert);
  if (activeRef) parsedData.references.push(activeRef);

  // Compile summary details cleanly (filtering contact strings out)
  const filteredSummary = summaryBuffer
    .filter(l => !emails.includes(l) && !phones.includes(l) && !linkedins.includes(l) && !urls.includes(l))
    .join(' ')
    .trim();

  parsedData.personalInfo.summary = filteredSummary || parsedData.personalInfo.summary;

  return parsedData;
}
