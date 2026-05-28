"use client";

/**
 * @file BootstrapClient.jsx
 * @description React component rendering the BootstrapClient UI element.
 * @author Jonathan T. Miller
 */
import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
