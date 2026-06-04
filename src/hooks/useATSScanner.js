import { useState, useCallback } from 'react';

const COMMON_PROFESSIONAL_KEYWORDS = [
  "React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS",
  "Node.js", "Python", "Java", "Go", "Golang", "C++", "C#", "Ruby", "PHP", "Rust",
  "Swift", "Kotlin", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "DevOps",
  "CI/CD", "Git", "GitHub", "SQL", "NoSQL", "PostgreSQL", "MongoDB", "Redis",
  "Elasticsearch", "GraphQL", "REST", "APIs", "Microservices", "Serverless",
  "Linux", "Terraform", "Ansible", "Jenkins", "Webpack", "Redux", "Tailwind",
  "Bootstrap", "Jest", "Cypress", "Machine Learning", "AI", "Data Science",
  "Analytics", "Security", "Cryptography", "Agile", "Scrum", "Kanban",
  "Product Management", "Project Management", "Jira", "Confluence", "Leadership",
  "Mentorship", "Collaboration", "Strategy", "Roadmap", "Budgeting",
  "Product Launch", "Design", "UX", "UI", "Figma", "Marketing", "SEO", "Sales",
  "Business Development", "Finance", "QA", "Testing", "SDLC", "Compliance",
  "Risk Management",
];

export function useATSScanner(formData) {
  const [jobDescription, setJobDescription] = useState("");
  const [targetKeywords, setTargetKeywords] = useState([]);

  const extractKeywords = (text) => {
    if (!text) return [];
    const matched = [];
    COMMON_PROFESSIONAL_KEYWORDS.forEach((kw) => {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(text)) matched.push(kw);
    });

    const acronyms = text.match(/\b[A-Z]{3,6}\b/g) || [];
    acronyms.forEach((w) => {
      if (!matched.includes(w) && !["AND", "THE", "FOR", "ITS", "NOT", "YOU", "ARE", "THEY", "THIS", "WILL"].includes(w)) {
        matched.push(w);
      }
    });

    return matched.slice(0, 15);
  };

  const handleJobDescriptionChange = (text) => {
    setJobDescription(text);
    setTargetKeywords(extractKeywords(text));
  };

  const getMatchedKeywords = useCallback(() => {
    if (targetKeywords.length === 0 || !formData) return [];
    
    let searchString = "";
    if (formData.personalInfo) {
      searchString += ` ${formData.personalInfo.fullName} ${formData.personalInfo.jobTitle} ${formData.personalInfo.summary}`;
    }
    
    if (formData.workExperience) {
      formData.workExperience.forEach((exp) => {
        searchString += ` ${exp.role} ${exp.company} ${exp.description}`;
      });
    }

    if (formData.education) {
      formData.education.forEach((edu) => {
        searchString += ` ${edu.degree} ${edu.school} ${edu.details}`;
      });
    }

    if (formData.skills) {
      formData.skills.forEach((sk) => {
        searchString += ` ${sk.category} ${(sk.items || []).join(" ")}`;
      });
    }

    if (formData.certifications) {
      formData.certifications.forEach((cert) => {
        searchString += ` ${cert.name} ${cert.issuer}`;
      });
    }

    return targetKeywords.filter((kw) => {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return regex.test(searchString);
    });
  }, [formData, targetKeywords]);

  const matchedKeywords = getMatchedKeywords();
  const matchPercentage = targetKeywords.length > 0
    ? Math.round((matchedKeywords.length / targetKeywords.length) * 100)
    : 0;

  return {
    jobDescription,
    targetKeywords,
    matchedKeywords,
    matchPercentage,
    handleJobDescriptionChange
  };
}
