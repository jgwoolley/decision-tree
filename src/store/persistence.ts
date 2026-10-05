import type { DecisionTree } from '../types';

const STORAGE_KEY = 'decision-tree-library-v1';

export function loadLibrary(): Record<string, DecisionTree> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

export function saveLibraryDebounced(trees: Record<string, DecisionTree>, delayMs = 300): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
  }, delayMs);
}
