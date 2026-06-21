/**
 * @file docxExport.js
 * @description Word document resume generator. Builds formatted, structured tables and layouts for resume data mapping using docx library rules.
 * @author Thabotharan Balachandran
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

export const generateDocx = async (formData, options = {}) => {
  const {
    personalInfo = {},
    workExperience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
  } = formData;

  const {
    templateStyle = "modern",
    accentColor = "#1e3a8a",
    spacingTuning = "normal",
    fontPairing = "modern",
  } = options;

  // Clean accent color hex code (e.g. #1e3a8a -> 1e3a8a)
  const hexAccent = (accentColor || "#1e3a8a").replace("#", "");

  // Font family mapping
  let headingFont = "Arial";
  let bodyFont = "Arial";
  if (fontPairing === "editorial") {
    headingFont = "Georgia";
    bodyFont = "Times New Roman";
  } else if (fontPairing === "tech") {
    headingFont = "Consolas";
    bodyFont = "Courier New";
  } else if (fontPairing === "classic") {
    headingFont = "Times New Roman";
    bodyFont = "Georgia";
  } else if (fontPairing === "elegant") {
    headingFont = "Garamond";
    bodyFont = "Calibri";
  } else if (fontPairing === "modern") {
    headingFont = "Calibri";
    bodyFont = "Calibri";
  }

  // Spacing configurations
  const spacingScale = spacingTuning === "compact" ? 0.6 : spacingTuning === "relaxed" ? 1.4 : 1.0;

  const children = [];

  // --- Personal Info (Header) ---
  if (personalInfo.fullName) {
    children.push(
      new Paragraph({
        text: personalInfo.fullName.toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const contactInfos = [];
  if (personalInfo.email) contactInfos.push(personalInfo.email);
  if (personalInfo.phone) contactInfos.push(personalInfo.phone);
  if (personalInfo.location) contactInfos.push(personalInfo.location);
  if (personalInfo.linkedin) contactInfos.push(personalInfo.linkedin);
  if (personalInfo.website) contactInfos.push(personalInfo.website);

  if (contactInfos.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfos.join("  |  "),
            size: 20, // 10pt (half-points)
            color: "555555",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: Math.round(200 * spacingScale) }, // 10pt scaled
      })
    );
  }

  if (personalInfo.summary) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.summary,
            size: 22,
          }),
        ],
        spacing: { after: Math.round(300 * spacingScale) },
      })
    );
  }

  // --- Helper to add Section Titles ---
  const addSectionTitle = (title) => {
    children.push(
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: Math.round(200 * spacingScale), after: Math.round(100 * spacingScale) },
      })
    );
  };

  // --- Work Experience ---
  if (workExperience.length > 0) {
    addSectionTitle("Professional Experience");

    workExperience.forEach((exp) => {
      // Role & Dates
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role || "Role", bold: true, size: 24 }),
            new TextRun({ text: `\t\t\t${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`, size: 22 }),
          ],
          tabStops: [
            {
              type: "right",
              position: 9000,
            },
          ],
        })
      );
      
      // Company & Location
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.company || "Company", italics: true, size: 22 }),
            new TextRun({ text: exp.location ? `, ${exp.location}` : "", italics: true, size: 22 }),
          ],
          spacing: { after: Math.round(100 * spacingScale) },
        })
      );

      // Descriptions (Bullets)
      if (Array.isArray(exp.description) && exp.description.length > 0) {
        exp.description.forEach((desc) => {
          if (desc.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: desc, size: 22 }),
                ],
                bullet: {
                  level: 0,
                },
                spacing: { after: Math.round(80 * spacingScale) },
              })
            );
          }
        });
      } else if (typeof exp.description === 'string' && exp.description.trim()) {
         // Fallback if description is a string
         const lines = exp.description.split('\n');
         lines.forEach(line => {
           if (line.trim()) {
             children.push(
                new Paragraph({
                  children: [new TextRun({ text: line.replace(/^- /, '').trim(), size: 22 })],
                  bullet: { level: 0 },
                  spacing: { after: Math.round(80 * spacingScale) },
                })
             );
           }
         });
      }
      
      children.push(new Paragraph({ text: "", spacing: { after: Math.round(100 * spacingScale) } })); // space between jobs
    });
  }

  // --- Education ---
  if (education.length > 0) {
    addSectionTitle("Education");

    education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || "Degree", bold: true, size: 24 }),
            new TextRun({ text: `\t\t\t${edu.startDate || ""} - ${edu.current ? "Present" : edu.endDate || ""}`, size: 22 }),
          ],
          tabStops: [
            {
              type: "right",
              position: 9000,
            },
          ],
        })
      );
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.school || "School", italics: true, size: 22 }),
            new TextRun({ text: edu.location ? `, ${edu.location}` : "", italics: true, size: 22 }),
          ],
          spacing: { after: Math.round(150 * spacingScale) },
        })
      );
    });
  }

  // --- Skills ---
  if (skills.length > 0) {
    addSectionTitle("Skills");

    // Group skills into one paragraph or bullets?
    // Often skills in DOCX are comma-separated
    const skillList = skills.map(s => s.name || s).filter(Boolean).join(", ");
    if (skillList) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: skillList, size: 22 }),
          ],
          spacing: { after: Math.round(200 * spacingScale) },
        })
      );
    }
  }

  // --- Projects ---
  if (projects && projects.length > 0) {
    addSectionTitle("Projects");

    projects.forEach((proj) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title || "Project", bold: true, size: 24 }),
            new TextRun({ text: `\t\t\t${proj.date || ""}`, size: 22 }),
          ],
          tabStops: [
            {
              type: "right",
              position: 9000,
            },
          ],
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: proj.description, size: 22 }),
            ],
            spacing: { after: Math.round(150 * spacingScale) },
          })
        );
      }
    });
  }

  // --- Certifications ---
  if (certifications && certifications.length > 0) {
    addSectionTitle("Certifications");

    certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name || "Certification", bold: true, size: 22 }),
            new TextRun({ text: cert.issuer ? ` - ${cert.issuer}` : "", size: 22 }),
            new TextRun({ text: `\t\t\t${cert.date || ""}`, size: 22 }),
          ],
          tabStops: [
            {
              type: "right",
              position: 9000,
            },
          ],
          spacing: { after: Math.round(100 * spacingScale) },
        })
      );
    });
  }

  // Generate Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32, // 16pt
            bold: true,
            font: headingFont,
            color: hexAccent,
          },
          paragraph: {
            spacing: {
              after: Math.round(120 * spacingScale),
            },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 26, // 13pt
            bold: true,
            font: headingFont,
            color: hexAccent,
          },
          paragraph: {
            border: {
              bottom: {
                color: hexAccent,
                space: 4,
                value: "single",
                size: 12,
              },
            },
            spacing: {
              before: Math.round(160 * spacingScale),
              after: Math.round(120 * spacingScale),
            },
          },
        },
        {
          id: "Normal",
          name: "Normal",
          quickFormat: true,
          run: {
            font: bodyFont,
            size: 22, // 11pt
          },
        },
      ],
    },
  });

  // Export
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${personalInfo.fullName || "Resume"}.docx`);
  });
};
