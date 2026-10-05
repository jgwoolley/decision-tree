import { describe, expect, it } from 'vitest';
import { detectCycle, findOrphanedQuestions, isSequentialRunnable } from './sequentialValidation';
import type { SequentialTree } from '../types';

function linearTree(): SequentialTree {
  return {
    mode: 'sequential',
    rootQuestionId: 'q1',
    questions: {
      q1: {
        id: 'q1',
        text: 'Root',
        choices: [
          { id: 'c1', text: 'Go to q2', nextQuestionId: 'q2' },
          { id: 'c2', text: 'End at A', leafOptionId: 'optA' },
        ],
      },
      q2: {
        id: 'q2',
        text: 'Second',
        choices: [
          { id: 'c3', text: 'End at A', leafOptionId: 'optA' },
          { id: 'c4', text: 'End at B', leafOptionId: 'optB' },
        ],
      },
    },
  };
}

describe('detectCycle', () => {
  it('returns false for a well-formed tree', () => {
    expect(detectCycle(linearTree())).toBe(false);
  });

  it('returns true when a question points back at an ancestor', () => {
    const tree = linearTree();
    tree.questions.q2.choices[0] = { id: 'c3', text: 'Back to root', nextQuestionId: 'q1' };
    expect(detectCycle(tree)).toBe(true);
  });
});

describe('findOrphanedQuestions', () => {
  it('finds questions unreachable from the root', () => {
    const tree = linearTree();
    tree.questions.q3 = { id: 'q3', text: 'Orphan', choices: [] };
    expect(findOrphanedQuestions(tree)).toEqual(['q3']);
  });

  it('returns nothing when every question is reachable', () => {
    expect(findOrphanedQuestions(linearTree())).toEqual([]);
  });
});

describe('isSequentialRunnable', () => {
  const optionIds = new Set(['optA', 'optB']);

  it('is runnable for a fully wired tree with 2+ options', () => {
    expect(isSequentialRunnable(linearTree(), optionIds).ok).toBe(true);
  });

  it('flags choices that are not wired to a question or option', () => {
    const tree = linearTree();
    tree.questions.q2.choices[0] = { id: 'c3', text: 'Unwired' };
    const result = isSequentialRunnable(tree, optionIds);
    expect(result.ok).toBe(false);
  });

  it('flags fewer than 2 final options', () => {
    const result = isSequentialRunnable(linearTree(), new Set(['optA']));
    expect(result.ok).toBe(false);
  });
});
