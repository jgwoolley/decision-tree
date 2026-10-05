import { describe, expect, it } from 'vitest';
import { computeScores, rankOptions } from './scoring';
import type { FinalOption, WeightedTree } from '../types';

function buildTree(): { tree: WeightedTree; options: FinalOption[] } {
  const a: FinalOption = { id: 'a', name: 'Jupyter Notebook' };
  const b: FinalOption = { id: 'b', name: 'Spark Job' };
  const options = [a, b];

  const tree: WeightedTree = {
    mode: 'weighted',
    questionOrder: ['q1', 'q2'],
    questions: {
      q1: {
        id: 'q1',
        text: 'Data volume?',
        choices: [
          { id: 'q1c1', text: 'Small', scores: { a: 5, b: 0 } },
          { id: 'q1c2', text: 'Huge', scores: { a: 0, b: 5 } },
        ],
      },
      q2: {
        id: 'q2',
        text: 'Needs scheduling?',
        choices: [
          { id: 'q2c1', text: 'Yes', scores: { a: 0, b: 3 } },
          { id: 'q2c2', text: 'No', scores: { a: 3, b: 0 } },
        ],
      },
    },
  };

  return { tree, options };
}

describe('computeScores', () => {
  it('sums points only from answered questions', () => {
    const { tree, options } = buildTree();
    const scored = computeScores(tree, options, { q1: 'q1c1' });
    expect(scored).toEqual([
      { option: options[0], score: 5 },
      { option: options[1], score: 0 },
    ]);
  });

  it('sums across multiple answered questions', () => {
    const { tree, options } = buildTree();
    const scored = computeScores(tree, options, { q1: 'q1c2', q2: 'q2c1' });
    expect(scored.find((s) => s.option.id === 'b')?.score).toBe(8);
  });

  it('ignores unanswered questions', () => {
    const { tree, options } = buildTree();
    const scored = computeScores(tree, options, {});
    expect(scored.every((s) => s.score === 0)).toBe(true);
  });
});

describe('rankOptions', () => {
  it('ranks by descending score', () => {
    const groups = rankOptions([
      { option: { id: 'a', name: 'A' }, score: 3 },
      { option: { id: 'b', name: 'B' }, score: 8 },
    ]);
    expect(groups.map((g) => g.options[0].id)).toEqual(['b', 'a']);
  });

  it('groups ties into the same rank', () => {
    const groups = rankOptions([
      { option: { id: 'a', name: 'A' }, score: 5 },
      { option: { id: 'b', name: 'B' }, score: 5 },
      { option: { id: 'c', name: 'C' }, score: 1 },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].rank).toBe(1);
    expect(groups[0].options.map((o) => o.id).sort()).toEqual(['a', 'b']);
    expect(groups[1].rank).toBe(2);
  });
});
