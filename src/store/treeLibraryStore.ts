import { create } from 'zustand';
import { createId } from '../lib/id';
import {
  createOption,
  createSequentialChoice,
  createSequentialQuestion,
  createTree,
  createWeightedChoice,
  createWeightedQuestion,
} from '../lib/treeFactory';
import { loadLibrary, saveLibraryDebounced } from './persistence';
import type {
  DecisionTree,
  SequentialQuestion,
  SequentialTree,
  TreeMode,
  WeightedQuestion,
  WeightedTree,
} from '../types';

interface TreeLibraryState {
  trees: Record<string, DecisionTree>;
  createTree: (name: string, description: string, mode: TreeMode) => string;
  deleteTree: (id: string) => void;
  duplicateTree: (id: string) => string | undefined;
  importTrees: (trees: DecisionTree[]) => void;
  updateTreeMeta: (id: string, patch: { name?: string; description?: string }) => void;

  addOption: (id: string, name: string) => void;
  renameOption: (id: string, optionId: string, name: string) => void;
  deleteOption: (id: string, optionId: string) => void;

  updateQuestionText: (id: string, questionId: string, text: string) => void;
  updateChoiceText: (id: string, questionId: string, choiceId: string, text: string) => void;

  addSequentialRoot: (id: string) => void;
  deleteSequentialQuestion: (id: string, questionId: string) => void;
  addSequentialChoice: (id: string, questionId: string) => void;
  deleteSequentialChoice: (id: string, questionId: string, choiceId: string) => void;
  wireChoiceToNewQuestion: (id: string, questionId: string, choiceId: string) => void;
  wireChoiceToExistingQuestion: (
    id: string,
    questionId: string,
    choiceId: string,
    targetQuestionId: string,
  ) => void;
  wireChoiceToOption: (id: string, questionId: string, choiceId: string, optionId: string) => void;

  addWeightedQuestion: (id: string) => void;
  deleteWeightedQuestion: (id: string, questionId: string) => void;
  reorderWeightedQuestion: (id: string, questionId: string, direction: 'up' | 'down') => void;
  addWeightedChoice: (id: string, questionId: string) => void;
  deleteWeightedChoice: (id: string, questionId: string, choiceId: string) => void;
  setChoiceScore: (
    id: string,
    questionId: string,
    choiceId: string,
    optionId: string,
    points: number,
  ) => void;
}

function touch<T extends DecisionTree>(tree: T): T {
  return { ...tree, updatedAt: new Date().toISOString() };
}

/** Applies `fn` to the tree with the given id and persists the result. */
function mutate(
  set: (fn: (state: TreeLibraryState) => Partial<TreeLibraryState>) => void,
  id: string,
  fn: (tree: DecisionTree) => DecisionTree,
) {
  set((state) => {
    const existing = state.trees[id];
    if (!existing) return {};
    return { trees: { ...state.trees, [id]: touch(fn(existing)) } };
  });
}

export const useTreeLibraryStore = create<TreeLibraryState>((set, get) => ({
  trees: loadLibrary(),

  createTree: (name, description, mode) => {
    const tree = createTree(name, description, mode);
    set((state) => ({ trees: { ...state.trees, [tree.id]: tree } }));
    return tree.id;
  },

  deleteTree: (id) => {
    set((state) => {
      const next = { ...state.trees };
      delete next[id];
      return { trees: next };
    });
  },

  duplicateTree: (id) => {
    const source = get().trees[id];
    if (!source) return undefined;
    const now = new Date().toISOString();
    const copy: DecisionTree = {
      ...source,
      id: createId(),
      name: `${source.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ trees: { ...state.trees, [copy.id]: copy } }));
    return copy.id;
  },

  importTrees: (trees) => {
    set((state) => {
      const next = { ...state.trees };
      for (const tree of trees) next[tree.id] = tree;
      return { trees: next };
    });
  },

  updateTreeMeta: (id, patch) => {
    mutate(set, id, (tree) => ({
      ...tree,
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.description !== undefined ? { description: patch.description || undefined } : {}),
    }));
  },

  addOption: (id, name) => {
    mutate(set, id, (tree) => ({ ...tree, options: [...tree.options, createOption(name)] }));
  },

  renameOption: (id, optionId, name) => {
    mutate(set, id, (tree) => ({
      ...tree,
      options: tree.options.map((o) => (o.id === optionId ? { ...o, name } : o)),
    }));
  },

  deleteOption: (id, optionId) => {
    mutate(set, id, (tree) => {
      const options = tree.options.filter((o) => o.id !== optionId);
      if (tree.mode === 'sequential') {
        const questions: Record<string, SequentialQuestion> = {};
        for (const [qid, q] of Object.entries(tree.questions)) {
          questions[qid] = {
            ...q,
            choices: q.choices.map((c) =>
              c.leafOptionId === optionId ? { ...c, leafOptionId: undefined } : c,
            ),
          };
        }
        return { ...tree, options, questions };
      }
      const questions: Record<string, WeightedQuestion> = {};
      for (const [qid, q] of Object.entries(tree.questions)) {
        questions[qid] = {
          ...q,
          choices: q.choices.map((c) => {
            const scores = { ...c.scores };
            delete scores[optionId];
            return { ...c, scores };
          }),
        };
      }
      return { ...tree, options, questions };
    });
  },

  updateQuestionText: (id, questionId, text) => {
    mutate(set, id, (tree) => {
      if (tree.mode === 'sequential') {
        const question = tree.questions[questionId];
        if (!question) return tree;
        return { ...tree, questions: { ...tree.questions, [questionId]: { ...question, text } } };
      }
      const question = tree.questions[questionId];
      if (!question) return tree;
      return { ...tree, questions: { ...tree.questions, [questionId]: { ...question, text } } };
    });
  },

  updateChoiceText: (id, questionId, choiceId, text) => {
    mutate(set, id, (tree) => {
      if (tree.mode === 'sequential') {
        const question = tree.questions[questionId];
        if (!question) return tree;
        return {
          ...tree,
          questions: {
            ...tree.questions,
            [questionId]: {
              ...question,
              choices: question.choices.map((c) => (c.id === choiceId ? { ...c, text } : c)),
            },
          },
        };
      }
      const question = tree.questions[questionId];
      if (!question) return tree;
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: {
            ...question,
            choices: question.choices.map((c) => (c.id === choiceId ? { ...c, text } : c)),
          },
        },
      };
    });
  },

  addSequentialRoot: (id) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential' || tree.rootQuestionId) return tree;
      const root = createSequentialQuestion('What is the first question?');
      return { ...tree, rootQuestionId: root.id, questions: { ...tree.questions, [root.id]: root } };
    });
  },

  deleteSequentialQuestion: (id, questionId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential') return tree;

      const toDelete = new Set<string>();
      const stack = [questionId];
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (toDelete.has(current)) continue;
        toDelete.add(current);
        const q = tree.questions[current];
        if (q) {
          for (const c of q.choices) {
            if (c.nextQuestionId) stack.push(c.nextQuestionId);
          }
        }
      }

      const questions: Record<string, SequentialQuestion> = {};
      for (const [qid, q] of Object.entries(tree.questions)) {
        if (toDelete.has(qid)) continue;
        questions[qid] = {
          ...q,
          choices: q.choices.map((c) =>
            c.nextQuestionId && toDelete.has(c.nextQuestionId)
              ? { ...c, nextQuestionId: undefined }
              : c,
          ),
        };
      }

      const rootQuestionId = toDelete.has(tree.rootQuestionId ?? '') ? null : tree.rootQuestionId;
      return { ...tree, questions, rootQuestionId };
    });
  },

  addSequentialChoice: (id, questionId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      const choice = createSequentialChoice(`Answer ${question.choices.length + 1}`);
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: { ...question, choices: [...question.choices, choice] },
        },
      };
    });
  },

  deleteSequentialChoice: (id, questionId, choiceId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: {
            ...question,
            choices: question.choices.filter((c) => c.id !== choiceId),
          },
        },
      };
    });
  },

  wireChoiceToNewQuestion: (id, questionId, choiceId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      const newQuestion = createSequentialQuestion('New question');
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [newQuestion.id]: newQuestion,
          [questionId]: {
            ...question,
            choices: question.choices.map((c) =>
              c.id === choiceId
                ? { ...c, nextQuestionId: newQuestion.id, leafOptionId: undefined }
                : c,
            ),
          },
        },
      };
    });
  },

  wireChoiceToExistingQuestion: (id, questionId, choiceId, targetQuestionId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: {
            ...question,
            choices: question.choices.map((c) =>
              c.id === choiceId
                ? { ...c, nextQuestionId: targetQuestionId, leafOptionId: undefined }
                : c,
            ),
          },
        },
      };
    });
  },

  wireChoiceToOption: (id, questionId, choiceId, optionId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'sequential') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: {
            ...question,
            choices: question.choices.map((c) =>
              c.id === choiceId ? { ...c, leafOptionId: optionId, nextQuestionId: undefined } : c,
            ),
          },
        },
      };
    });
  },

  addWeightedQuestion: (id) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'weighted') return tree;
      const question = createWeightedQuestion('New question', tree.options);
      return {
        ...tree,
        questionOrder: [...tree.questionOrder, question.id],
        questions: { ...tree.questions, [question.id]: question },
      };
    });
  },

  deleteWeightedQuestion: (id, questionId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'weighted') return tree;
      const questions = { ...tree.questions };
      delete questions[questionId];
      return {
        ...tree,
        questions,
        questionOrder: tree.questionOrder.filter((qid) => qid !== questionId),
      };
    });
  },

  reorderWeightedQuestion: (id, questionId, direction) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'weighted') return tree;
      const order = [...tree.questionOrder];
      const index = order.indexOf(questionId);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= order.length) return tree;
      [order[index], order[targetIndex]] = [order[targetIndex], order[index]];
      return { ...tree, questionOrder: order };
    });
  },

  addWeightedChoice: (id, questionId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'weighted') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      const choice = createWeightedChoice(`Answer ${question.choices.length + 1}`, tree.options);
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: { ...question, choices: [...question.choices, choice] },
        },
      };
    });
  },

  deleteWeightedChoice: (id, questionId, choiceId) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'weighted') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: {
            ...question,
            choices: question.choices.filter((c) => c.id !== choiceId),
          },
        },
      };
    });
  },

  setChoiceScore: (id, questionId, choiceId, optionId, points) => {
    mutate(set, id, (tree) => {
      if (tree.mode !== 'weighted') return tree;
      const question = tree.questions[questionId];
      if (!question) return tree;
      return {
        ...tree,
        questions: {
          ...tree.questions,
          [questionId]: {
            ...question,
            choices: question.choices.map((c) =>
              c.id === choiceId ? { ...c, scores: { ...c.scores, [optionId]: points } } : c,
            ),
          },
        },
      };
    });
  },
}));

useTreeLibraryStore.subscribe((state) => {
  saveLibraryDebounced(state.trees);
});

export type { SequentialTree, WeightedTree };
