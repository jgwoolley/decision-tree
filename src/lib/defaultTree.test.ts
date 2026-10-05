/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseTreeJsonText } from './exportImport';
import { isSequentialRunnable } from './sequentialValidation';

const defaultTreePath = fileURLToPath(new URL('../../public/default-tree.json', import.meta.url));

describe('default-tree.json', () => {
  it('parses as a valid, runnable sequential tree', () => {
    const text = readFileSync(defaultTreePath, 'utf-8');
    const [tree] = parseTreeJsonText(text);

    expect(tree.mode).toBe('sequential');
    if (tree.mode !== 'sequential') return;

    const optionIds = new Set(tree.options.map((o) => o.id));
    const result = isSequentialRunnable(tree, optionIds);
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });
});
