"use client";
/**
 * @file ThemeProvider.jsx
 * @description Source file for ThemeProvider.jsx.
 * @author Thabotharan Balachandran
 */
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
