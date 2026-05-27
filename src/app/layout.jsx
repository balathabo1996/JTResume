import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "JTResume | Premium Multi-Country ATS Resume Builder",
  description:
    "JTResume is a premium, developer-grade React web application designed to build ATS-compliant professional resumes tailored for US, Canadian, and Australian formats.",
  keywords:
    "Resume Builder, USA Resume Format, Canada Resume Format, Australia CV Template, ATS Compliant Resume, Developer Resume Maker",
  authors: [{ name: "JTResume Team" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: "#090d16" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
