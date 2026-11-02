"use client";

import { useEffect, useState } from "react";

/** The current year. The page is static, so the build year is rendered first and the visitor's clock takes over. */
export default function Year() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <span suppressHydrationWarning>{year}</span>;
}
