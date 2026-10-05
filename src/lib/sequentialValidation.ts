import type { RunnableCheck, SequentialQuestion, SequentialTree } from '../types';

/** Defensive DFS cycle check. The editor's wiring rules (a question can only be
 * targeted by one choice) should make cycles impossible by construction, but this
 * stands as a safety net in case that constraint is ever relaxed. */
export function detectCycle(tree: SequentialTree): boolean {
  if (!tree.rootQuestionId) return false;

  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(questionId: string): boolean {
    if (visiting.has(questionId)) return true;
    if (visited.has(questionId)) return false;

    visiting.add(questionId);
    const question = tree.questions[questionId];
    if (question) {
      for (const choice of question.choices) {
        if (choice.nextQuestionId && visit(choice.nextQuestionId)) return true;
      }
    }
    visiting.delete(questionId);
    visited.add(questionId);
    return false;
  }

  return visit(tree.rootQuestionId);
}

export function findOrphanedQuestions(tree: SequentialTree): string[] {
  const referenced = new Set<string>();
  for (const question of Object.values(tree.questions)) {
    for (const choice of question.choices) {
      if (choice.nextQuestionId) referenced.add(choice.nextQuestionId);
    }
  }

  return Object.keys(tree.questions).filter(
    (id) => id !== tree.rootQuestionId && !referenced.has(id),
  );
}

/** Questions safe to wire a given choice to, without creating a second parent (and
 * therefore a cycle) or re-pointing at the root. Excludes the question that currently
 * owns the choice and any question other choices already point to, but keeps whatever
 * this specific choice already points to so the current selection still shows up. */
export function getAvailableTargetQuestions(
  tree: SequentialTree,
  questionId: string,
  choiceId: string,
): SequentialQuestion[] {
  const referenced = new Set<string>();
  for (const question of Object.values(tree.questions)) {
    for (const choice of question.choices) {
      if (choice.id !== choiceId && choice.nextQuestionId) referenced.add(choice.nextQuestionId);
    }
  }

  return Object.values(tree.questions).filter(
    (q) => q.id !== questionId && q.id !== tree.rootQuestionId && !referenced.has(q.id),
  );
}

export function isSequentialRunnable(
  tree: SequentialTree,
  optionIds: Set<string>,
): RunnableCheck {
  const issues: string[] = [];

  if (optionIds.size < 2) {
    issues.push('Add at least 2 final options.');
  }

  if (!tree.rootQuestionId || Object.keys(tree.questions).length === 0) {
    issues.push('Add at least one question.');
    return { ok: false, issues };
  }

  const incomplete: string[] = [];
  for (const question of Object.values(tree.questions)) {
    if (question.choices.length === 0) {
      issues.push(`Question "${question.text}" has no answer choices.`);
      continue;
    }
    for (const choice of question.choices) {
      const hasNext = Boolean(choice.nextQuestionId);
      const hasLeaf = Boolean(choice.leafOptionId);
      if (hasNext === hasLeaf) {
        incomplete.push(`${question.text} -> ${choice.text}`);
      } else if (hasLeaf && choice.leafOptionId && !optionIds.has(choice.leafOptionId)) {
        issues.push(`Answer "${choice.text}" points to a final option that no longer exists.`);
      }
    }
  }
  if (incomplete.length > 0) {
    issues.push(`${incomplete.length} answer choice(s) are not wired to a question or option.`);
  }

  if (detectCycle(tree)) {
    issues.push('The question graph contains a cycle.');
  }

  const orphans = findOrphanedQuestions(tree);
  if (orphans.length > 0) {
    issues.push(`${orphans.length} question(s) are unreachable from the root.`);
  }

  return { ok: issues.length === 0, issues };
}
