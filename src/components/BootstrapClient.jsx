"use client";
/**
 * @file BootstrapClient.jsx
 * @description Next.js dynamic wrapper client loader to import and bind bootstrap library JavaScript components after mounting.
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
