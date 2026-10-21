"use client";

import { useSyncExternalStore } from "react";

export default function CopyrightYear() {
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );

  return <>{year ?? ""}</>;
}
