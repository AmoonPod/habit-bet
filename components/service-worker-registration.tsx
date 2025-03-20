"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker only on the client side
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "ServiceWorker registration successful with scope:",
              registration.scope
            );
          })
          .catch((error) => {
            console.error("ServiceWorker registration failed:", error);
          });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
