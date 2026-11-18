import { useSyncExternalStore } from "react";
import type { ToolId } from "./tools";

export type Activity = { id: string; tool: ToolId; title: string; at: number };

const KEY = "wpa-activity-v1";
const MAX = 20;
const listeners = new Set<() => void>();
let cache: Activity[] | null = null;
const EMPTY: Activity[] = [];

function read(): Activity[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Activity[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

export function addActivity(tool: ToolId, title: string) {
  const entry: Activity = {
    id: crypto.randomUUID(),
    tool,
    title: title.trim().slice(0, 90) || "Untitled",
    at: Date.now(),
  };
  cache = [entry, ...read()].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage full or blocked — keep in memory */
  }
  listeners.forEach((l) => l());
}

export function clearActivity() {
  cache = [];
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useActivity(): Activity[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
