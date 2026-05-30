"use client";
/**
 * @file BootstrapClient.jsx
 * @description Source file for BootstrapClient.jsx.
 * @author Thabotharan Balachandran
 */
/**
 * @file BootstrapClient.jsx
 * @description React component rendering the BootstrapClient UI element.
 * @author Thabotharan Balachandran
 */
import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
