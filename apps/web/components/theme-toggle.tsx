"use client";

import * as React from "react";

import { Button } from "@pixeldosa/ui";

/**
 * Light/dark switch. Reads the class the inline boot script already applied so
 * the button label is correct on first paint rather than flipping after hydration.
 */
export function ThemeToggle() {
  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("pd-theme", next ? "dark" : "light");
    } catch {
      // Private-mode storage failures must not break the toggle.
    }
    setDark(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
        {dark ? (
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </Button>
  );
}
