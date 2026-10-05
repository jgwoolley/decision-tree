import { createId } from './id';
import type { DecisionTree } from '../types';

export class ImportError extends Error {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertValidTree(value: unknown): DecisionTree {
  if (!isPlainObject(value)) {
    throw new ImportError('File does not contain a decision tree object.');
  }
  if (value.schemaVersion !== 1) {
    throw new ImportError('Unsupported or missing schema version.');
  }
  if (value.mode !== 'sequential' && value.mode !== 'weighted') {
    throw new ImportError('Tree is missing a valid mode.');
  }
  if (typeof value.name !== 'string' || !Array.isArray(value.options)) {
    throw new ImportError('Tree is missing required fields (name/options).');
  }
  if (!isPlainObject(value.questions)) {
    throw new ImportError('Tree is missing its questions map.');
  }
  return value as unknown as DecisionTree;
}

export function downloadTreeAsJson(tree: DecisionTree): void {
  const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tree.name.replace(/[^a-z0-9-_]+/gi, '_') || 'decision-tree'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadLibraryAsJson(trees: DecisionTree[]): void {
  const blob = new Blob([JSON.stringify(trees, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'decision-tree-library.json';
  link.click();
  URL.revokeObjectURL(url);
}

/** Parses JSON text into one or more validated trees, preserving whatever ids it contains. */
export function parseTreeJsonText(text: string): DecisionTree[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError('File is not valid JSON.');
  }

  const rawTrees = Array.isArray(parsed) ? parsed : [parsed];
  return rawTrees.map((raw) => assertValidTree(raw));
}

/** Assigns each tree a fresh id so it can never collide with one already in the library. */
function withFreshIds(trees: DecisionTree[]): DecisionTree[] {
  return trees.map((tree) => ({ ...tree, id: createId(), updatedAt: new Date().toISOString() }));
}

/** Parses an imported JSON file into one or more trees, assigning each a fresh id. */
export async function parseImportedFile(file: File): Promise<DecisionTree[]> {
  return withFreshIds(parseTreeJsonText(await file.text()));
}

/** Fetches the bundled example tree(s) from /default-tree.json, assigning fresh ids. */
export async function fetchDefaultTree(): Promise<DecisionTree[]> {
  const response = await fetch('default-tree.json');
  if (!response.ok) {
    throw new ImportError('Could not load the example tree.');
  }
  return withFreshIds(parseTreeJsonText(await response.text()));
}
