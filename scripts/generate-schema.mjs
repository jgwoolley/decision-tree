// Generates schema/decision-tree.schema.json from the DecisionTree type (and its
// JSDoc) in src/types/tree.ts, so the schema can never drift from the real data model.
import { createGenerator } from 'ts-json-schema-generator';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const schemaOutFile = path.join(root, 'schema/decision-tree.schema.json');

export function generateSchema() {
  const schema = createGenerator({
    path: path.join(root, 'src/types/tree.ts'),
    tsconfig: path.join(root, 'tsconfig.app.json'),
    type: 'DecisionTree',
    expose: 'export',
    jsDoc: 'extended',
    topRef: true,
    schemaId: 'https://github.com/jgwoolley/decision-tree/schema/decision-tree.schema.json',
  }).createSchema('DecisionTree');

  // Tree data files may carry a `$schema` pointer so editors (VS Code, etc.) offer
  // hover docs/autocomplete against this exact file. The DecisionTree type itself has
  // no such field, so each branch gets `additionalProperties: false` from the generator
  // and would otherwise reject it — explicitly allow it here rather than loosening
  // additionalProperties everywhere (which would stop catching real typos).
  for (const branch of schema.definitions?.DecisionTree?.anyOf ?? []) {
    branch.properties.$schema = {
      type: 'string',
      description:
        'Points editors at this schema file for hover docs, autocomplete, and validation. Not read by the app itself.',
    };
  }

  return schema;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(schemaOutFile, JSON.stringify(generateSchema(), null, 2) + '\n');
  console.log(`Generated ${path.relative(root, schemaOutFile)}`);
}
