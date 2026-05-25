export const mockResumeData = {
  personalInfo: {
    fullName: "Jonathan T. Miller",
    jobTitle: "Senior Software Architect & Team Lead",
    email: "jonathan.t.miller@example.com",
    phone: "+1 (555) 382-9012",
    location: "Seattle, WA", // Can be toggled dynamically for Canada (e.g. Toronto, ON) or Australia (e.g. Sydney, NSW)
    website: "https://jtmiller.dev",
    linkedin: "linkedin.com/in/jtmiller-architect",
    github: "github.com/jtmiller-codes",
    summary: "High-impact Software Architect with 8+ years of experience leading cross-functional teams and designing distributed cloud native applications. Proven track record of spearheading migration strategies that reduce infrastructure costs by 35% while increasing service reliability to 99.99%. Passionate about mentoring developers, optimizing system performance, and building accessible, robust digital platforms.",
    citizenship: "", // Keep blank by default to follow local guidelines
    languages: "English (Native), French (Professional Working Proficiency)" // Excellent for Canadian bilingualism showcase
  },
  workExperience: [
    {
      id: "exp-1",
      role: "Lead Systems Architect",
      company: "CloudScale Technologies",
      location: "Seattle, WA",
      startDate: "2023-03",
      endDate: "Present",
      description: "<ul><li>Architected and deployed a multi-tenant microservices platform on AWS, serving over 1.2 million active users globally.</li><li>Pioneered the integration of real-time telemetry pipelines, resolving performance bottlenecks and reducing database load by 42%.</li><li>Orchestrated a team of 12 engineers in building responsive, accessible React-based customer dashboards using WCAG 2.1 AA standards.</li><li>Formulated the containerization strategy with Kubernetes, shrinking developer onboarding time from weeks to 2 days.</li></ul>"
    },
    {
      id: "exp-2",
      role: "Senior Software Engineer",
      company: "ByteWave Solutions",
      location: "San Francisco, CA",
      startDate: "2020-06",
      endDate: "2023-02",
      description: "<ul><li>Spearheaded the redesign of the core billing system, ensuring 100% compliance with PCI-DSS guidelines.</li><li>Collaborated with UX and product teams to implement dynamic caching layers, speeding up page interactions by 210ms.</li><li>Mentored 6 junior and mid-level developers, instituting automated unit testing workflows that reduced production bugs by 30%.</li><li>Developed custom internal CLI tools in Node.js to automate deployment scripts, saving the engineering department 15 hours weekly.</li></ul>"
    },
    {
      id: "exp-3",
      role: "Software Developer II",
      company: "Apex Digital Systems",
      location: "Austin, TX",
      startDate: "2018-02",
      endDate: "2020-05",
      description: "<ul><li>Built responsive single-page web applications utilizing React, Redux, and modern CSS layout paradigms.</li><li>Integrated third-party RESTful APIs and secure OAuth authentication protocols, reducing login friction by 18%.</li><li>Maintained robust code coverage of 92% across core application logic with Jest and React Testing Library.</li></ul>"
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Master of Science in Computer Science",
      school: "University of Washington",
      location: "Seattle, WA",
      startDate: "2016-09",
      endDate: "2018-05",
      details: "Specialization in Distributed Systems & Web Architectures. Graduate Teaching Assistant."
    },
    {
      id: "edu-2",
      degree: "Bachelor of Science in Software Engineering",
      school: "University of Texas at Austin",
      location: "Austin, TX",
      startDate: "2012-09",
      endDate: "2016-05",
      details: "Graduated Summa Cum Laude. Co-founded the Developer Syndicate Club."
    }
  ],
  skills: [
    { id: "sk-1", category: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "Python", "Go", "HTML5/CSS3", "SQL"] },
    { id: "sk-2", category: "Frameworks & Libraries", items: ["React", "Next.js", "Node.js", "Redux", "Express", "GraphQL"] },
    { id: "sk-3", category: "DevOps & Cloud", items: ["AWS (S3, EC2, Lambda)", "Docker", "Kubernetes", "CI/CD (GitHub Actions)", "Terraform"] },
    { id: "sk-4", category: "Design & Practices", items: ["RESTful APIs", "Microservices", "System Design", "Agile / Scrum", "TDD"] }
  ],
  certifications: [
    { id: "cert-1", name: "AWS Certified Solutions Architect – Professional", issuer: "Amazon Web Services", date: "2024" },
    { id: "cert-2", name: "Certified ScrumMaster (CSM)", issuer: "Scrum Alliance", date: "2021" }
  ],
  references: [
    {
      id: "ref-1",
      name: "Dr. Sarah Jenkins",
      title: "Director of Engineering, CloudScale Technologies",
      contact: "sarah.jenkins@example.com | +1 (555) 902-1823"
    },
    {
      id: "ref-2",
      name: "Marcus Vance",
      title: "VP of Product, ByteWave Solutions",
      contact: "marcus.vance@example.com | +1 (555) 438-2910"
    }
  ],
  customSections: []
};
