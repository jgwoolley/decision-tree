import type { RunnableCheck, WeightedTree } from '../types';

export function isWeightedRunnable(tree: WeightedTree, optionCount: number): RunnableCheck {
  const issues: string[] = [];

  if (optionCount < 2) {
    issues.push('Add at least 2 final options.');
  }

  if (tree.questionOrder.length === 0) {
    issues.push('Add at least one question.');
    return { ok: false, issues };
  }

  let hasAnyScore = false;
  for (const id of tree.questionOrder) {
    const question = tree.questions[id];
    if (!question) continue;
    if (question.choices.length < 2) {
      issues.push(`Question "${question.text}" needs at least 2 answer choices.`);
    }
    for (const choice of question.choices) {
      if (Object.values(choice.scores).some((v) => v !== 0)) hasAnyScore = true;
    }
  }

  if (!hasAnyScore) {
    issues.push('No answer choice contributes points yet — every run will tie.');
  }

  return { ok: issues.length === 0, issues };
}
