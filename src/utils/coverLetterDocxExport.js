/**
 * @file coverLetterDocxExport.js
 * @description Utility functions and helpers for coverLetterDocxExport operations.
 * @author Jonathan T. Miller
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { saveAs } from "file-saver";

export const generateCoverLetterDocx = async (resumeData, htmlContent) => {
  const { personalInfo = {} } = resumeData;
  const children = [];

  // --- Header (Letterhead) ---
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
            size: 20, // 10pt
            color: "555555",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // --- Date ---
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: today, size: 22 }),
      ],
      spacing: { after: 300 },
    })
  );

  // --- Parse HTML content into Paragraphs ---
  // A very simple parser: split by <p> or <br> and strip other tags.
  // We assume the AI returns mostly <p> tags for paragraphs.
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Extract paragraphs
  const elements = tempDiv.childNodes;
  
  elements.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'P') {
      const text = node.textContent.trim();
      if (text) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: text, size: 22 }),
            ],
            spacing: { after: 200 }, // Paragraph spacing
          })
        );
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: text, size: 22 }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    }
  });

  // Generate Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
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
            font: "Arial",
            color: "000000"
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        },
        {
          id: "Normal",
          name: "Normal",
          quickFormat: true,
          run: {
            font: "Arial",
            size: 22, // 11pt
            color: "000000"
          },
        },
      ],
    },
  });

  // Export
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${personalInfo.fullName || "Cover_Letter"}.docx`);
  });
};
