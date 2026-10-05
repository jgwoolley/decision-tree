/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateSchema, schemaOutFile } from '../../scripts/generate-schema.mjs';

describe('schema/decision-tree.schema.json', () => {
  it('matches what generating from src/types/tree.ts produces right now', () => {
    const committed = JSON.parse(readFileSync(schemaOutFile, 'utf-8'));
    const fresh = generateSchema();

    expect(committed).toEqual(fresh);
  });
});
