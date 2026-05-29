/* eslint-disable react-refresh/only-export-components */
/**
 * @file layout.jsx
 * @description Source file for layout.jsx.
 * @author Jonathan T. Miller
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import BootstrapClient from "../components/BootstrapClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "JT Resume | Resume Builder",
  description:
    "JT Resume is a premium, developer-grade React web application designed to build ATS-compliant professional resumes tailored for US, Canadian, and Australian formats.",
  keywords:
    "Resume Builder, USA Resume Format, Canada Resume Format, Australia CV Template, ATS Compliant Resume, Developer Resume Maker",
  authors: [{ name: "JTResume Team" }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JTResume'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#090d16',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Roboto+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Cinzel:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
          <BootstrapClient />
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
